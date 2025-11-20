// Importa ícones da biblioteca MaterialIcons para uso na interface.
import { MaterialIcons } from '@expo/vector-icons';
// Importa o hook router da expo-router para navegação entre telas.
import { router } from 'expo-router';
// Importa hooks do React para gerenciamento de estado, ciclo de vida e referências.
import React, { useContext, useEffect, useRef, useState } from 'react';
// Importa componentes do React Native para construir a interface do usuário.
import {
  Animated, FlatList, Keyboard,
  LayoutAnimation, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity,
  UIManager, View, useWindowDimensions,
} from 'react-native';
// Importa SafeAreaView e useSafeAreaInsets para lidar com áreas seguras do dispositivo.
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Importa componentes customizados.
import { AddItemModal } from '../components/menu/AddItemModal';
import { Notification } from '../components/menu/Notification';
import { PaymentItemCard } from '../components/payment/PaymentItemCard';
// Importa contextos para autenticação, carrinho e menu.
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product, useMenu } from '../context/MenuContext';
// Importa a instância do Axios configurada para fazer requisições à API.
import api from '../../services/api';

// Componente principal da tela de Pagamento.
export default function PagamentoScreen() {
  // Obtém as insets da área segura do dispositivo.
  const insets = useSafeAreaInsets();
  // Obtém o estado do carrinho e funções de manipulação do carrinho.
  const {
    state: { items },
    addToCart,
    decreaseFromCart,
    clearCart,
  } = useCart();
  // Obtém o usuário autenticado do contexto de autenticação.
  const { user } = useContext(AuthContext);
  // Obtém os dados do menu do contexto do menu.
  const { menu } = useMenu();

  // Calcula o total do pedido.
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Estados para gerenciar a forma de pagamento, valor em dinheiro e visibilidade do modal.
  const [paymentMethod, setPaymentMethod] = useState<'cartao' | 'pix' | 'dinheiro' | null>(null);
  const animRefs = useRef<Record<string, Animated.Value>>({}); // Referências para animações de itens.
  const [cashAmount, setCashAmount] = useState(''); // Valor inserido para pagamento em dinheiro.
  const [modalVisible, setModalVisible] = useState(false); // Visibilidade do modal de adicionar item.
  const [keyboardHeight, setKeyboardHeight] = useState(0); // Altura do teclado virtual.

  // Estado e animação para notificações.
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const notificationAnim = useRef(new Animated.Value(0)).current;

  // Efeito para monitorar a altura do teclado e ajustar o layout.
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    // Remove os listeners ao desmontar o componente.
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Efeito para habilitar LayoutAnimation experimental no Android.
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Função para exibir notificações (sucesso/erro).
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ visible: true, message, type });
    notificationAnim.setValue(0);
    Animated.spring(notificationAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();

    const duration = type === 'success' ? 1200 : 1400;
    setTimeout(() => {
      Animated.timing(notificationAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setNotification(null);
        if (type === 'success') {
          clearCart(); // Limpa o carrinho em caso de sucesso.
          router.replace('/menu'); // Redireciona para o menu.
        }
      });
    }, duration);
  };

  // Calcula a posição inferior da barra de checkout, considerando o teclado e as insets.
  const checkoutBottom = keyboardHeight > 0 ? keyboardHeight + (insets.bottom || 6) : (insets.bottom || 6) + 6;

  // Calcula o número total de itens no carrinho.
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Função para aumentar a quantidade de um item no carrinho.
  const handleIncrease = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Anima a mudança de layout.
    let itemFound;
    // Procura o item no menu para obter seus detalhes.
    for (const category of menu) {
      itemFound = category.products.find((i) => i.id === id);
      if (itemFound) break;
    }

    if (itemFound) {
      addToCart({ id: itemFound.id, name: itemFound.name, price: itemFound.price }); // Adiciona ao carrinho.
    }
    // Animação de escala para o item.
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  // Função para diminuir a quantidade de um item no carrinho.
  const handleDecrease = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Anima a mudança de layout.
    decreaseFromCart(id); // Diminui a quantidade no carrinho.
    // Animação de escala para o item.
    const a = animRefs.current[id] || (animRefs.current[id] = new Animated.Value(1));
    Animated.sequence([
      Animated.timing(a, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(a, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };

  // Função para processar o pagamento.
  const handlePayment = async () => {
    // Validação da forma de pagamento.
    if (!paymentMethod) {
      showNotification('Por favor, selecione uma forma de pagamento.', 'error');
      return;
    }

    // Validação do usuário logado.
    if (!user) {
      showNotification('Você precisa estar logado para fazer um pedido.', 'error');
      return;
    }

    let message = `Pagamento de R$ ${total.toFixed(2).replace('.', ',')} confirmado com sucesso!`;

    // Lógica específica para pagamento em dinheiro.
    if (paymentMethod === 'dinheiro') {
      const cash = parseFloat(cashAmount.replace(',', '.')) || 0;
      if (isNaN(cash) || cash <= 0) {
        showNotification('Por favor, insira um valor válido para o pagamento em dinheiro.', 'error');
        return;
      }
      if (cash < total) {
        showNotification('O valor em dinheiro é menor que o total do pedido.', 'error');
        return;
      }
      const change = cash - total;
      message = `Pagamento de R$ ${total.toFixed(2).replace('.', ',')} em dinheiro confirmado. Seu troco é de R$ ${change.toFixed(2).replace('.', ',')}.`;
    }

    // Dados do pedido a serem enviados para a API.
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
      // Envia o pedido para a API.
      await api.post('/orders', orderData);
      showNotification(message, 'success'); // Exibe notificação de sucesso.
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showNotification('Erro ao processar o pedido. Tente novamente.', 'error'); // Exibe notificação de erro.
    }
  };

  // Função para adicionar um item ao carrinho a partir do modal.
  const handleAddItem = (item: Product) => {
    addToCart({ id: item.id, name: item.name, price: item.price });
  };

  // Condição para exibir o campo de valor em dinheiro.
  const showCash = paymentMethod === 'dinheiro' && totalItemsCount > 0;

  // Obtém as dimensões da janela para responsividade.
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360 || height < 700; // Verifica se a tela é pequena.
  const baseCheckoutHeight = showCash ? 110 : 80; // Altura base da barra de checkout.
  // Preenchimento inferior da lista, considerando a barra de checkout.
  const contentPaddingBottom = baseCheckoutHeight + (insets.bottom || 6) + 12;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Resumo do Pedido</Text>
      {/* Botão para abrir o modal de adicionar item. */}
      <TouchableOpacity style={styles.addItemButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addItemButtonText}>+ Adicionar item</Text>
      </TouchableOpacity>
      {/* Modal para adicionar itens ao carrinho. */}
      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddItem={handleAddItem}
        menu={menu}
      />
      {/* Lista plana para exibir os itens do carrinho. */}
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
            {/* Exibe o total do pedido. */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalPrice}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>

            {/* Opções de forma de pagamento. */}
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

      {/* Barra de checkout flutuante na parte inferior. */}
      <View style={[styles.checkoutBar, { bottom: checkoutBottom }, isSmall && styles.checkoutBarSmall, !showCash && styles.checkoutBarCentered]}>
        {/* Campo para inserir valor em dinheiro, se a forma de pagamento for "dinheiro". */}
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
        {/* Botão de pagamento. */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (totalItemsCount === 0 || !paymentMethod) && styles.checkoutButtonDisabled, // Desabilita se não houver itens ou forma de pagamento.
            !showCash && styles.checkoutButtonFull, // Estilo para botão de largura total se não houver campo de dinheiro.
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
      {/* Componente de notificação. */}
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