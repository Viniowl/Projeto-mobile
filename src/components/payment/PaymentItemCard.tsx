import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem } from '../context/CartContext';

type PaymentItemCardProps = {
  item: CartItem;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  isSmall: boolean;
};

export function PaymentItemCard({ item, onIncrease, onDecrease, isSmall }: PaymentItemCardProps) {
  return (
    <View style={[styles.itemCard, isSmall && styles.itemCardSmall]}>
      <View style={styles.itemRow}>
        <Text style={[styles.itemTitle, isSmall && styles.itemTitleSmall]}>{item.name}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.itemPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      <View style={styles.quantityRow}>
        <View style={styles.quantityControls}>
          <TouchableOpacity style={[styles.qtyButton, isSmall && styles.qtyButtonSmall]} onPress={() => onDecrease(item.id)} accessibilityLabel={`Remover ${item.title}`}>
            <MaterialIcons name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.qtyText, isSmall && styles.qtyTextSmall]}>{item.quantity}</Text>
          <TouchableOpacity style={[styles.qtyButton, isSmall && styles.qtyButtonSmall]} onPress={() => onIncrease(item.id)} accessibilityLabel={`Adicionar ${item.title}`}>
            <MaterialIcons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtotalText, isSmall && styles.subtotalTextSmall]}>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 18,
  },
  priceBadge: {
    backgroundColor: '#f3d8b0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  itemPrice: {
    fontSize: 18,
    color: '#333',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    backgroundColor: '#d94a00',
    padding: 6,
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  // Small screen variants
  itemCardSmall: {
    padding: 8,
    borderRadius: 10,
  },
  itemTitleSmall: {
    fontSize: 16,
  },
  qtyButtonSmall: {
    width: 30,
    height: 30,
    padding: 4,
    borderRadius: 6,
  },
  qtyTextSmall: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  subtotalTextSmall: {
    fontSize: 14,
  },
});