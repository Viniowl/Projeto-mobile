import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Index(){
    return(
    <SafeAreaProvider>
        <SafeAreaView style = {styles.container}>
            <View style={styles.content}>
                <Text style = {styles.titulo}>
                    Casa do Pastel
                </Text>
                <TouchableOpacity style={styles.button} onPress = {() => router.navigate("/menu")}>
                    <Text style = {styles.buttonText}>Entrar como Convidado</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}  onPress={() => router.navigate("/cadastro")}>
                    <Text style = {styles.buttonText}>Faça seu Cadastro</Text>
                </TouchableOpacity>  
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "steelblue",
        justifyContent: "center",
        alignItems: "center"
    },
    content: {
        alignItems: "center"
    },
    titulo: {
        textAlign: "center",
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 30,
        color: '#fff',
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginVertical: 10,
        minWidth: 250,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: 'steelblue',
    }
});