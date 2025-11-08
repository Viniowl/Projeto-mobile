import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuItem } from '../components/menu/MenuItem';
import { useCart } from '../context/CartContext';
import { menuData, MenuItemData } from '../data/menuData';

const TABS = [
  { id: 'sabores', title: 'Sabores', icon: 'fastfood' },
  { id: 'bebidas', title: 'Bebidas', icon: 'local-drink' },
];

export default function Menu() {
  const { state, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'sabores' | 'bebidas'>('sabores');

  const saboresScale = useSharedValue(activeTab === 'sabores' ? 1.12 : 1);
  const bebidasScale = useSharedValue(activeTab === 'bebidas' ? 1.12 : 1);

  const animatedStyles = {
    sabores: useAnimatedStyle(() => ({
      transform: [{ scale: saboresScale.value }],
    })),
    bebidas: useAnimatedStyle(() => ({
      transform: [{ scale: bebidasScale.value }],
    })),
  };

  useEffect(() => {
    if (activeTab === 'sabores') {
      saboresScale.value = withSpring(1.12, { damping: 6 });
      bebidasScale.value = withSpring(1, { damping: 8 });
    } else {
      bebidasScale.value = withSpring(1.12, { damping: 6 });
      saboresScale.value = withSpring(1, { damping: 8 });
    }
  }, [activeTab, saboresScale, bebidasScale]);

  const filteredData = menuData.filter((m) => m.category === activeTab);

  const handleSelectItem = (item: MenuItemData) => {
    const priceNumber = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
    addToCart({ id: item.id, name: item.title, price: priceNumber });
  };

  const handlePlaceOrder = () => {
    if (state.items.length === 0) {
      Alert.alert('Nenhum item selecionado', 'Por favor, selecione ao menos um item para fazer o pedido.');
      return;
    }
    router.push('/pagamento');
  };

  const isItemSelected = (itemId: string) => {
    return state.items.some((item) => item.id === itemId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Menu</Text>
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.id as 'sabores' | 'bebidas')}
            accessibilityLabel={tab.title}
          >
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
        extraData={state.items}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={handlePlaceOrder}
          accessibilityLabel="Finalizar Pedido"
          activeOpacity={0.9}
        >
          <MaterialIcons name="shopping-cart" size={22} color="#fff" />
          <Text style={styles.finalizeButtonText}>
            🧾 Finalizar Pedido ({state.items.reduce((acc, item) => acc + item.quantity, 0)})
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    color: '#3b2f2f',
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