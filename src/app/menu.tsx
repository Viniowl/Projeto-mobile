// Importa ícones da biblioteca MaterialIcons para uso na interface.
import { MaterialIcons } from '@expo/vector-icons';
// Importa o hook router da expo-router para navegação entre telas.
import { router } from 'expo-router';
// Importa MotiView para animações declarativas.
import { MotiView } from 'moti';
// Importa hooks do React para gerenciamento de estado e ciclo de vida.
import React, { useEffect, useState } from 'react';
// Importa componentes do React Native para construir a interface do usuário.
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
// Importa hooks do Reanimated para animações de estilo.
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
// Importa SafeAreaView para garantir que o conteúdo não seja sobreposto por barras de status ou notches.
import { SafeAreaView } from 'react-native-safe-area-context';

// Importa o componente MenuItem para exibir itens individuais do menu.
import { MenuItem } from '../components/menu/MenuItem';
// Importa o hook useCart para acessar o contexto do carrinho de compras.
import { useCart } from '../context/CartContext';
// Importa o hook useMenu e o tipo Product para acessar o contexto do menu.
import { useMenu, Product } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';

// Define as abas de navegação do menu.
const TABS = [
  { id: 'sabores', title: 'Sabores', icon: 'fastfood' },
  { id: 'bebidas', title: 'Bebidas', icon: 'local-drink' },
];

  // Componente principal da tela de Menu.
export default function Menu() {
  // Obtém o estado do carrinho e a função addToCart do contexto.
  const { state, addToCart } = useCart();
  // Obtém os dados do menu, estado de carregamento e erro do contexto.
  const { menu, loading, error } = useMenu();
  // Obtém o usuário logado do contexto de autenticação.
  const { user } = useAuth();
  // Estado para controlar a aba ativa ('sabores' ou 'bebidas').
  const [activeTab, setActiveTab] = useState<'sabores' | 'bebidas'>('sabores');

  // Valores compartilhados para animação de escala dos botões das abas.
  const saboresScale = useSharedValue(activeTab === 'sabores' ? 1.12 : 1);
  const bebidasScale = useSharedValue(activeTab === 'bebidas' ? 1.12 : 1);

  // Estilos animados para os botões das abas.
  const animatedStyles = {
    sabores: useAnimatedStyle(() => ({
      transform: [{ scale: saboresScale.value }],
    })),
    bebidas: useAnimatedStyle(() => ({
      transform: [{ scale: bebidasScale.value }],
    })),
  };

  // Efeito para animar a escala dos botões das abas quando a aba ativa muda.
  useEffect(() => {
    if (activeTab === 'sabores') {
      saboresScale.value = withSpring(1.12, { damping: 6 }); // Aumenta a escala da aba ativa.
      bebidasScale.value = withSpring(1, { damping: 8 }); // Retorna a escala da outra aba ao normal.
    } else {
      bebidasScale.value = withSpring(1.12, { damping: 6 });
      saboresScale.value = withSpring(1, { damping: 8 });
    }
  }, [activeTab, saboresScale, bebidasScale]); // Dependências do efeito.

  // Encontra a categoria ativa no menu com base na aba selecionada.
  const activeCategory = menu.find(
    (category) => category.name.toLowerCase() === activeTab.toLowerCase()
  );

  // Filtra os produtos da categoria ativa.
  const filteredData = activeCategory ? activeCategory.products : [];

  // Função para lidar com a seleção de um item do menu.
  const handleSelectItem = (item: Product) => {
    // Adiciona o item ao carrinho.
    addToCart({ id: item.id, name: item.name, price: item.price });
  };

  // Função para lidar com a finalização do pedido.
  const handlePlaceOrder = () => {
    // Verifica se há itens no carrinho antes de finalizar o pedido.
    if (state.items.length === 0) {
      Alert.alert('Nenhum item selecionado', 'Por favor, selecione ao menos um item para fazer o pedido.');
      return;
    }
    // Navega para a tela de pagamento.
    router.push('/pagamento');
  };

  // Função para verificar se um item já está selecionado no carrinho.
  const isItemSelected = (itemId: string) => {
    return state.items.some((item) => item.id === itemId);
  };

  // Exibe um indicador de carregamento enquanto os dados do menu estão sendo carregados.
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f73d04" />
        <Text>Carregando cardápio...</Text>
      </SafeAreaView>
    );
  }

  // Exibe uma mensagem de erro se houver problemas ao carregar o cardápio.
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Erro ao carregar o cardápio.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        {user && (
          <View style={styles.userNameContainer}>
            <Text style={styles.userNameText}>{user.nome}</Text>
          </View>
        )}
      </View>
      {/* Contêiner para os botões das abas. */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id as 'sabores' | 'bebidas')}
            accessibilityLabel={tab.title}
          >
            {/* MotiView para aplicar a animação de escala ao ícone da aba. */}
            <MotiView style={animatedStyles[tab.id as keyof typeof animatedStyles]}>
              <MaterialIcons
                name={tab.icon as any}
                size={26}
                color={activeTab === tab.id ? '#fff' : '#ff7a3d'}
              />
            </MotiView>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Lista plana para exibir os itens do menu filtrados. */}
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <MenuItem
            item={item}
            onPress={() => handleSelectItem(item)}
            isSelected={isItemSelected(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        extraData={state.items} // Garante que a lista seja re-renderizada quando os itens do carrinho mudam.
      />
      {/* Contêiner para o botão de finalizar pedido. */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={handlePlaceOrder}
          accessibilityLabel="Finalizar Pedido"
          activeOpacity={0.9}
        >
          <MaterialIcons name="shopping-cart" size={22} color="#fff" />
          <Text style={styles.finalizeButtonText}>
            🧾 Finalizar Pedido ({state.items.reduce((acc, item) => acc + item.quantity, 0)}) {/* Exibe a quantidade total de itens no carrinho. */}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecd595ff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3b2f2f',
  },
  userNameContainer: {
    backgroundColor: '#f73d04',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  userNameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ecd595ff',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#ffffff55',
  },
  tabButtonActive: {
    backgroundColor: '#f73d04',
  },
  tabLabel: {
    color: '#3b2f2f',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  tabLabelActive: {
    color: '#fff',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 10,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#ecd595ff',
  },
  finalizeButton: {
    backgroundColor: '#f73d04',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  finalizeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});