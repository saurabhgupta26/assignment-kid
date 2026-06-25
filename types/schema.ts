// ============================================
// Core Action Schema Types
// ============================================

export type ActionType =
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'DEEP_LINK'
  | 'NAVIGATE'
  | 'APPLY_MYSTERY_GIFT_COUPON'
  | 'BOOK_EVENT'
  | 'VIEW_PRODUCT';

export interface ActionPayload {
  id?: string;
  url?: string;
  screen?: string;
  productId?: string;
  quantity?: number;
  couponCode?: string;
  eventId?: string;
  [key: string]: unknown;
}

export interface Action {
  type: ActionType;
  payload: ActionPayload;
}

// ============================================
// Theme Schema Types
// ============================================

export interface Theme {
  primary: string;
  background: string;
  secondary?: string;
  accent?: string;
  text?: string;
  textSecondary?: string;
  success?: string;
  warning?: string;
  error?: string;
}

// ============================================
// Product Schema Types
// ============================================

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: string;
  rating?: number;
  quantity?: number;
  unit?: string;
  action: Action;
}

// ============================================
// Campaign Schema Types
// ============================================

export type CampaignType =
  | 'BACK_TO_SCHOOL'
  | 'SUMMER_PLAYHOUSE'
  | 'MYSTERY_GIFT_CARNIVAL';

export interface CampaignTheme {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  animationType: 'lottie' | 'webp' | 'confetti' | 'none';
}

export interface CampaignOverlay {
  type: 'FULL_SCREEN_OVERLAY';
  animation_url: string;
  animation_type: 'lottie' | 'webp' | 'confetti' | 'none';
}

export interface Campaign {
  id: CampaignType;
  name: string;
  theme: CampaignTheme;
  overlay?: CampaignOverlay;
  specialtyComponent?: CampaignSpecialtyComponent;
  active: boolean;
}

export interface CampaignSpecialtyComponent {
  type: string;
  title: string;
  items: Product[];
  animation_asset?: string;
}

// ============================================
// Component Block Schema Types
// ============================================

export type ComponentType =
  | 'BANNER_HERO'
  | 'PRODUCT_GRID_2X2'
  | 'DYNAMIC_COLLECTION'
  | 'FULL_SCREEN_OVERLAY'
  | 'SPECIALTY_ROW'
  | 'CAMPAIGN_HEADER';

export interface BannerHeroBlock {
  id: string;
  type: 'BANNER_HERO';
  title: string;
  subtitle?: string;
  image: string;
  backgroundImage?: string;
  gradient?: string[];
  action: Action;
  campaignContext?: CampaignType;
}

export interface ProductGrid2x2Block {
  id: string;
  type: 'PRODUCT_GRID_2X2';
  title: string;
  products: Product[];
}

export interface DynamicCollectionBlock {
  id: string;
  type: 'DYNAMIC_COLLECTION';
  title: string;
  theme: string;
  items: Product[];
  scrollDirection?: 'horizontal';
}

export interface FullScreenOverlayBlock {
  id: string;
  type: 'FULL_SCREEN_OVERLAY';
  animation_url: string;
  animation_type: 'lottie' | 'webp' | 'confetti';
}

export interface SpecialtyRowBlock {
  id: string;
  type: 'SPECIALTY_ROW';
  title: string;
  campaignId: CampaignType;
  items: Product[];
}

export interface CampaignHeaderBlock {
  id: string;
  type: 'CAMPAIGN_HEADER';
  campaignId: CampaignType;
  title: string;
  subtitle?: string;
}

export type ComponentBlock =
  | BannerHeroBlock
  | ProductGrid2x2Block
  | DynamicCollectionBlock
  | FullScreenOverlayBlock
  | SpecialtyRowBlock
  | CampaignHeaderBlock;

// ============================================
// Homepage Payload Schema
// ============================================

export interface HomepagePayload {
  version: string;
  theme: Theme;
  activeCampaign?: CampaignType;
  campaigns: Campaign[];
  components: ComponentBlock[];
}

// ============================================
// Cart State Types
// ============================================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: Map<string, CartItem>;
  totalItems: number;
  totalAmount: number;
}

// ============================================
// Component Registry Types
// ============================================

export type ComponentRenderer<T extends ComponentBlock = ComponentBlock> = (
  block: T,
  index: number
) => React.ReactNode;

export interface ComponentRegistry {
  [key: string]: ComponentRenderer<ComponentBlock> | undefined;
}
