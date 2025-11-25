// Importa ícones da biblioteca MaterialIcons para uso na interface.
import { MaterialIcons } from '@expo/vector-icons';
// Importa o hook router da expo-router para navegação entre telas.
import { router } from 'expo-router';
// Importa hooks do React para gerenciamento de estado, ciclo de vida e referências.
import React, { useContext, useEffect, useRef, useState } from 'react';
// Importa componentes do React Native para construir a interface do usuário.
import {
  Animated, Keyboard, KeyboardAvoidingView,
  KeyboardTypeOptions, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,
  View
} from 'react-native';
// Importa o SafeAreaView para garantir que o conteúdo não seja sobreposto por barras de status ou notches.
import { SafeAreaView } from 'react-native-safe-area-context';
// Importa o AuthContext para acessar o contexto de autenticação.
import { Notification } from '../components/menu/Notification';
import { AuthContext } from '../context/AuthContext';
// Importa a instância do Axios configurada para fazer requisições à API.
import api from '../../services/api';

// Define as propriedades esperadas pelo componente de Input.
type InputProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name']; // Nome do ícone do MaterialIcons.
  placeholder: string; // Texto de placeholder do campo.
  value: string; // Valor atual do campo.
  onChangeText: (text: string) => void; // Função chamada quando o texto muda.
  keyboardType?: KeyboardTypeOptions; // Tipo de teclado a ser exibido.
  accessibilityLabel: string; // Rótulo de acessibilidade.
  secureTextEntry?: boolean; // Define se o campo é de senha.
};

// Componente de Input reutilizável com ícone e funcionalidade de visibilidade de senha.
const Input = ({ icon, placeholder, value, onChangeText, keyboardType, accessibilityLabel, secureTextEntry }: InputProps) => {
  // Estado para controlar a visibilidade da senha.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Alterna a visibilidade da senha.
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.inputRow}>
      <MaterialIcons name={icon} size={20} color="#ff7a3d" accessibilityLabel={accessibilityLabel} />
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#6b6b6b"
        secureTextEntry={secureTextEntry && !isPasswordVisible} // Oculta o texto se for um campo de senha e a visibilidade estiver desativada.
      />
      {/* Mostra o ícone de visibilidade apenas para campos de senha. */}
      {secureTextEntry && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <MaterialIcons
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={20}
            color="#ff7a3d"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente principal da tela de Cadastro.
export default function CadastroScreen() {
  // Acessa a função de login do contexto de autenticação.
  const { login } = useContext(AuthContext);
  // Estados para armazenar os dados do formulário de cadastro.
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [senha, setSenha] = useState('');
  // Estado para controlar notificações (success/error)
  const [notification, setNotification] = useState<{ visible: boolean; message: string; type: 'success' | 'error' } | null>(null);

  // Referências para os valores de animação.
  const logoScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const notificationAnim = useRef(new Animated.Value(0)).current;

  // Efeito para animar o logo quando o teclado é exibido ou ocultado.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(logoScale, { toValue: 0.72, duration: 180, useNativeDriver: true }).start();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(logoScale, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
    // Remove os listeners ao desmontar o componente para evitar vazamentos de memória.
    return () => {
      show.remove();
      hide.remove();
    };
  }, [logoScale]);

  // Função para lidar com o processo de cadastro do usuário.
  const handleCadastro = async () => {
    // Validação simples para garantir que todos os campos foram preenchidos.
    if (!nome || !telefone || !endereco || !senha) {
      setNotification({ visible: true, message: 'Por favor, preencha todos os campos.', type: 'error' });
      Animated.timing(notificationAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(notificationAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setNotification(null));
      }, 2000);
      return;
    }

    try {
      // 1. Envia uma requisição POST para registrar o novo usuário na API.
      await api.post('/register', { nome, telefone, endereco, senha });

      // 2. Realiza o login automaticamente com o novo usuário para obter o token de autenticação.
      await login(telefone, senha);

      // 3. Mostra notificação de sucesso e navega para a tela de menu.
      setNotification({ visible: true, message: 'Cadastro realizado com sucesso!', type: 'success' });
      Animated.timing(notificationAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(notificationAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setNotification(null);
          router.push('/menu');
        });
      }, 1400);
    } catch (error: any) {
      // Exibe uma mensagem de erro caso o cadastro ou login falhe.
      const errorMessage = error.response?.data?.error || 'Ocorreu um erro ao cadastrar.';
      setNotification({ visible: true, message: errorMessage, type: 'error' });
      Animated.timing(notificationAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(notificationAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setNotification(null));
      }, 2200);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Ajusta a tela para o teclado não cobrir os inputs.
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Animated.Image
                style={[styles.logo, { transform: [{ scale: logoScale }] }]} // Aplica a animação de escala no logo.
                source={require('../../assets/images/logocadastro.png')}
                resizeMode="contain"
              />
              <Text style={styles.heading}>Crie sua conta</Text>
              <Text style={styles.subheading}>Peça rápido e acompanhe seu pedido</Text>

              {/* Inputs do formulário de cadastro. */}
              <Input
                icon="person"
                placeholder="Nome completo"
                value={nome}
                onChangeText={setNome}
                accessibilityLabel="ícone nome"
              />
              <Input
                icon="phone"
                placeholder="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                accessibilityLabel="ícone telefone"
              />
              <Input
                icon="place"
                placeholder="Endereço"
                value={endereco}
                onChangeText={setEndereco}
                accessibilityLabel="ícone endereço"
              />
              <Input
                icon="lock"
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                accessibilityLabel="ícone senha"
                secureTextEntry={true}
              />

              {/* Botão para submeter o formulário de cadastro. */}
              <TouchableOpacity
                style={styles.botao}
                onPress={handleCadastro}
                accessibilityLabel="Cadastrar"
                activeOpacity={0.9}
                onPressIn={() => Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
              >
                <Animated.View style={{ transform: [{ scale: buttonScale }], flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="receipt" size={20} color="#fff" />
                  <Text style={styles.botaoText}>Criar Conta</Text>
                </Animated.View>
              </TouchableOpacity>
              {/* Notification (success / error) */}
              {notification && (
                <Notification
                  visible={notification.visible}
                  message={notification.message}
                  type={notification.type}
                  anim={notificationAnim}
                />
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos para os componentes da tela de Cadastro.
const styles = StyleSheet.create({
  botao: {
    alignItems: 'center',
    backgroundColor: '#d94a00',
    borderRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    width: '100%',
  },
  botaoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#fff8f3',
    borderRadius: 16,
    elevation: 6,
    maxWidth: 480,
    marginBottom: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    transform: [{ translateY: -8 }],
    width: '100%',
  },
  container: {
    backgroundColor: '#fff3ea',
    flex: 1,
    padding: 16,
  },
  heading: {
    color: '#2d160e',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: '#fff7f1',
    borderColor: '#ffd8c2',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    height: 50,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  logo: {
    alignSelf: 'center',
    height: 120,
    marginBottom: 8,
    width: 120,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  subheading: {
    color: '#4a2f24',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successBanner: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#32a852',
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    top: 12,
  },
  successText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
});
