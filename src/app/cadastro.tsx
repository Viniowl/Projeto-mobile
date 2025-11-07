import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const logoScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 visible

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

  // Quick WCAG-like contrast check for key color pairs — runs once on mount
  useEffect(() => {
    const hexToRgb = (hex: string) => {
      const h = hex.replace('#', '');
      const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };

    const srgbToLin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };

    const luminance = (hex: string) => {
      const { r, g, b } = hexToRgb(hex);
      return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
    };

    const contrastRatio = (hexA: string, hexB: string) => {
      const L1 = luminance(hexA);
      const L2 = luminance(hexB);
      const lighter = Math.max(L1, L2);
      const darker = Math.min(L1, L2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const checks: { name: string; a: string; b: string; threshold: number }[] = [
      { name: 'Heading vs Card', a: '#2d160e', b: '#fff8f3', threshold: 3.0 },
      { name: 'Subheading vs Card', a: '#4a2f24', b: '#fff8f3', threshold: 4.5 },
      { name: 'Placeholder vs Input BG', a: '#6b6b6b', b: '#fff7f1', threshold: 4.5 },
      { name: 'Button text vs Button BG', a: '#ffffff', b: '#d94a00', threshold: 3.0 },
    ];

    const failures: string[] = [];
    for (const c of checks) {
      try {
        const ratio = contrastRatio(c.a, c.b);
        if (ratio < c.threshold) failures.push(`${c.name}: ratio ${ratio.toFixed(2)} (needs ≥ ${c.threshold})`);
        // log for debugging
        // eslint-disable-next-line no-console
        console.log(`Contrast ${c.name}: ${ratio.toFixed(2)}`);
      } catch (e) {
        // ignore parse errors
      }
    }

    if (failures.length > 0) {
      Alert.alert('Contraste (WCAG) — atenção', failures.join('\n'));
    } else {
      // eslint-disable-next-line no-console
      console.log('Contrast check: all good');
    }
  }, []);

  const handleCadastro = () => {
    if (!nome || !telefone || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    
    console.log('Dados do Cadastro:', { nome, telefone, endereco });
    // show styled success banner instead of native alert
    setShowSuccess(true);
    Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    // clear fields
    setNome("");
    setTelefone("");
    setEndereco("");
    // hide after a short delay then navigate
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

              <View style={styles.inputRow}>
                <MaterialIcons name="person" size={20} color="#ff7a3d" accessibilityLabel="ícone nome" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Nome completo"
                  value={nome}
                  onChangeText={setNome}
                  placeholderTextColor="#6b6b6b"
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="phone" size={20} color="#ff7a3d" accessibilityLabel="ícone telefone" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Telefone"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#6b6b6b"
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="place" size={20} color="#ff7a3d" accessibilityLabel="ícone endereço" />
                <TextInput
                  style={styles.inputField}
                  placeholder="Endereço"
                  value={endereco}
                  onChangeText={setEndereco}
                  placeholderTextColor="#6b6b6b"
                />
              </View>

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
  cadastro: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff3ea',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff8f3',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    transform: [{ translateY: -8 }],
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    // shadow
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2d160e',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4a2f24',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#0bc3f1ff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#ffffffff",
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ffd8c2',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 50,
    backgroundColor: '#fff7f1',
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
  },
  botao: {
    backgroundColor: '#d94a00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    marginTop: 8,
  },
  botaoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  }
  ,
  botaoEmoji: {
    fontSize: 18,
    marginRight: 8,
  }
  ,
  successBanner: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#32a852',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  successText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  }
});
