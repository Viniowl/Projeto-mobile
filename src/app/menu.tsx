import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface MenuItemData {
  id: string;
  title: string;
  price: string;
}

const menuData: MenuItemData[] = [
  { id: '1', title: 'Pastel de Carne', price: 'R$ 8,00' },
  { id: '2', title: 'Pastel de Queijo', price: 'R$ 8,00' },
  { id: '3', title: 'Pastel de Pizza', price: 'R$ 8,50' },
  { id: '4', title: 'Pastel de Frango com Catupiry', price: 'R$ 9,00' },
  { id: '5', title: 'Pastel de Palmito', price: 'R$ 8,50' },
  { id: '6', title: 'Pastel de Brigadeiro', price: 'R$ 9,50' },
  { id: '7', title: 'Pastel de Doce de Leite', price: 'R$ 9,50' },
  { id: '8', title: 'Caldo de Cana 300ml', price: 'R$ 6,00' },
  { id: '9', title: 'Caldo de Cana 500ml', price: 'R$ 8,00' },
  { id: '10', title: 'Água Mineral', price: 'R$ 4,00' },
  { id: '11', title: 'Refrigerante Lata', price: 'R$ 5,00' },
];

interface MenuItemProps {
  item: MenuItemData;
  onPress: () => void;
  isSelected: boolean;
}

const MenuItem = ({ item, onPress, isSelected }: MenuItemProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.itemContainer, isSelected && styles.itemSelected]}>
    <Text style={styles.itemTitle}>{item.title}</Text>
    <Text style={styles.itemPrice}>{item.price}</Text>
  </TouchableOpacity>
);

export default function Menu() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
      <Text style={styles.title}>Cardápio</Text>
      <FlatList
        data={menuData}
        renderItem={({ item }) => (
          <MenuItem
            item={item}
            onPress={() => handleSelectItem(item.id)}
            isSelected={selectedItems.includes(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        extraData={selectedItems}
      />
      <View style={styles.buttonContainer}>
        <Button title="Finalizar Pedido" onPress={handlePlaceOrder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
  },
  itemSelected: {
    backgroundColor: '#d1e7ff',
  },
  itemTitle: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    padding: 20,
  },
});