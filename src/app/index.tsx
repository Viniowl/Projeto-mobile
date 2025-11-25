// Importa ícones da biblioteca MaterialIcons para uso nos botões
import { MaterialIcons } from '@expo/vector-icons';
// Importa o hook router do Expo Router para navegação entre telas
import { router } from "expo-router";
// Importa componentes do React Native para criar a interface do usuário
import { BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Importa SafeAreaProvider e SafeAreaView para garantir que o conteúdo seja exibido dentro da área segura da tela
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../context/AuthContext';

// Define o componente principal da tela inicial
export default function Index(){

    const { entrarComoConvidado } = useAuth();

    function handleEntrarComoConvidado() {
        entrarComoConvidado();
        router.navigate("/menu");
    }

    return(
    // SafeAreaProvider envolve a aplicação para gerenciar áreas seguras
    <SafeAreaProvider>
        {/* SafeAreaView ajusta o layout para evitar áreas como o notch do celular */}
        <SafeAreaView style = {styles.container}>
            {/* View principal que agrupa todo o conteúdo da tela */}
            <View style={styles.content}>
                {/* Exibe a logo da pastelaria */}
                <Image
                    style={styles.logo}
                 source={require('../../assets/images/logopastel.png')}/>
                {/* Botão para entrar como convidado, navegando para a tela de menu */}
                <TouchableOpacity style={styles.button} onPress = {handleEntrarComoConvidado}>
                    <View style={styles.buttonContent}>
                        <MaterialIcons name="person" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style = {styles.buttonText}>Entrar como Convidado</Text>
                    </View>
                </TouchableOpacity>
                {/* Botão para fazer login, navegando para a tela de login */}
                <TouchableOpacity style={styles.button} onPress = {() => router.navigate("/login")}>
                    <View style={styles.buttonContent}>
                        <MaterialIcons name="login" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style = {styles.buttonText}>Login</Text>
                    </View>
                </TouchableOpacity>
                {/* Botão para fazer cadastro, navegando para a tela de cadastro */}
                <TouchableOpacity style={styles.button}  onPress={() => router.navigate("/cadastro")}>
                    <View style={styles.buttonContent}>
                        <MaterialIcons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style = {styles.buttonText}>Faça seu Cadastro</Text>
                    </View>
                </TouchableOpacity>
                {/* Botão para sair do aplicativo */}
                <TouchableOpacity style={styles.button} onPress={() => BackHandler.exitApp()}>
                    <Text style = {styles.buttonText}>Sair do Aplicativo</Text>
                </TouchableOpacity>  
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
    );
}

// Define a folha de estilos para os componentes da tela
const styles = StyleSheet.create({
    logo: {
        height:400,
        width:400,
        marginBottom: 10,
    },
    container: {
        flex: 1, // Ocupa toda a tela
        backgroundColor: "#fccb2cff", // Cor de fundo
        justifyContent: "center", // Centraliza o conteúdo verticalmente
        alignItems: "center" // Centraliza o conteúdo horizontalmente
    },
    content: {
        alignItems: "center" // Alinha os itens ao centro
    },
    titulo: {
        textAlign: "center",
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 30,
        color: '#fc1010ff',
    },
    button: {
        backgroundColor: '#d94a00', // Cor de fundo do botão
        paddingVertical: 14, // Espaçamento vertical interno
        paddingHorizontal: 36, // Espaçamento horizontal interno
        borderRadius: 14, // Borda arredondada
        marginVertical: 12, // Margem vertical externa
        minWidth: 260, // Largura mínima
        alignItems: 'center', // Alinha o conteúdo do botão ao centro
        // Sombra para dar elevação (Android)
        elevation: 6,
        // Sombra para dar elevação (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    buttonContent: {
        flexDirection: 'row', // Organiza o ícone e o texto em linha
        alignItems: 'center', // Alinha verticalmente ao centro
        justifyContent: 'center', // Centraliza horizontalmente
    },
    buttonIcon: {
        marginRight: 12, // Margem à direita do ícone
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "800",
        color: '#ffffff', // Cor do texto
        letterSpacing: 0.2,
    }
});