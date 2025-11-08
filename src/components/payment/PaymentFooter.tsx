import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type PaymentMethod = 'cartao' | 'pix' | 'dinheiro';

interface PaymentFooterProps {
  total: number;
  paymentMethod: PaymentMethod | null;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
}

const PaymentFooter: React.FC<PaymentFooterProps> = ({ total, paymentMethod, onSelectPaymentMethod }) => {
  return (
    <>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalPrice}>R$ {total.toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={styles.paymentContainer}>
        <Text style={styles.paymentTitle}>Forma de Pagamento</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentButton, paymentMethod === 'cartao' && styles.paymentButtonSelected]}
            onPress={() => onSelectPaymentMethod('cartao')}
          >
            <MaterialIcons name="credit-card" size={18} color={paymentMethod === 'cartao' ? '#fff' : '#d94a00'} />
            <Text style={[styles.paymentButtonText, paymentMethod === 'cartao' && styles.paymentButtonTextSelected]}>Cartão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentButton, paymentMethod === 'pix' && styles.paymentButtonSelected]}
            onPress={() => onSelectPaymentMethod('pix')}
          >
            <MaterialIcons name="qr-code" size={18} color={paymentMethod === 'pix' ? '#fff' : '#d94a00'} />
            <Text style={[styles.paymentButtonText, paymentMethod === 'pix' && styles.paymentButtonTextSelected]}>Pix</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentButton, paymentMethod === 'dinheiro' && styles.paymentButtonSelected]}
            onPress={() => onSelectPaymentMethod('dinheiro')}
          >
            <MaterialIcons name="attach-money" size={18} color={paymentMethod === 'dinheiro' ? '#fff' : '#d94a00'} />
            <Text style={[styles.paymentButtonText, paymentMethod === 'dinheiro' && styles.paymentButtonTextSelected]}>Dinheiro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  paymentContainer: {
    padding: 20,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  paymentButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentButtonSelected: {
    backgroundColor: '#d94a00',
  },
  paymentButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#d94a00',
  },
  paymentButtonTextSelected: {
    color: '#fff',
  },
});

export default PaymentFooter;
