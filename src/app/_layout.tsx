import { Stack } from "expo-router";

export default function Layout(){
    return(
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

    ) 
        
        
}
        
