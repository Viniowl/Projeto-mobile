// Importa o componente Stack da biblioteca expo-router para navegação baseada em pilha.
import { Stack } from "expo-router";
// Importa o AuthProvider do contexto de autenticação para gerenciar o estado de autenticação do usuário.
import { AuthProvider } from "../context/AuthContext";
// Importa o CartProvider do contexto do carrinho para gerenciar o estado do carrinho de compras.
import { CartProvider } from "../context/CartContext";
// Importa o MenuProvider do contexto do menu para gerenciar o estado dos itens do menu.
import { MenuProvider } from "../context/MenuContext";

// Define o componente de layout principal da aplicação.
export default function Layout(){
    return(
        // O MenuProvider envolve os componentes filhos, fornecendo acesso ao contexto do menu.
        <MenuProvider>
            {/* O CartProvider envolve os componentes filhos, fornecendo acesso ao contexto do carrinho. */}
            <CartProvider>
                {/* O AuthProvider envolve os componentes filhos, fornecendo acesso ao contexto de autenticação. */}
                <AuthProvider>
                    {/* O Stack é o componente de navegação que gerencia as telas da aplicação. */}
                    <Stack screenOptions={{}}>
                        {/* Define a tela 'index' (inicial) e oculta o cabeçalho. */}
                        <Stack.Screen
                            name="index"
                            options={{headerShown:false}}
                        />
                        {/* Define a tela 'menu' e oculta o cabeçalho. */}
                        <Stack.Screen
                            name="menu"
                            options={{headerShown: false}}
                        />
                        {/* Define a tela 'pagamento' e oculta o cabeçalho. */}
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