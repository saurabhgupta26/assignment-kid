import React, { useMemo, useCallback, useRef, memo } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ComponentBlock } from '../../types/schema';
import { filterValidComponents, createKeyExtractor } from './ComponentRegistry';
import { useTheme } from '../../contexts/ThemeContext';
import { ComponentRegistry } from './ComponentRegistry';


interface HomepageRendererProps {
  components: ComponentBlock[];
  registry: ComponentRegistry;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const HomepageRenderer: React.FC<HomepageRendererProps> = ({
  components,
  registry,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListEmptyComponent,
}) => {
  const { colors } = useTheme();
  const listRef = useRef<FlatList<ComponentBlock>>(null);

  const validComponents = useMemo(() => {
    return filterValidComponents(components);
  }, [components]);

  const keyExtractor = useCallback(createKeyExtractor('homepage'), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const block = validComponents[index];
      let estimatedHeight = 200;

      if (block?.type === 'BANNER_HERO') {
        estimatedHeight = 200;
      } else if (block?.type === 'PRODUCT_GRID_2X2') {
        estimatedHeight = 380;
      } else if (block?.type === 'DYNAMIC_COLLECTION') {
        estimatedHeight = 280;
      } else if (block?.type === 'SPECIALTY_ROW') {
        estimatedHeight = 280;
      } else if (block?.type === 'CAMPAIGN_HEADER') {
        estimatedHeight = 130;
      }

      return {
        length: estimatedHeight,
        offset: estimatedHeight * index,
        index,
      };
    },
    [validComponents]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ComponentBlock; index: number }) => {
      return registry.render(item, index) as React.ReactElement | null;
    },
    [registry]
  );


  return (
    <FlatList
      ref={listRef}
      data={validComponents}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={4}
      windowSize={3}
      initialNumToRender={3}
      updateCellsBatchingPeriod={100}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={styles.listContent}
      bounces={true}
      alwaysBounceVertical={true}
      nestedScrollEnabled={false}
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
});

export default memo(HomepageRenderer);

export type { HomepageRendererProps };
