import React, { useMemo, useCallback, memo } from 'react';
import { ComponentRegistry, ComponentBlock, BannerHeroBlock, ProductGrid2x2Block, DynamicCollectionBlock, SpecialtyRowBlock, CampaignHeaderBlock } from './ComponentRegistry';
import BannerHero from '../blocks/BannerHero';
import ProductGrid2x2 from '../blocks/ProductGrid2x2';
import DynamicCollection from '../blocks/DynamicCollection';
import SpecialtyRow from '../blocks/SpecialtyRow';
import CampaignHeader from '../blocks/CampaignHeader';
import { Action } from '../../types/schema';
import { ActionDispatcherService } from '../../services/ActionDispatcher';

interface ComponentRegistryProviderProps {
  dispatcher: ActionDispatcherService;
  children: (registry: ComponentRegistry) => React.ReactNode;
}

const createComponentRegistry = (
  dispatcher: ActionDispatcherService
): ComponentRegistry => {
  const registry = new ComponentRegistry();

  registry.register('BANNER_HERO', (block: BannerHeroBlock, index: number) => {
    return (
      <BannerHero
        key={`banner-${block.id}-${index}`}
        block={block}
        onPress={(action) => dispatcher.dispatch(action)}
      />
    );
  });

  registry.register('PRODUCT_GRID_2X2', (block: ProductGrid2x2Block, index: number) => {
    return (
      <ProductGrid2x2
        key={`grid-${block.id}-${index}`}
        block={block}
        index={index}
      />
    );
  });

  registry.register('DYNAMIC_COLLECTION', (block: DynamicCollectionBlock, index: number) => {
    return (
      <DynamicCollection
        key={`collection-${block.id}-${index}`}
        block={block}
        index={index}
      />
    );
  });

  registry.register('SPECIALTY_ROW', (block: SpecialtyRowBlock, index: number) => {
    return (
      <SpecialtyRow
        key={`specialty-${block.id}-${index}`}
        block={block}
        index={index}
      />
    );
  });

  registry.register('CAMPAIGN_HEADER', (block: CampaignHeaderBlock, index: number) => {
    return (
      <CampaignHeader
        key={`campaign-header-${block.id}-${index}`}
        block={block}
      />
    );
  });

  return registry;
};

const ComponentRegistryProvider: React.FC<ComponentRegistryProviderProps> = memo(
  ({ dispatcher, children }) => {
    const registry = useMemo(() => createComponentRegistry(dispatcher), [dispatcher]);

    return <>{children(registry)}</>;
  }
);

ComponentRegistryProvider.displayName = 'ComponentRegistryProvider';

export default ComponentRegistryProvider;

export { createComponentRegistry };
