import React from 'react';
import {
  ComponentType,
  ComponentBlock,
  ComponentRenderer,
  BannerHeroBlock,
  ProductGrid2x2Block,
  DynamicCollectionBlock,
  CampaignHeaderBlock,
  SpecialtyRowBlock,
} from '../../types/schema';

export type {
  ComponentType,
  ComponentBlock,
  ComponentRenderer,
  BannerHeroBlock,
  ProductGrid2x2Block,
  DynamicCollectionBlock,
  CampaignHeaderBlock,
  SpecialtyRowBlock,
};

type RendererMap = {
  [K in ComponentType]?: ComponentRenderer<Extract<ComponentBlock, { type: K }>>;
};

export class ComponentRegistry {
  private renderers: RendererMap = {};
  private fallbackRenderer?: (type: string) => React.ReactNode;

  constructor(initialRenderers?: Partial<RendererMap>) {
    if (initialRenderers) {
      this.renderers = initialRenderers as RendererMap;
    }
  }

  register<K extends ComponentType>(
    type: K,
    renderer: ComponentRenderer<Extract<ComponentBlock, { type: K }>>
  ): void {
    this.renderers[type] = renderer as RendererMap[K];
  }

  unregister(type: ComponentType): void {
    delete this.renderers[type];
  }

  has(type: string): boolean {
    return type in this.renderers;
  }

  render(block: ComponentBlock, index: number): React.ReactNode {
    const renderer = this.renderers[block.type as ComponentType];

    if (renderer) {
      try {
        return renderer(block as any, index);
      } catch (error) {
        if (__DEV__) {
          console.error(`[ComponentRegistry] Error rendering ${block.type}:`, error);
        }
        return this.renderFallback(block.type);
      }
    }

    if (__DEV__) {
      console.warn(`[ComponentRegistry] No renderer registered for type: ${block.type}`);
    }
    return this.renderFallback(block.type);
  }

  setFallbackRenderer(renderer: (type: string) => React.ReactNode): void {
    this.fallbackRenderer = renderer;
  }

  private renderFallback(type: string): React.ReactNode {
    if (this.fallbackRenderer) {
      return this.fallbackRenderer(type);
    }
    return null;
  }

  getSupportedTypes(): ComponentType[] {
    return Object.keys(this.renderers) as ComponentType[];
  }
}

let globalRegistryInstance: ComponentRegistry | null = null;

export const getGlobalRegistry = (): ComponentRegistry => {
  if (!globalRegistryInstance) {
    globalRegistryInstance = new ComponentRegistry();
  }
  return globalRegistryInstance;
};

export const resetGlobalRegistry = (): void => {
  globalRegistryInstance = null;
};

export const isValidComponentBlock = (block: unknown): block is ComponentBlock => {
  if (!block || typeof block !== 'object') return false;

  const typedBlock = block as Partial<ComponentBlock>;
  return typeof typedBlock.id === 'string' && typeof typedBlock.type === 'string';
};

const isValidAction = (action: unknown): boolean => {
  if (!action || typeof action !== 'object') return false;
  const a = action as any;
  return typeof a.type === 'string' && a.payload && typeof a.payload === 'object';
};

const isValidProduct = (product: unknown): boolean => {
  if (!product || typeof product !== 'object') return false;
  const p = product as any;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.price === 'number' &&
    typeof p.image === 'string' &&
    isValidAction(p.action)
  );
};

export const validateComponentBlock = (block: ComponentBlock): boolean => {
  try {
    switch (block.type) {
      case 'BANNER_HERO':
        return (
          typeof block.title === 'string' &&
          typeof block.image === 'string' &&
          isValidAction(block.action)
        );
      case 'PRODUCT_GRID_2X2':
        return (
          typeof block.title === 'string' &&
          Array.isArray(block.products) &&
          block.products.every(isValidProduct)
        );
      case 'DYNAMIC_COLLECTION':
        return (
          typeof block.title === 'string' &&
          typeof block.theme === 'string' &&
          Array.isArray(block.items) &&
          block.items.every(isValidProduct)
        );
      case 'SPECIALTY_ROW':
        return (
          typeof block.title === 'string' &&
          typeof block.campaignId === 'string' &&
          Array.isArray(block.items) &&
          block.items.every(isValidProduct)
        );
      case 'CAMPAIGN_HEADER':
        return (
          typeof block.title === 'string' &&
          typeof block.campaignId === 'string'
        );
      default:
        return true; // Other types can fallback or pass basic checks
    }
  } catch {
    return false;
  }
};

export const SUPPORTED_COMPONENT_TYPES: readonly ComponentType[] = [
  'BANNER_HERO',
  'PRODUCT_GRID_2X2',
  'DYNAMIC_COLLECTION',
  'FULL_SCREEN_OVERLAY',
  'SPECIALTY_ROW',
  'CAMPAIGN_HEADER',
] as const;

export const isSupportedType = (type: string): type is ComponentType => {
  return SUPPORTED_COMPONENT_TYPES.includes(type as ComponentType);
};

export const filterValidComponents = (blocks: unknown[]): ComponentBlock[] => {
  const validBlocks: ComponentBlock[] = [];

  blocks.forEach((block) => {
    if (isValidComponentBlock(block) && isSupportedType(block.type)) {
      if (validateComponentBlock(block)) {
        validBlocks.push(block);
      } else {
        if (__DEV__) {
          console.warn(`[ComponentRegistry] Block failed detailed sub-field validation, skipping:`, block);
        }
      }
    } else {
      if (__DEV__) {
        if (!isValidComponentBlock(block)) {
          console.warn('[ComponentRegistry] Invalid block structure, skipping:', block);
        } else if (!isSupportedType((block as ComponentBlock).type)) {
          console.warn(
            `[ComponentRegistry] Unsupported component type: ${(block as ComponentBlock).type}, skipping`
          );
        }
      }
    }
  });

  return validBlocks;
};

export const createKeyExtractor = (prefix: string = 'block') => {
  return (item: ComponentBlock, index: number): string => {
    return item.id ? `${prefix}-${item.id}` : `${prefix}-${index}`;
  };
};
