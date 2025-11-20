// Importa os ícones da biblioteca MaterialIcons para serem usados na interface.
import { MaterialIcons } from '@expo/vector-icons';
// Importa o hook `router` da biblioteca expo-router para gerenciar a navegação entre as telas.
import { router } from 'expo-router';
// Importa o React e os hooks `useState` e `useContext` para gerenciar o estado e o contexto do componente.
import React, { useState, useContext } from 'react';
// Importa vários componentes do React Native para construir a interface do usuário.
import {
    Alert, // Componente para exibir alertas nativos.
    Keyboard, // Módulo para interagir com o teclado virtual.
    KeyboardAvoidingView, // Componente que ajusta a tela quando o teclado é exibido.
    KeyboardTypeOptions, // Tipos de teclado (numérico, email, etc.).
    Platform, // Módulo para detectar a plataforma (iOS ou Android).
    StyleSheet, // Módulo para criar e gerenciar estilos.
    Text, // Componente para exibir texto.
    TextInput, // Componente para entrada de texto.
    TouchableOpacity, // Componente que responde a toques com um feedback de opacidade.
    TouchableWithoutFeedback, // Componente que responde a toques sem feedback visual.
    View, // Componente básico de contêiner.
} from 'react-native';
// Importa o SafeAreaView para garantir que o conteúdo não seja sobreposto por elementos da interface do sistema.
import { SafeAreaView } from 'react-native-safe-area-context';
// Importa o AuthContext para acessar o estado de autenticação e as funções relacionadas.
import { AuthContext } from '../context/AuthContext';

// Define as propriedades (props) que o componente Input espera receber.
type InputProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name']; // Nome do ícone a ser exibido.
  placeholder: string; // Texto de exemplo que aparece no campo antes da digitação.
  value: string; // O valor atual do campo de texto.
  onChangeText: (text: string) => void; // Função chamada quando o texto no campo muda.
  keyboardType?: KeyboardTypeOptions; // Tipo de teclado a ser exibido (ex: 'phone-pad').
  secureTextEntry?: boolean; // Se `true`, o texto é ocultado (usado para senhas).
};

// Componente reutilizável para campos de entrada de texto com ícone.
const Input = ({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry }: InputProps) => {
  // Estado para controlar se a senha deve ser exibida ou não.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Função para alternar a visibilidade da senha.
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    // Contêiner que agrupa o ícone e o campo de texto.
    <View style={styles.inputRow}>
      {/* Exibe o ícone passado como propriedade. */}
      <MaterialIcons name={icon} size={20} color="#ff7a3d" />
      {/* Campo de entrada de texto. */}
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#6b6b6b"
        // Oculta o texto se for um campo de senha e a visibilidade estiver desativada.
        secureTextEntry={secureTextEntry && !isPasswordVisible}
      />
      {/* Se for um campo de senha, exibe um ícone para alternar a visibilidade. */}
      {secureTextEntry && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <MaterialIcons
            // Alterna o ícone entre 'visibility' e 'visibility-off'.
            name={isPasswordVisible ? 'visibility-off' : 'visibility'}
            size={20}
            color="#ff7a3d"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componente principal da tela de Login.
export default function LoginScreen() {
  // Estados para armazenar o telefone e a senha digitados pelo usuário.
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  // Acessa a função `login` do contexto de autenticação.
  const { login } = useContext(AuthContext);

  // Função para lidar com a tentativa de login.
  const handleLogin = async () => {
    // Remove espaços em branco do início e do fim dos campos.
    const trimmedTelefone = telefone.trim();
    const trimmedSenha = senha.trim();

    // Verifica se ambos os campos foram preenchidos.
    if (!trimmedTelefone || !trimmedSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return; // Interrompe a execução se os campos estiverem vazios.
    }

    try {
      // Chama a função de login do AuthContext com as credenciais.
      await login(trimmedTelefone, trimmedSenha);
      // Se o login for bem-sucedido, navega para a tela de menu.
      router.push('/menu');
    } catch (error: any) {
      // Se ocorrer um erro, exibe um alerta com a mensagem de erro.
      Alert.alert('Erro no Login', error.message || 'Ocorreu um erro.');
    }
  };

  return (
    // Garante que o conteúdo da tela fique dentro da área segura do dispositivo.
    <SafeAreaView style={styles.container}>
      {/* Componente que ajusta a visualização para que o teclado não cubra os inputs. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Permite que o teclado seja fechado ao tocar em qualquer lugar fora dos inputs. */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Contêiner principal que centraliza o conteúdo. */}
          <View style={styles.innerContainer}>
            {/* Cartão que contém o formulário de login. */}
            <View style={styles.card}>
              {/* Título da tela. */}
              <Text style={styles.heading}>Bem-vindo de volta!</Text>
              {/* Subtítulo da tela. */}
              <Text style={styles.subheading}>Faça login para continuar</Text>

              {/* Componente de input para o telefone. */}
              <Input
                icon="phone"
                placeholder="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />
              {/* Componente de input para a senha. */}
              <Input
                icon="lock"
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={true}
              />

              {/* Botão para submeter o formulário de login. */}
              <TouchableOpacity
                style={styles.botao}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.botaoText}>Entrar</Text>
              </TouchableOpacity>

              {/* Link para navegar para a tela de cadastro. */}
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

// Define os estilos para os componentes da tela de login.
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3ea', // Cor de fundo da tela.
    flex: 1, // Faz com que o contêiner ocupe todo o espaço disponível.
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente.
    padding: 16, // Adiciona um espaçamento interno.
  },
  card: {
    backgroundColor: '#fff8f3', // Cor de fundo do cartão.
    borderRadius: 16, // Bordas arredondadas.
    padding: 20, // Espaçamento interno do cartão.
    elevation: 6, // Adiciona uma sombra no Android.
    shadowColor: '#000', // Cor da sombra no iOS.
    shadowOffset: { width: 0, height: 4 }, // Deslocamento da sombra no iOS.
    shadowOpacity: 0.1, // Opacidade da sombra no iOS.
    shadowRadius: 8, // Raio da sombra no iOS.
  },
  heading: {
    color: '#2d160e', // Cor do texto do título.
    fontSize: 24, // Tamanho da fonte.
    fontWeight: '800', // Peso da fonte.
    textAlign: 'center', // Alinhamento do texto.
    marginBottom: 8, // Margem inferior.
  },
  subheading: {
    color: '#4a2f24', // Cor do texto do subtítulo.
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row', // Alinha os itens horizontalmente.
    alignItems: 'center', // Alinha os itens verticalmente ao centro.
    backgroundColor: '#fff7f1',
    borderColor: '#ffd8c2',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1, // Ocupa o espaço restante na linha.
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#d94a00', // Cor de fundo do botão.
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
    color: '#ffffff', // Cor do texto do botão.
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#d94a00', // Cor do texto do link.
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});
