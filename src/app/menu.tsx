import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

interface MenuItemData {
  id: string;
  title: string;
  price: string;
  category: 'sabores' | 'bebidas';
  image?: any;
}

const menuData: MenuItemData[] = [
  { id: '1', title: 'Carne', price: 'R$ 8,00', category: 'sabores', image: require('../../assets/images/pasteldecarne.png') },
  { id: '2', title: 'Queijo', price: 'R$ 8,00', category: 'sabores', image: require('../../assets/images/pastel-de-feira-de-queijo.jpg') },
  { id: '3', title: 'Pizza', price: 'R$ 8,50', category: 'sabores', image: require('../../assets/images/pastel-pizza.png') },
  { id: '4', title: 'Frango Catupiry', price: 'R$ 9,00', category: 'sabores', image: require('../../assets/images/pasteldefrangocomcatupiry.jpg') },
  { id: '5', title: 'Palmito', price: 'R$ 8,50', category: 'sabores', image: require('../../assets/images/Pastel-dePalmitoCremoso.jpg') },
  { id: '6', title: 'Brigadeiro', price: 'R$ 9,50', category: 'sabores', image: require('../../assets/images/pastelbrigadeiro.png') },
  { id: '7', title: 'Doce de Leite', price: 'R$ 9,50', category: 'sabores', image: require('../../assets/images/pasteldocedeleite.png') },
  { id: '8', title: 'Caldo. C 300ml', price: 'R$ 6,00', category: 'bebidas', image: require('../../assets/images/CaldodeCana300ml.png') },
  { id: '9', title: 'Caldo. C 500ml', price: 'R$ 8,00', category: 'bebidas', image: require('../../assets/images/caldodecarna500ml.jpg') },
  { id: '10', title: 'Água Mineral', price: 'R$ 4,00', category: 'bebidas', image: require('../../assets/images/aguamineral.jpg') },
  { id: '11', title: 'Refri. Lata', price: 'R$ 5,00', category: 'bebidas', image: require('../../assets/images/refrigerantecoca.png') },
];

interface MenuItemProps {
  item: MenuItemData;
  onPress: () => void;
  isSelected: boolean;
}

const MenuItem = ({ item, onPress, isSelected }: MenuItemProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.itemContainer, isSelected && styles.itemSelected]}>
    {item.image && <Image source={item.image} style={styles.itemImage} />}
    <View style={styles.itemTextWrap}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
    </View>
  </TouchableOpacity>
);

export default function Menu() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'sabores' | 'bebidas'>('sabores');

  // Animated values for tab icons
  const saboresScale = useSharedValue(activeTab === 'sabores' ? 1.12 : 1);
  const bebidasScale = useSharedValue(activeTab === 'bebidas' ? 1.12 : 1);

  useEffect(() => {
    // pulse the active icon slightly and return others to normal
    if (activeTab === 'sabores') {
      saboresScale.value = withSpring(1.12, { damping: 6 });
      bebidasScale.value = withSpring(1, { damping: 8 });
    } else {
      bebidasScale.value = withSpring(1.12, { damping: 6 });
      saboresScale.value = withSpring(1, { damping: 8 });
    }
  }, [activeTab]);

  const saboresAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: saboresScale.value }],
    };
  });

  const bebidasAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bebidasScale.value }],
    };
  });

  const filteredData = menuData.filter((m) => m.category === activeTab);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter(id => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Nenhum item selecionado', 'Por favor, selecione ao menos um item para fazer o pedido.');
      return;
    }

    router.push({
      pathname: '/pagamento',
      params: { selectedItems: JSON.stringify(selectedItems) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Menu</Text>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sabores' && styles.tabButtonActive]}
          onPress={() => setActiveTab('sabores')}
          accessibilityLabel="Sabores"
        >
          <MotiView style={saboresAnimatedStyle}>
            <MaterialIcons name="fastfood" size={26} color={activeTab === 'sabores' ? '#fff' : '#ff7a3d'} />
          </MotiView>
          <Text style={[styles.tabLabel, activeTab === 'sabores' && styles.tabLabelActive]}>Sabores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bebidas' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bebidas')}
          accessibilityLabel="Bebidas"
        >
          <MotiView style={bebidasAnimatedStyle}>
            <MaterialIcons name="local-drink" size={26} color={activeTab === 'bebidas' ? '#fff' : '#ff7a3d'} />
          </MotiView>
          <Text style={[styles.tabLabel, activeTab === 'bebidas' && styles.tabLabelActive]}>Bebidas</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <MenuItem
            item={item}
            onPress={() => handleSelectItem(item.id)}
            isSelected={selectedItems.includes(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        extraData={selectedItems}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.finalizeButton}
          onPress={handlePlaceOrder}
          accessibilityLabel="Finalizar Pedido"
          activeOpacity={0.9}
        >
          <MaterialIcons name="shopping-cart" size={22} color="#fff" />
          <Text style={styles.finalizeButtonText}>🧾 Finalizar Pedido ({selectedItems.length})</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
    color: '#080808ff',
  },
  list: {
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
    // shadow
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  itemSelected: {
    backgroundColor: '#ffe9d6',
    borderColor: '#f73d04',
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    backgroundColor: '#f3d8b0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
    marginRight: 16,
  },
  itemTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    color: '#3b2f2f',
  },
  listContent: {
    paddingBottom: 10,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#ecd595ff',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ecd595ff',
  },
  tabButton: {
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
  tabIcon: {
    marginRight: 4,
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