import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../../context/MenuContext';

interface MenuItemProps {
  item: Product;
  onPress: () => void;
  isSelected: boolean;
}

export function MenuItem({ item, onPress, isSelected }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.itemContainer, isSelected && styles.itemSelected]}>
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemPrice}>{`R$ ${item.price.toFixed(2)}`}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
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
  itemTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
