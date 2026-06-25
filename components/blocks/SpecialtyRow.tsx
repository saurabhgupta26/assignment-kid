import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Animated } from 'react-native';
import { SpecialtyRowBlock } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import { useCampaign } from '../../contexts/CampaignContext';
import ProductItem from '../ui/ProductItem';

interface SpecialtyRowProps {
  block: SpecialtyRowBlock;
  index?: number;
}

const SpecialtyRowInner: React.FC<SpecialtyRowProps> = ({ block, index = 0 }) => {
  const { colors } = useTheme();
  const { activeCampaign } = useCampaign();

  const campaignTheme = activeCampaign?.theme;

  const keyExtractor = useCallback((item: typeof block.items[0]) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: 160 + SPACING.sm,
      offset: (160 + SPACING.sm) * index,
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

  const gradientColors = useMemo((): [string, string] => {
    if (campaignTheme) {
      return [campaignTheme.primary + '10', campaignTheme.secondary + '05'];
    }
    return [colors.primary + '10', colors.secondary + '05'];
  }, [campaignTheme, colors.primary, colors.secondary]);

  const accentColor = campaignTheme?.primary || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: '#260044' }]}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.iconEmoji, { color: accentColor }]}>
            {block.campaignId === 'BACK_TO_SCHOOL' ? '📚' :
             block.campaignId === 'SUMMER_PLAYHOUSE' ? '🏖️' :
             block.campaignId === 'MYSTERY_GIFT_CARNIVAL' ? '🎁' : '✨'}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{block.title}</Text>
      </View>

      <FlatList
        data={block.items}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={160 + SPACING.sm}
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  iconEmoji: {
    fontSize: 18,
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.lg,
  },
});

const SpecialtyRow = memo(SpecialtyRowInner);

SpecialtyRow.displayName = 'SpecialtyRow';

export default SpecialtyRow;

export type { SpecialtyRowProps };
