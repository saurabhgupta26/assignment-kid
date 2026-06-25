import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Trash2 } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const { colors } = useTheme();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const cartItems = Object.values(cart.items);

  const deliveryFee = 25;
  const taxes = Math.round(cart.totalAmount * 0.05);
  const total = cart.totalAmount + deliveryFee + taxes;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Cart</Text>
          <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
          </Text>
        </View>
        {cart.totalItems > 0 && (
          <TouchableOpacity
            style={[styles.clearAllBtn, { borderColor: colors.error }]}
            onPress={clearCart}
            activeOpacity={0.75}
          >
            <Text style={[styles.clearAllText, { color: colors.error }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add items to get started
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {item.product.name}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.text }]}>
                    {item.product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.quantityText, { color: colors.text }]}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={[styles.footer, { backgroundColor: colors.card }]}>
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>
                {cart.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
                Delivery
              </Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>
                {deliveryFee.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
                Taxes
              </Text>
              <Text style={[styles.footerValue, { color: colors.text }]}>
                {taxes.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.footerRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }).replace('INR', '')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={async () => {
                const resumeUrl = 'https://drive.google.com/file/d/1_bPym8lkJZGEW9D0_MxkkfDxo5w6gstl/view?usp=sharing';
                if (Platform.OS === 'web') {
                  const confirmOpen = window.confirm("🚀 Order Placed!\n\nThank you for reviewing my assignment! Press OK to open Saurabh's resume.");
                  if (confirmOpen) {
                    window.open(resumeUrl, '_blank');
                  }
                } else {
                  Alert.alert(
                    "🚀 Order Placed!",
                    "Thank you for reviewing my assignment! Proceeding to open Saurabh's resume...",
                    [
                      {
                        text: "Open Resume",
                        onPress: () => WebBrowser.openBrowserAsync(resumeUrl)
                      },
                      {
                        text: "Cancel",
                        style: "cancel"
                      }
                    ]
                  );
                }
              }}
            >
              <Text style={styles.checkoutButtonText}>PROCEED TO CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
  },
  itemCount: {
    ...TYPOGRAPHY.body1,
    marginTop: 2,
  },
  clearAllBtn: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body1,
  },
  listContent: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productName: {
    ...TYPOGRAPHY.body1,
    fontWeight: '500',
  },
  productPrice: {
    ...TYPOGRAPHY.body2,
    marginTop: SPACING.xs,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  footerLabel: {
    ...TYPOGRAPHY.body1,
  },
  footerValue: {
    ...TYPOGRAPHY.body1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  totalValue: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  checkoutButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.button,
    fontWeight: '700',
  },
});
