import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Product } from '../../types/schema';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import SafeImage from './SafeImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductItemProps {
  product: Product;
  onPress?: () => void;
  onAction?: (action: Product['action']) => void;
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
  variant?: 'grid' | 'carousel' | 'list';
}

const ProductItemInner: React.FC<ProductItemProps> = ({
  product,
  onPress,
  onAction,
  size = 'medium',
  showRating = true,
  variant = 'grid',
}) => {
  const { colors } = useTheme();
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  const quantity = getItemQuantity(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = useCallback(() => {
    if (onAction) {
      onAction(product.action);
    } else if (product.action.type === 'ADD_TO_CART') {
      addToCart(product);
    }
  }, [product, addToCart, onAction]);

  const handleIncrement = useCallback(() => {
    addToCart(product);
  }, [product, addToCart]);

  const handleDecrement = useCallback(() => {
    updateQuantity(product.id, quantity - 1);
  }, [product.id, quantity, updateQuantity]);

  const discountPercentage = useMemo(() => {
    if (hasDiscount && product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return null;
  }, [hasDiscount, product.originalPrice, product.price]);

  const formatPrice = (p: number) =>
    p.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '');

  // ─── Grid variant: food-delivery style card ────────────────────────────────
  if (variant === 'grid') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          { backgroundColor: colors.card },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`${product.name}, price ${product.price} rupees`}
      >
        <View style={styles.gridImageWrapper}>
          <SafeImage
            source={product.image}
            style={styles.gridImage}
            resizeMode="cover"
            accessible={false}
          />
        </View>

        <View style={styles.gridBody}>
          <View style={styles.gridMetaRow}>
            <View style={styles.vegDot}>
              <View style={styles.vegDotInner} />
            </View>
            {(product.discount || discountPercentage) ? (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.bestsellerStar}>☆</Text>
                <Text style={[styles.bestsellerText, { color: colors.accent }]}>Bestseller</Text>
              </View>
            ) : null}
            {showRating && product.rating !== undefined && (
              <View style={styles.ratingChip}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.gridName, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {product.name}
          </Text>

          <View style={styles.gridPriceRow}>
            <View style={styles.gridPriceLeft}>
              {hasDiscount && product.originalPrice && (
                <Text style={[styles.gridOriginalPrice, { color: colors.textSecondary }]}>
                  {formatPrice(product.originalPrice)}
                </Text>
              )}
              <View style={[styles.gridPriceTag, { backgroundColor: colors.accent }]}>
                <Text style={styles.gridPriceTagText}>{formatPrice(product.price)}</Text>
              </View>
            </View>

            {quantity > 0 ? (
              <View style={[styles.gridQtyControl, { borderColor: colors.primary }]}>
                <TouchableOpacity onPress={handleDecrement} style={styles.gridQtyBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.gridQtyText, { color: colors.primary }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.gridQtyValue, { color: colors.primary }]}>{quantity}</Text>
                <TouchableOpacity onPress={handleIncrement} style={styles.gridQtyBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.gridQtyText, { color: colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.gridAddBtn, { borderColor: colors.primary }]}
                onPress={handleAddToCart}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.gridAddBtnText, { color: colors.primary }]}>ADD</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // ─── Carousel / list variant: unchanged ───────────────────────────────────
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card },
        variant === 'carousel' && styles.carouselContainer,
        variant === 'list' && styles.listContainer,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`${product.name}, price ${product.price} rupees${hasDiscount ? `, discount ${discountPercentage} percent` : ''}`}
    >
      <View style={[
        styles.imageWrapper,
        variant === 'carousel' && styles.carouselImageWrapper,
      ]}>
        <SafeImage
          source={product.image}
          style={[styles.image, { width: 120, height: 120 }]}
          resizeMode="cover"
          accessible={false}
        />
        {(product.discount || discountPercentage) && (
          <View style={[styles.discountBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.discountText}>{product.discount || `${discountPercentage}% OFF`}</Text>
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, variant === 'carousel' && styles.carouselInfoContainer]}>
        <Text
          style={[styles.name, { color: colors.text }, variant === 'carousel' && styles.carouselName]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>

        {showRating && product.rating !== undefined && (
          <View style={[styles.ratingRow, variant === 'carousel' && styles.carouselRatingRow]}>
            <Text style={[styles.rating, { color: colors.textSecondary }]}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.star}>★</Text>
          </View>
        )}

        <View style={[styles.priceRow, variant === 'carousel' && styles.carouselPriceRow]}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(product.price)}</Text>
          {hasDiscount && product.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>{formatPrice(product.originalPrice)}</Text>
          )}
        </View>

        {product.quantity && product.unit && (
          <Text style={[styles.unit, { color: colors.textSecondary }, variant === 'carousel' && styles.carouselUnit]}>
            {product.quantity} {product.unit}
          </Text>
        )}
      </View>

      <View style={[styles.actionContainer, variant === 'carousel' && styles.carouselActionContainer]}>
        {quantity > 0 ? (
          <View style={[styles.quantityControl, { borderColor: colors.primary }]}>
            <TouchableOpacity onPress={handleDecrement} style={styles.quantityButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.quantityText, { color: colors.primary }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityValue, { color: colors.primary }]}>{quantity}</Text>
            <TouchableOpacity onPress={handleIncrement} style={styles.quantityButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.quantityText, { color: colors.primary }]}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }, variant === 'carousel' && styles.carouselAddButton]}
            onPress={handleAddToCart}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // ─── Grid card (food-delivery style) ──────────────────────────────────────
  gridCard: {
    flex: 1,
    margin: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#7B00CC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gridImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(123,0,204,0.08)',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridBody: {
    padding: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  gridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  vegDot: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bestsellerStar: {
    fontSize: 11,
    color: '#FF5C00',
  },
  bestsellerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto' as any,
  },
  ratingStar: {
    fontSize: 11,
    color: '#F59E0B',
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 6,
  },
  gridPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  gridPriceLeft: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  gridOriginalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginBottom: 2,
    color: '#9B77CC',
  },
  gridPriceTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridPriceTagText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gridAddBtn: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gridQtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 6,
  },
  gridQtyBtn: {
    padding: 2,
  },
  gridQtyText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  gridQtyValue: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
  },

  // ─── Carousel / list (unchanged) ──────────────────────────────────────────
  container: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    margin: SPACING.xs,
    shadowColor: '#7B00CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  carouselContainer: {
    width: 148,
    maxWidth: 148,
    flexGrow: 0,
    flexShrink: 0,
    padding: SPACING.xs,
    margin: 4,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageWrapper: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  carouselImageWrapper: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  image: {
    borderRadius: BORDER_RADIUS.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  discountText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 9,
  },
  infoContainer: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  carouselInfoContainer: {
    paddingTop: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    lineHeight: 16,
  },
  carouselName: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  carouselRatingRow: {
    justifyContent: 'center',
  },
  rating: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  star: {
    color: '#F59E0B',
    fontSize: 8,
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  carouselPriceRow: {
    justifyContent: 'center',
  },
  price: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
  },
  originalPrice: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
  },
  unit: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  carouselUnit: {
    textAlign: 'center',
  },
  actionContainer: {
    marginTop: SPACING.sm,
  },
  carouselActionContainer: {
    marginTop: SPACING.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xs,
    paddingVertical: 2,
    paddingHorizontal: SPACING.xs,
  },
  quantityButton: {
    padding: SPACING.xs,
  },
  quantityText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  quantityValue: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselAddButton: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
  },
  addButtonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 12,
  },
});

const ProductItem = memo(ProductItemInner, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.size === nextProps.size &&
    prevProps.variant === nextProps.variant
  );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;

export type { ProductItemProps };
