
// Contexto para gerenciar o cardápio (menu) e suas categorias/produtos.
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ImageSourcePropType } from 'react-native';
import api from '../../services/api';

// Mapeamento de nomes de produtos para imagens locais
const productImageMap: { [key: string]: ImageSourcePropType } = {
  'Água Mineral': require('../../assets/images/aguamineral.jpg'),
  'Caldo. C 300ml': require('../../assets/images/CaldodeCana300ml.png'),
  'Caldo. C 500ml': require('../../assets/images/caldodecarna500ml.jpg'),
  'Queijo': require('../../assets/images/pastel-de-feira-de-queijo.jpg'),
  'Palmito': require('../../assets/images/Pastel-dePalmitoCremoso.jpg'),
  'Pizza': require('../../assets/images/pastel-pizza.png'),
  'Brigadeiro': require('../../assets/images/pastelbrigadeiro.png'),
  'Carne': require('../../assets/images/pasteldecarne.png'),
  'Frango Catupiry': require('../../assets/images/pasteldefrangocomcatupiry.jpg'),
  'Doce de Leite': require('../../assets/images/pasteldocedeleite.png'),
  'Refri. Lata': require('../../assets/images/refrigerantecoca.png'),
};

// Interface para um único produto
export interface Product {
  id: string;
  nome: string;
  preco: number;
  categoriaId: string;
  image?: ImageSourcePropType; // Campo de imagem local
}

// Interface para uma categoria que contém produtos
export interface MenuCategory {
  id: string;
  nome: string;
  produtos: Product[];
}

// Interface para os dados e funções do contexto do menu
interface MenuContextData {
  menu: MenuCategory[];
  loading: boolean;
  error: string | null;
  fetchMenu: () => void;
}

// Cria o contexto do menu
const MenuContext = createContext<MenuContextData>({} as MenuContextData);

// Provider do contexto do menu
export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar o cardápio do backend e atribuir imagens locais
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/menu');
      const menuData: MenuCategory[] = response.data;

      // Atribuir imagens locais aos produtos
      const menuWithImages = menuData.map((category) => ({
        ...category,
        produtos: category.produtos.map((product) => {
          return {
            ...product,
            image: productImageMap[product.nome] || undefined, // Atribui a imagem ou undefined se não encontrar
          };
        }),
      }));

      setMenu(menuWithImages);
    } catch (err) {
      setError('Não foi possível carregar o cardápio. Tente novamente mais tarde.');
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca o cardápio ao montar o componente
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ menu, loading, error, fetchMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook para usar o contexto do menu
export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
