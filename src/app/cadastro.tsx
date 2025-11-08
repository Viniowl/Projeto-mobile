import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Keyboard, KeyboardAvoidingView,
  KeyboardTypeOptions, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,
  View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type InputProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  accessibilityLabel: string;
};

const Input = ({ icon, placeholder, value, onChangeText, keyboardType, accessibilityLabel }: InputProps) => (
  <View style={styles.inputRow}>
    <MaterialIcons name={icon} size={20} color="#ff7a3d" accessibilityLabel={accessibilityLabel} />
    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#6b6b6b"
    />
  </View>
);

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const logoScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(logoScale, { toValue: 0.72, duration: 180, useNativeDriver: true }).start();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(logoScale, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [logoScale]);

  const handleCadastro = () => {
    if (!nome || !telefone || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    console.log('Dados do Cadastro:', { nome, telefone, endereco });
    setShowSuccess(true);
    Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setNome('');
    setTelefone('');
    setEndereco('');

    setTimeout(() => {
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setShowSuccess(false);
        router.push('/menu');
      });
    }, 1400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Animated.Image
                style={[styles.logo, { transform: [{ scale: logoScale }] }]}
                source={require('../../assets/images/logocadastro.png')}
                resizeMode="contain"
              />
              <Text style={styles.heading}>Crie sua conta</Text>
              <Text style={styles.subheading}>Peça rápido e acompanhe seu pedido</Text>

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
              {showSuccess && (
                <Animated.View
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.successBanner,
                    {
                      opacity: successAnim,
                      transform: [
                        {
                          translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }),
                        },
                      ],
                    },
                  ]}
                >
                  <MaterialIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.successText}>Cadastro realizado com sucesso!</Text>
                </Animated.View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    marginTop: 8,
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