import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Keyboard, LayoutAnimation, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { selectedItems: selectedItemsJson } = useLocalSearchParams<{ selectedItems: string }>();
  const selectedItemsIds = selectedItemsJson ? JSON.parse(selectedItemsJson) : [];

  // build initial quantities map from incoming selected item ids
  const initialQuantities = (selectedItemsIds as string[]).reduce((acc: Record<string, number>, id: string) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'dinheiro' | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const animRefs = useRef<Record<string, Animated.Value>>({});
  const [cashAmount, setCashAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const errorAnim = useRef(new Animated.Value(0)).current;
  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const checkoutBottom = keyboardHeight > 0 ? keyboardHeight + (insets.bottom || 6) : (insets.bottom || 6) + 6;

  const itemsInCart = Object.keys(quantities)
    .map(id => {
      const found = menuData.find(m => m.id === id);
      return found ? { ...found, quantity: quantities[id] } : null;
    })
    .filter(Boolean) as Array<{ id: string; title: string; price: string; quantity: number }>;

  const totalPrice = itemsInCart.reduce((total, item) => {
    return total + parsePrice(item.price) * (item.quantity || 1);
  }, 0);

  const totalItemsCount = Object.values(quantities).reduce((s, v) => s + v, 0);

  const increaseQty = (id: string) => {
    // animate layout and quantity bump
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const decreaseQty = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuantities(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: current - 1 };
    });
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      Alert.alert('Forma de Pagamento', 'Por favor, selecione uma forma de pagamento.');
      return;
    }

    let message = `Pagamento de R$ ${totalPrice.toFixed(2).replace('.', ',')} confirmado com sucesso!`;

    if (paymentMethod === 'dinheiro') {
      const cash = parseFloat(cashAmount.replace(',', '.')) || 0;
      if (cash < totalPrice) {
        // show animated error banner instead of alert
        setErrorMessage('O valor em dinheiro é menor que o total do pedido.');
        setErrorVisible(true);
        errorAnim.setValue(0);
        Animated.spring(errorAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
        setTimeout(() => {
          Animated.timing(errorAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
            setErrorVisible(false);
          });
        }, 1400);
        return;
      }
      const change = cash - totalPrice;
      message = `Pagamento de R$ ${totalPrice.toFixed(2).replace('.', ',')} em dinheiro confirmado. Seu troco é de R$ ${change.toFixed(2).replace('.', ',')}.`;
    }

  // show confirmation banner and navigate home
  setSuccessMessage(message);
  setSuccessVisible(true);
  successAnim.setValue(0);
  Animated.spring(successAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    // auto-dismiss after a short delay and navigate
    setTimeout(() => {
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setSuccessVisible(false);
        router.replace('/');
      });
    }, 1200);
  };

  const showCash = paymentMethod === 'dinheiro' && totalItemsCount > 0;

  // responsive helpers
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360 || height < 700;
  const baseCheckoutHeight = showCash ? 110 : 80;
  const contentPaddingBottom = baseCheckoutHeight + (insets.bottom || 6) + 12;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>
      <TouchableOpacity style={styles.addItemButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addItemButtonText}>+ Adicionar item</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isSmall && styles.modalContainerSmall]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar ao pedido</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose} accessibilityLabel="Fechar">
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>
            <FlatList
              data={menuData}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <View style={styles.modalItem}>
                  <View>
                    <Text style={styles.modalItemTitle}>{item.title}</Text>
                    <Text style={styles.modalItemPrice}>{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={() => {
                      increaseQty(item.id);
                    }}
                  >
                    <Text style={styles.modalAddText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={itemsInCart}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, isSmall && styles.itemCardSmall]}>
            <View style={styles.itemRow}>
              <Text style={[styles.itemTitle, isSmall && styles.itemTitleSmall]}>{item.title}</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>

            <View style={styles.quantityRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={[styles.qtyButton, isSmall && styles.qtyButtonSmall]} onPress={() => decreaseQty(item.id)} accessibilityLabel={`Remover ${item.title}`}>
                  <MaterialIcons name="remove" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={[styles.qtyText, isSmall && styles.qtyTextSmall]}>{item.quantity}</Text>
                <TouchableOpacity style={[styles.qtyButton, isSmall && styles.qtyButtonSmall]} onPress={() => increaseQty(item.id)} accessibilityLabel={`Adicionar ${item.title}`}>
                  <MaterialIcons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.subtotalText, isSmall && styles.subtotalTextSmall]}>R$ {(parsePrice(item.price) * item.quantity).toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        ListFooterComponent={() => (
          <>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2).replace('.', ',')}</Text>
            </View>

            <View style={styles.paymentContainer}>
              <Text style={styles.paymentTitle}>Forma de Pagamento</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'cartao' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('cartao')}
                >
                  <MaterialIcons name="credit-card" size={18} color={paymentMethod === 'cartao' ? '#fff' : '#d94a00'} />
                  <Text style={[styles.paymentButtonText, paymentMethod === 'cartao' && styles.paymentButtonTextSelected]}>Cartão</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'pix' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('pix')}
                >
                  <MaterialIcons name="qr-code" size={18} color={paymentMethod === 'pix' ? '#fff' : '#d94a00'} />
                  <Text style={[styles.paymentButtonText, paymentMethod === 'pix' && styles.paymentButtonTextSelected]}>Pix</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton, paymentMethod === 'dinheiro' && styles.paymentButtonSelected]}
                  onPress={() => setPaymentMethod('dinheiro')}
                >
                  <MaterialIcons name="attach-money" size={18} color={paymentMethod === 'dinheiro' ? '#fff' : '#d94a00'} />
                  <Text style={[styles.paymentButtonText, paymentMethod === 'dinheiro' && styles.paymentButtonTextSelected]}>Dinheiro</Text>
                </TouchableOpacity>
              </View>

              {/* cash input moved to checkoutBar to avoid keyboard/overlay issues */}
            </View>
          </>
        )}
      />

      <View style={[styles.checkoutBar, { bottom: checkoutBottom }, isSmall && styles.checkoutBarSmall, !showCash && styles.checkoutBarCentered]}>
        {showCash && (
          <View style={styles.cashInputContainerCompact}>
            <Text style={styles.cashInputLabelCompact}>Dinheiro (R$)</Text>
            <TextInput
              style={[styles.cashInputCompact, isSmall && styles.cashInputCompactSmall]}
              keyboardType="numeric"
              value={cashAmount}
              onChangeText={setCashAmount}
              placeholder="Ex: 50,00"
              blurOnSubmit={false}
            />
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (totalItemsCount === 0 || !paymentMethod) && styles.checkoutButtonDisabled,
            !showCash && styles.checkoutButtonFull,
            isSmall && styles.checkoutButtonSmall,
          ]}
          onPress={handlePayment}
          activeOpacity={0.9}
          disabled={totalItemsCount === 0 || !paymentMethod}
        >
          <MaterialIcons name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.checkoutButtonText}>Pagar ({totalItemsCount})</Text>
        </TouchableOpacity>
      </View>
      {successVisible && (
        <View style={[styles.successOverlay, { paddingTop: insets.top + 160, justifyContent: 'flex-start' }]} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.successBox,
              { transform: [{ scale: successAnim }], opacity: successAnim, marginTop: 6 },
            ]}
          >
            <MaterialIcons name="check-circle" size={64} color="#fff" />
            <Text style={styles.successTitle}>Pagamento confirmado</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
          </Animated.View>
        </View>
      )}
      {errorVisible && (
        <View style={[styles.successOverlay, { paddingTop: insets.top + 160, justifyContent: 'flex-start' }]} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.errorBox,
              { transform: [{ scale: errorAnim }], opacity: errorAnim, marginTop: 6 },
            ]}
          >
            <MaterialIcons name="error" size={56} color="#fff" />
            <Text style={styles.errorTitle}>Erro</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff3ea',
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
  priceBadge: {
    backgroundColor: '#f3d8b0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
  },
  paymentButtonTextSelected: {
    color: '#fff',
    marginLeft: 8,
  },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: '#fff3ea',
    borderTopWidth: 1,
    borderTopColor: '#f0e0d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutInfo: {
    paddingLeft: 12,
  },
  checkoutTotalLabel: {
    fontSize: 12,
    color: '#6f4e3a',
  },
  checkoutTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#d94a00',
  },
  checkoutButton: {
    backgroundColor: '#d94a00',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '800',
    marginLeft: 8,
  },
  cashInputContainerCompact: {
    marginRight: 12,
    width: 160,
  },
  cashInputLabelCompact: {
    fontSize: 12,
    color: '#6f4e3a',
    marginBottom: 4,
  },
  cashInputCompact: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    fontSize: 14,
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
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutBarCentered: {
    justifyContent: 'center',
  },
  /* small screen variants */
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
  cashInputCompactSmall: {
    width: 120,
    height: 36,
    fontSize: 13,
  },
  checkoutBarSmall: {
    padding: 10,
  },
  checkoutButtonFull: {
    alignSelf: 'center',
    width: '68%',
  },
  checkoutButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addItemButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d94a00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  addItemButtonText: {
    color: '#d94a00',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 14,
  },
  modalContainerSmall: {
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalClose: {
    padding: 6,
  },
  modalCloseText: {
    color: '#d94a00',
    fontWeight: '700',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  modalAddButton: {
    backgroundColor: '#d94a00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalAddText: {
    color: '#fff',
    fontWeight: '700',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  successBox: {
    backgroundColor: '#2ecc71',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
  },
  successTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  successMessage: {
    color: '#f6fff9',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.95,
  },
  errorBox: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  errorMessage: {
    color: '#ffecec',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.95,
  },
});