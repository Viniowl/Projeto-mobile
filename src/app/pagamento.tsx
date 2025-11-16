import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated, FlatList, Keyboard,
  LayoutAnimation, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity,
  UIManager, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddItemModal } from '../components/menu/AddItemModal';
import { Notification } from '../components/menu/Notification';
import { PaymentItemCard } from '../components/payment/PaymentItemCard';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { menuData, MenuItemData } from '../data/menuData';
import api from '../../services/api';

const parsePrice = (price: string): number => {
  return parseFloat(price.replace('R$ ', '').replace(',', '.'));
};

export default function PagamentoScreen() {
  const insets = useSafeAreaInsets();
  const {
    state: { items },
    addToCart,
    decreaseFromCart,
    clearCart,
  } = useCart();
  const { user } = useContext(AuthContext);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'dinheiro' | null>(null);
  const animRefs = useRef<Record<string, Animated.Value>>({});
  const [cashAmount, setCashAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ visible: true, message, type });
    notificationAnim.setValue(0);
    Animated.spring(notificationAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

    const duration = type === 'success' ? 1200 : 1400;
    setTimeout(() => {
      Animated.timing(notificationAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setNotification(null);
        if (type === 'success') {
          clearCart();
          router.replace('/menu');
        }
      });
    }, duration);
  };

  const checkoutBottom = keyboardHeight > 0 ? keyboardHeight + (insets.bottom || 6) : (insets.bottom || 6) + 6;

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncrease = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const item = menuData.find((i) => i.id === id);
    if (item) {
      addToCart({ id: item.id, name: item.title, price: parsePrice(item.price) });
    }
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleDecrease = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    decreaseFromCart(id);
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      showNotification('Por favor, selecione uma forma de pagamento.', 'error');
      return;
    }

    if (!user) {
      showNotification('Você precisa estar logado para fazer um pedido.', 'error');
      return;
    }

    let message = `Pagamento de R$ ${total.toFixed(2).replace('.', ',')} confirmado com sucesso!`;

    if (paymentMethod === 'dinheiro') {
      const cash = parseFloat(cashAmount.replace(',', '.')) || 0;
      if (cash < total) {
        showNotification('O valor em dinheiro é menor que o total do pedido.', 'error');
        return;
      }
      const change = cash - total;
      message = `Pagamento de R$ ${total.toFixed(2).replace('.', ',')} em dinheiro confirmado. Seu troco é de R$ ${change.toFixed(2).replace('.', ',')}.`;
    }

    const orderData = {
      items: items.map(item => ({
        id: item.id, // O backend espera o ID do produto
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      paymentMethod,
      userId: user.id,
    };

    try {
      await api.post('/orders', orderData);
      showNotification(message, 'success');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showNotification('Erro ao processar o pedido. Tente novamente.', 'error');
    }
  };

  const handleAddItem = (item: MenuItemData) => {
    addToCart({ id: item.id, name: item.title, price: parsePrice(item.price) });
  };

  const showCash = paymentMethod === 'dinheiro' && totalItemsCount > 0;

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
      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddItem={handleAddItem}
      />
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={items}
        renderItem={({ item }) => (
          <PaymentItemCard
            item={item}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            isSmall={isSmall}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        ListFooterComponent={() => (
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
      {notification && (
        <Notification
          visible={notification.visible}
          message={notification.message}
          type={notification.type}
          anim={notificationAnim}
        />
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
    borderColor: '#d94a00',
  },
  paymentButtonText: {
    fontSize: 16,
    color: '#d94a00',
    marginLeft: 8,
  },
  paymentButtonTextSelected: {
    color: '#fff',
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
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutBarCentered: {
    justifyContent: 'center',
  },
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
});