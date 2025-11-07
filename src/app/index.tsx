import { MaterialIcons } from '@expo/vector-icons';
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index(){
    return(
    <SafeAreaProvider>
        <SafeAreaView style = {styles.container}>
            <View style={styles.content}>
                <Image
                    style={styles.logo}
                 source={require('../../assets/images/logopastel.png')}/>
                <TouchableOpacity style={styles.button} onPress = {() => router.navigate("/menu")}>
                    <View style={styles.buttonContent}>
                        <MaterialIcons name="person" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style = {styles.buttonText}>Entrar como Convidado</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}  onPress={() => router.navigate("/cadastro")}>
                    <View style={styles.buttonContent}>
                        <MaterialIcons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style = {styles.buttonText}>Faça seu Cadastro</Text>
                    </View>
                </TouchableOpacity>  
            </View>
        </SafeAreaView>
    </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    logo: {
        height:400,
        width:400,
        marginBottom: 10,
    },
    container: {
        flex: 1,
        backgroundColor: "#fccb2cff",
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
        color: '#fc1010ff',
    },
    button: {
        backgroundColor: '#d94a00',
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 14,
        marginVertical: 12,
        minWidth: 260,
        alignItems: 'center',
        // shadow to match other screens
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "800",
        color: '#ffffff',
        letterSpacing: 0.2,
    }
});