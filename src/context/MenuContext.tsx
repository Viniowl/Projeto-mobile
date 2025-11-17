import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../../services/api';

// Interface para um único produto
export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

// Interface para uma categoria que contém produtos
export interface MenuCategory {
  id: string;
  name: string;
  products: Product[];
}

// Interface para os dados do contexto
interface MenuContextData {
  menu: MenuCategory[];
  loading: boolean;
  error: string | null;
  fetchMenu: () => void;
}

// Criar o contexto
const MenuContext = createContext<MenuContextData>({} as MenuContextData);

// Criar o provider
export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/menu');
      setMenu(response.data);
    } catch (err) {
      setError('Não foi possível carregar o cardápio. Tente novamente mais tarde.');
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ menu, loading, error, fetchMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook para usar o contexto
export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
