import React, { memo, useCallback, useMemo } from 'react'; // useMemo kept for themeColor
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { DynamicCollectionBlock } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import ProductItem from '../ui/ProductItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 156;
const ITEM_SPACING = SPACING.sm;

interface DynamicCollectionProps {
  block: DynamicCollectionBlock;
  index?: number;
}

const DynamicCollectionInner: React.FC<DynamicCollectionProps> = ({ block, index = 0 }) => {
  const { colors, campaignTheme, activeCampaignType } = useTheme();

  const themeColor = useMemo(() => {
    if (activeCampaignType && campaignTheme) {
      return campaignTheme.primary;
    }
    return colors.primary;
  }, [activeCampaignType, campaignTheme, colors.primary]);

  const sortedItems = useMemo(() => {
    return [...block.items].sort((a, b) => a.name.localeCompare(b.name));
  }, [block.items]);

  const keyExtractor = useCallback((item: typeof block.items[0]) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_WIDTH + ITEM_SPACING,
      offset: (ITEM_WIDTH + ITEM_SPACING) * index,
      index,
    }),
    []
  );

  const renderProduct = useCallback(
    ({ item }: { item: typeof block.items[0] }) => (
      <ProductItem
        product={item}
        size="medium"
        variant="carousel"
        showRating={true}
      />
    ),
    []
  );


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.themeIndicator, { backgroundColor: themeColor }]} />
        <Text style={[styles.title, { color: colors.text }]}>{block.title}</Text>
        <Text style={[styles.theme, { color: colors.textSecondary }]}>{block.theme}</Text>
      </View>

      <FlatList
        data={sortedItems}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={3}
        initialNumToRender={4}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        alwaysBounceHorizontal={false}
        canCancelContentTouches={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  themeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    flex: 1,
  },
  theme: {
    ...TYPOGRAPHY.body2,
    marginLeft: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
});

const DynamicCollection = memo(DynamicCollectionInner, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.index === nextProps.index
  );
});

DynamicCollection.displayName = 'DynamicCollection';

export default DynamicCollection;

export type { DynamicCollectionProps };
