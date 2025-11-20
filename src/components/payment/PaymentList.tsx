// Componente que renderiza a lista de itens do pagamento usando FlatList.
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { CartItem } from '../../context/CartContext';
import { PaymentItemCard } from './PaymentItemCard';

// Propriedades esperadas pelo PaymentList
interface PaymentListProps {
  items: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  isSmall: boolean;
  contentPaddingBottom: number;
  footer: React.ComponentType<any>;
}

// Renderiza lista de itens do carrinho para pagamento
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

// Estilos para a lista de pagamento
const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
});

export default PaymentList;
