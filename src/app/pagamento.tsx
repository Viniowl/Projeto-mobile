import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

// This data should ideally be shared from a single source
const menuData = [
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

const parsePrice = (price: string): number => {
  return parseFloat(price.replace('R$ ', '').replace(',', '.'));
};

export default function PagamentoScreen() {
  const { selectedItems: selectedItemsJson } = useLocalSearchParams<{ selectedItems: string }>();
  const selectedItemsIds = selectedItemsJson ? JSON.parse(selectedItemsJson) : [];

  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'dinheiro' | null>(null);
  const [cashAmount, setCashAmount] = useState('');

  const selectedItemsData = menuData.filter(item => selectedItemsIds.includes(item.id));

  const totalPrice = selectedItemsData.reduce((total, item) => {
    return total + parsePrice(item.price);
  }, 0);

  const handlePayment = () => {
    if (!paymentMethod) {
      Alert.alert('Forma de Pagamento', 'Por favor, selecione uma forma de pagamento.');
      return;
    }

    let message = `Pagamento de R$ ${totalPrice.toFixed(2).replace('.', ',')} confirmado com sucesso!`;

    if (paymentMethod === 'dinheiro') {
      const cash = parseFloat(cashAmount.replace(',', '.')) || 0;
      if (cash < totalPrice) {
        Alert.alert('Valor Insuficiente', 'O valor em dinheiro é menor que o total do pedido.');
        return;
      }
      const change = cash - totalPrice;
      message = `Pagamento de R$ ${totalPrice.toFixed(2).replace('.', ',')} em dinheiro confirmado. Seu troco é de R$ ${change.toFixed(2).replace('.', ',')}.`;
    }

    Alert.alert(
      'Pagamento Confirmado',
      message,
      [{ text: 'OK', onPress: () => router.navigate('/') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>
      <FlatList
        data={selectedItemsData}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListFooterComponent={
          <>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2).replace('.', ',')}</Text>
            </View>

            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Forma de Pagamento:</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'cartao' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('cartao')}
                >
                  <Text style={styles.paymentButtonText}>Cartão</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'pix' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('pix')}
                >
                  <Text style={styles.paymentButtonText}>Pix</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'dinheiro' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('dinheiro')}
                >
                  <Text style={styles.paymentButtonText}>Dinheiro</Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'dinheiro' && (
                <View style={styles.cashInputContainer}>
                  <Text style={styles.cashInputLabel}>Valor em Dinheiro (R$):</Text>
                  <TextInput
                    style={styles.cashInput}
                    keyboardType="numeric"
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholder="Ex: 50,00"
                  />
                </View>
              )}
            </View>
          </>
        }
      />
      <View style={styles.buttonContainer}>
        <Button title="Pagar" onPress={handlePayment} />
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
    width: '90%',
    alignSelf: 'center',
  },
  itemTitle: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 18,
    color: '#333',
  },
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
  },
  paymentButtonSelected: {
    backgroundColor: '#d1e7ff',
    borderColor: '#007bff',
  },
  paymentButtonText: {
    fontSize: 16,
  },
  cashInputContainer: {
    marginTop: 10,
  },
  cashInputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  cashInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
});