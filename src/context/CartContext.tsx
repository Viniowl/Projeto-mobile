import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// Interface para os itens do carrinho
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Interface para o estado do carrinho
interface CartState {
  items: CartItem[];
}

// Interface para as ações do reducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'DECREASE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' };

// Interface para o valor do contexto
interface CartContextType {
  state: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  decreaseFromCart: (id: string) => void;
  clearCart: () => void;
}

// Criando o contexto com um valor padrão undefined
const CartContext = createContext<CartContextType | undefined>(undefined);

// Reducer para gerenciar o estado do carrinho
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingItemIndex > -1) {
        // Se o item já existe, aumenta a quantidade
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return { ...state, items: updatedItems };
      } else {
        // Se o item não existe, adiciona ao carrinho com quantidade 1
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    }
    case 'DECREASE_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        if (updatedItems[existingItemIndex].quantity > 1) {
          updatedItems[existingItemIndex].quantity -= 1;
          return { ...state, items: updatedItems };
        } else {
          return {
            ...state,
            items: state.items.filter((item) => item.id !== action.payload.id),
          };
        }
      }
      return state;
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
};

// Componente Provedor do Contexto
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const decreaseFromCart = (id: string) => {
    dispatch({ type: 'DECREASE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, decreaseFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook customizado para usar o contexto do carrinho
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
