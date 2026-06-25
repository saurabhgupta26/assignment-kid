import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ProductGrid2x2Block } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import ProductItem from '../ui/ProductItem';

interface ProductGrid2x2Props {
  block: ProductGrid2x2Block;
  index?: number;
}

const ProductGrid2x2Inner: React.FC<ProductGrid2x2Props> = ({ block, index = 0 }) => {
  const { colors } = useTheme();

  const keyExtractor = useCallback((item: typeof block.products[0]) => item.id, []);

  const numColumns = 2;

  const renderProduct = useCallback(
    ({ item }: { item: typeof block.products[0] }) => (
      <ProductItem product={item} size="small" variant="grid" />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{block.title}</Text>
      </View>

      <FlatList
        data={block.products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={1}
        initialNumToRender={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  headerRow: {
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '600',
  },
  gridContainer: {
    paddingVertical: SPACING.xs,
  },
  row: {
    justifyContent: 'space-between',
  },
});

const ProductGrid2x2 = memo(ProductGrid2x2Inner, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.index === nextProps.index
  );
});

ProductGrid2x2.displayName = 'ProductGrid2x2';

export default ProductGrid2x2;

export type { ProductGrid2x2Props };
