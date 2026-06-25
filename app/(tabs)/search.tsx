import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Inbox } from 'lucide-react-native';
import { useTheme, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/contexts/ThemeContext';
import { mockHomepagePayload } from '@/data/mockPayload';
import { Product } from '@/types/schema';
import ProductItem from '@/components/ui/ProductItem';

// Gather unique products from components and campaigns
const getUniqueProducts = (): Product[] => {
  const productsMap = new Map<string, Product>();

  mockHomepagePayload.components.forEach((block) => {
    if ('products' in block && block.products) {
      block.products.forEach((p) => productsMap.set(p.id, p));
    }
    if ('items' in block && block.items) {
      block.items.forEach((p) => productsMap.set(p.id, p));
    }
  });

  mockHomepagePayload.campaigns.forEach((campaign) => {
    if (campaign.specialtyComponent?.items) {
      campaign.specialtyComponent.items.forEach((p) => productsMap.set(p.id, p));
    }
  });

  return Array.from(productsMap.values());
};

const allProducts = getUniqueProducts();

const popularSuggestions = [
  'Milk',
  'Eggs',
  'Yogurt',
  'Almonds',
  'Rice',
  'Chocolate',
  'Cola',
  'Cleaner',
];

export default function SearchScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.unit && product.unit.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSuggestionPress = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const renderItem = useCallback(({ item }: { item: Product }) => {
    return (
      <View style={styles.gridItem}>
        <ProductItem product={item} variant="grid" size="medium" />
      </View>
    );
  }, []);

  const renderSuggestions = useMemo(() => {
    return (
      <View style={styles.suggestionsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Searches</Text>
        <View style={styles.chipsContainer}>
          {popularSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={[styles.chip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [colors, handleSuggestionPress]);

  const renderEmptyState = useMemo(() => {
    if (!searchQuery) return null;
    return (
      <View style={styles.emptyContainer}>
        <Inbox size={48} color={colors.textSecondary} style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          We couldn&apos;t find any products matching &quot;{searchQuery}&quot;
        </Text>
      </View>
    );
  }, [searchQuery, colors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
      </View>

      <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search products, categories..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim().length === 0 ? (
        renderSuggestions
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    outlineStyle: 'none',
  } as any,
  clearButton: {
    padding: SPACING.xs,
  },
  suggestionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  chipText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    textAlign: 'center',
    lineHeight: 20,
  },
});
