import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, Keyboard, KeyboardAvoidingView,
    KeyboardTypeOptions, Platform, StyleSheet,
    Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../../services/api'; // Importa a nova função de login

type InputProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
};

const Input = ({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry }: InputProps) => (
  <View style={styles.inputRow}>
    <MaterialIcons name={icon} size={20} color="#ff7a3d" />
    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#6b6b6b"
      secureTextEntry={secureTextEntry}
    />
  </View>
);

export default function LoginScreen() {
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!telefone || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Chama a função da API com os dados do formulário
      const result = await loginUser({ telefone, senha });

      // Se o login for bem-sucedido, o backend retorna uma mensagem.
      Alert.alert('Sucesso!', result.message);

      // Navega para a tela de menu após o login
      router.push('/menu');

    } catch (error: any) {
      // Se a API retornar um erro (ex: senha incorreta), mostramos um alerta
      Alert.alert('Erro no Login', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <View style={styles.card}>
              <Text style={styles.heading}>Bem-vindo de volta!</Text>
              <Text style={styles.subheading}>Faça login para continuar</Text>

              <Input
                icon="phone"
                placeholder="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />
              <Input
                icon="lock"
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={true}
              />

              <TouchableOpacity
                style={styles.botao}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.botaoText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/cadastro')}>
                <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3ea',
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff8f3',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heading: {
    color: '#2d160e',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    color: '#4a2f24',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7f1',
    borderColor: '#ffd8c2',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#d94a00',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  botaoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#d94a00',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});