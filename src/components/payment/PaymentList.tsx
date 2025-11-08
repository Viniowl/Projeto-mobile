import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import PaymentItemCard from './PaymentItemCard';
import { CartItem } from '../../context/CartContext';

interface PaymentListProps {
  items: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  isSmall: boolean;
  contentPaddingBottom: number;
  footer: React.ComponentType<any>;
}

const PaymentList: React.FC<PaymentListProps> = ({
  items,
  onIncrease,
  onDecrease,
  isSmall,
  contentPaddingBottom,
  footer,
}) => {
  return (
    <FlatList
      keyboardShouldPersistTaps="handled"
      data={items}
      renderItem={({ item }) => (
        <PaymentItemCard
          item={item}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          isSmall={isSmall}
        />
      )}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      ListFooterComponent={footer}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
});

export default PaymentList;
