import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { MenuProvider } from "../context/MenuContext";

export default function Layout(){
    return(
        <MenuProvider>
            <CartProvider>
                <AuthProvider>
                    <Stack screenOptions={{}}>
                        <Stack.Screen
                            name="index"
                            options={{headerShown:false}}
                        />
                        <Stack.Screen
                            name="menu"
                            options={{headerShown: false}}
                        />
                        <Stack.Screen
                            name="pagamento"
                            options={{headerShown: false}}
                        />
                    </Stack>
                </AuthProvider>
            </CartProvider>
        </MenuProvider>
    ) 
}
        
