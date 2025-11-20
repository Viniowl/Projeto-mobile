
// Contexto de autenticação para gerenciar login, logout e usuário autenticado.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../../services/api';

// Interface do usuário autenticado
interface User {
    id: string;
    nome: string; // Baseado no schema do banco
    telefone: string;
}

// Interface dos dados e funções do contexto de autenticação
interface AuthContextData {
    user: User | null;
    token: string | null;
    loading: boolean;
    login(telefone: string, senha: string): Promise<void>;
    logout(): void;
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Provider do contexto de autenticação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carrega dados do usuário e token do AsyncStorage ao iniciar o app
        async function loadStorageData() {
            try {
                const storagedUser = await AsyncStorage.getItem('@Pastelaria:user');
                const storagedToken = await AsyncStorage.getItem('@Pastelaria:token');

                if (storagedUser && storagedToken) {
                    const parsedUser = JSON.parse(storagedUser);
                    setUser(parsedUser);
                    setToken(storagedToken);
                    // O interceptor em api.ts adiciona o token aos headers
                }
            } catch (e) {
                console.error("Failed to load auth data from storage", e);
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    // Função para login do usuário
    async function login(telefone: string, senha: string) {
        try {
            console.log('Sending login request with:', { telefone, password: senha });
            const response = await api.post('/login', { telefone, password: senha });
            const { token, user } = response.data;

            setUser(user);
            setToken(token);

            // Salva dados no AsyncStorage
            await AsyncStorage.setItem('@Pastelaria:user', JSON.stringify(user));
            await AsyncStorage.setItem('@Pastelaria:token', token);
            // O interceptor agora usará esse token nas próximas requisições
        } catch (error: any) {
            console.log(error); // Log do erro completo para debug
            const errorMessage = error.response?.data?.error || 'Erro desconhecido ao fazer login.';
            throw new Error(errorMessage);
        }
    }

    // Função para logout do usuário
    async function logout() {
        await AsyncStorage.multiRemove(['@Pastelaria:user', '@Pastelaria:token']);
        setUser(null);
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar o contexto de autenticação
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { AuthContext };
