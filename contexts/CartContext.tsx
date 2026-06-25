import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { Product, CartItem, Action } from '../types/schema';

interface CartState {
  items: Record<string, CartItem>;
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextValue {
  cart: CartState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

const initialState: CartState = {
  items: {},
  totalItems: 0,
  totalAmount: 0,
};

function calculateTotals(items: Record<string, CartItem>): { totalItems: number; totalAmount: number } {
  const itemValues = Object.values(items);
  return {
    totalItems: itemValues.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: itemValues.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product } = action.payload;
      const existingItem = state.items[product.id];

      if (existingItem) {
        const updatedItems = {
          ...state.items,
          [product.id]: {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          },
        };
        return { ...state, items: updatedItems, ...calculateTotals(updatedItems) };
      }

      const newItems = {
        ...state.items,
        [product.id]: { product, quantity: 1 },
      };
      return { ...state, items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_FROM_CART': {
      const { productId } = action.payload;
      const { [productId]: removed, ...remainingItems } = state.items;
      return { ...state, items: remainingItems, ...calculateTotals(remainingItems) };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        const { [productId]: removed, ...remainingItems } = state.items;
        return { ...state, items: remainingItems, ...calculateTotals(remainingItems) };
      }

      const existingItem = state.items[productId];
      if (!existingItem) return state;

      const updatedItems = {
        ...state.items,
        [productId]: { ...existingItem, quantity },
      };
      return { ...state, items: updatedItems, ...calculateTotals(updatedItems) };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const productCacheRef = useRef<Map<string, Product>>(new Map());

  const addToCart = useCallback((product: Product) => {
    productCacheRef.current.set(product.id, product);
    dispatch({ type: 'ADD_TO_CART', payload: { product } });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getItemQuantity = useCallback(
    (productId: string): number => {
      return cart.items[productId]?.quantity ?? 0;
    },
    [cart.items]
  );

  const isInCart = useCallback(
    (productId: string): boolean => {
      return productId in cart.items;
    },
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemQuantity,
      isInCart,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, getItemQuantity, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const createCartActionHandler = (
  addToCart: (product: Product) => void,
  getProductById: (id: string) => Product | undefined
) => {
  return (action: Action) => {
    if (action.type === 'ADD_TO_CART' && action.payload.id) {
      const product = getProductById(action.payload.id);
      if (product) {
        addToCart(product);
      }
    }
  };
};
