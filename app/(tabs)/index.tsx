import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { createActionDispatcher } from '@/services/ActionDispatcher';
import ComponentRegistryProvider from '@/components/core/ComponentRegistryProvider';
import HomepageRenderer from '@/components/core/HomepageRenderer';
import CampaignOverlay from '@/components/blocks/CampaignOverlay';
import Header from '@/components/ui/Header';
import { mockHomepagePayload } from '@/data/mockPayload';
import { Product, ComponentBlock, CampaignType, SpecialtyRowBlock } from '@/types/schema';

const productRegistry = new Map<string, Product>();

mockHomepagePayload.components.forEach((block) => {
  if ('products' in block) {
    block.products.forEach((p) => productRegistry.set(p.id, p));
  }
  if ('items' in block) {
    block.items.forEach((p) => productRegistry.set(p.id, p));
  }
});

mockHomepagePayload.campaigns.forEach((campaign) => {
  if (campaign.specialtyComponent?.items) {
    campaign.specialtyComponent.items.forEach((p) => productRegistry.set(p.id, p));
  }
});

const getProductById = (id: string): Product | undefined => productRegistry.get(id);
const COLLECTION_THEME_TO_CAMPAIGN: Record<string, CampaignType> = {
  'Daily Essentials': 'BACK_TO_SCHOOL',
  'Summer Collection': 'SUMMER_PLAYHOUSE',
  'Birthday Collection': 'MYSTERY_GIFT_CARNIVAL',
};

const getBlockCampaign = (block: ComponentBlock): CampaignType | null => {
  if ('campaignContext' in block && block.campaignContext) {
    return block.campaignContext;
  }
  if ('campaignId' in block && block.campaignId) {
    return block.campaignId;
  }
  if (block.type === 'DYNAMIC_COLLECTION') {
    return COLLECTION_THEME_TO_CAMPAIGN[block.theme] ?? null;
  }
  return null;
};

const sortComponentsByCampaign = (
  components: ComponentBlock[],
  activeCampaignType: CampaignType | null
): ComponentBlock[] => {
  if (!activeCampaignType) return components;

  return components
    .map((block, index) => ({ block, index }))
    .sort((a, b) => {
      const aMatch = getBlockCampaign(a.block) === activeCampaignType ? 0 : 1;
      const bMatch = getBlockCampaign(b.block) === activeCampaignType ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.index - b.index; // stable sort within same priority
    })
    .map(({ block }) => block);
};

const buildSpecialtyRow = (
  activeCampaignType: CampaignType | null,
  activeCampaign: ReturnType<typeof useCampaign>['activeCampaign']
): SpecialtyRowBlock | null => {
  if (!activeCampaignType || !activeCampaign?.specialtyComponent?.items?.length) {
    return null;
  }

  return {
    id: `specialty-${activeCampaignType}`,
    type: 'SPECIALTY_ROW',
    title: activeCampaign.specialtyComponent.title,
    campaignId: activeCampaignType,
    items: activeCampaign.specialtyComponent.items,
  };
};

export default function HomeScreen() {
  const { theme, campaignTheme } = useTheme();
  const { addToCart } = useCart();
  const { activeCampaign, activeCampaignType } = useCampaign();
  const [refreshing, setRefreshing] = useState(false);

  const dispatcher = useMemo(() => {
    const instance = createActionDispatcher();

    instance.registerHandler('ADD_TO_CART', (payload) => {
      if (payload.id) {
        const product = getProductById(payload.id);
        if (product) {
          addToCart(product);
        }
      }
    });

    instance.registerHandler('DEEP_LINK', (payload) => {
      if (__DEV__) {
        console.log('[Action] Deep link:', payload.url);
      }
    });

    instance.registerHandler('NAVIGATE', (payload) => {
      if (__DEV__) {
        console.log('[Action] Navigate:', payload.screen);
      }
    });

    instance.registerHandler('APPLY_MYSTERY_GIFT_COUPON', (payload) => {
      if (__DEV__) {
        console.log('[Action] Apply mystery gift coupon:', payload.couponCode);
      }
    });

    instance.registerHandler('BOOK_EVENT', (payload) => {
      if (__DEV__) {
        console.log('[Action] Book event:', payload.eventId);
      }
    });

    return instance;
  }, [addToCart]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const effectiveTheme = campaignTheme || theme;

  const sortedComponents = useMemo(() => {
    const sorted = sortComponentsByCampaign(
      mockHomepagePayload.components,
      activeCampaignType
    );
    const specialtyRow = buildSpecialtyRow(activeCampaignType, activeCampaign);
    return specialtyRow ? [specialtyRow, ...sorted] : sorted;
  }, [activeCampaignType, activeCampaign]);

  return (
    <ComponentRegistryProvider dispatcher={dispatcher}>
      {(registry) => (
        <View style={[styles.container, { backgroundColor: effectiveTheme.background }]}>
          <CampaignOverlay visible={true} />

          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Header
              title="Home"
              refreshing={refreshing}
              onCartPress={() => router.push('/cart')}
            />
          </SafeAreaView>

          <HomepageRenderer
            key={activeCampaignType ?? 'none'}
            components={sortedComponents}
            registry={registry}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No products available</Text>
              </View>
            }
          />

          <CartFooter />
        </View>
      )}
    </ComponentRegistryProvider>
  );
}

const CartFooter: React.FC = () => {
  const { cart } = useCart();
  const { colors } = useTheme();

  if (cart.totalItems === 0) return null;

  const deliveryFee = 25;
  const total = cart.totalAmount + deliveryFee;

  return (
    <View style={[
      styles.footer,
      { borderTopColor: colors.border, backgroundColor: colors.card },
    ]}>
      <View style={styles.footerContent}>
        <View style={styles.footerLeft}>
          <Text style={[styles.footerItemCount, { color: colors.text }]}>
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.footerAmount, { color: colors.text }]}>
            {(total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')} incl. delivery
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.checkoutButtonText}>VIEW CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    zIndex: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#C4A0E8',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 50,
    marginHorizontal: 20,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flex: 1,
  },
  footerItemCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
