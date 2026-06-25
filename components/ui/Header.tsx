import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart, RefreshCw, Palette } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useCampaign } from '../../contexts/CampaignContext';
import { CampaignType } from '../../types/schema';

interface HeaderProps {
  title?: string;
  onCartPress?: () => void;
  onCampaignSwitch?: (campaignId: CampaignType) => void;
  refreshing?: boolean;
}

const campaignEmojis: Record<CampaignType, string> = {
  'BACK_TO_SCHOOL': '📚',
  'SUMMER_PLAYHOUSE': '🏖️',
  'MYSTERY_GIFT_CARNIVAL': '🎁',
};

const campaignLabels: Record<CampaignType, string> = {
  'BACK_TO_SCHOOL': 'Back to School',
  'SUMMER_PLAYHOUSE': 'Summer Festival',
  'MYSTERY_GIFT_CARNIVAL': 'Carnival',
};

const HeaderInner: React.FC<HeaderProps> = ({
  title = 'Home',
  onCartPress,
  onCampaignSwitch,
  refreshing,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, campaignTheme, activeCampaignType } = useTheme();
  const { cart } = useCart();
  const { switchCampaign, getAvailableCampaigns } = useCampaign();

  const campaigns = getAvailableCampaigns();
  const cartCount = cart.totalItems;

  const backgroundColor = campaignTheme?.background || colors.background;
  const primaryColor = campaignTheme?.primary || colors.primary;

  const handleCampaignPress = useCallback(() => {
    if (!onCampaignSwitch) {
      const currentIndex = campaigns.findIndex((c) => c.id === activeCampaignType);
      const nextIndex = (currentIndex + 1) % campaigns.length;
      switchCampaign(campaigns[nextIndex].id);
    } else if (activeCampaignType) {
      onCampaignSwitch(activeCampaignType);
    }
  }, [onCampaignSwitch, campaigns, activeCampaignType, switchCampaign]);

  const renderCampaignButtons = useMemo(() => {
    return campaigns.map((campaign) => {
      const isActive = campaign.id === activeCampaignType;
      return (
        <TouchableOpacity
          key={campaign.id}
          style={[
            styles.campaignButton,
            isActive && { backgroundColor: campaignTheme?.primary || colors.primary },
          ]}
          onPress={() => switchCampaign(campaign.id)}
        >
          <Text style={[styles.campaignButtonText, isActive && styles.campaignButtonTextActive]}>
            {campaignEmojis[campaign.id]}
          </Text>
        </TouchableOpacity>
      );
    });
  }, [campaigns, activeCampaignType, campaignTheme, colors.primary, switchCampaign]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {activeCampaignType && (
            <View style={[styles.campaignBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.campaignBadgeText}>
                {campaignEmojis[activeCampaignType!]} {campaignLabels[activeCampaignType!]}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          <View style={styles.campaignSelector}>
            {renderCampaignButtons}
          </View>

          <TouchableOpacity
            style={[styles.cartButton, { borderColor: primaryColor }]}
            onPress={onCartPress}
            accessible={true}
            accessibilityLabel={`Shopping cart with ${cartCount} items`}
          >
            <ShoppingCart size={22} color={primaryColor} />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: primaryColor }]}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingBottom: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    height: 50,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  campaignBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
  },
  campaignBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  campaignSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(123,0,204,0.25)',
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    gap: SPACING.xs,
  },
  campaignButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  campaignButtonText: {
    fontSize: 16,
  },
  campaignButtonTextActive: {
    fontSize: 16,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

const Header = memo(HeaderInner);

Header.displayName = 'Header';

export default Header;

export type { HeaderProps };
