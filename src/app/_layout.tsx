import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";

export default function Layout(){
    return(
        <CartProvider>
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
        </CartProvider>
    ) 
}
        
