import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { Alert } from 'react-native';

interface User {
  id: string;
  nome: string; // Based on the database schema
  telefone: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login(telefone: string, senha: string): Promise<void>;
  logout(): void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const storagedUser = await AsyncStorage.getItem('@Pastelaria:user');
                const storagedToken = await AsyncStorage.getItem('@Pastelaria:token');

                if (storagedUser && storagedToken) {
                    const parsedUser = JSON.parse(storagedUser);
                    setUser(parsedUser);
                    setToken(storagedToken);
                    // The interceptor in api.ts will handle adding the token to headers
                }
            } catch (e) {
                console.error("Failed to load auth data from storage", e);
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    async function login(telefone: string, senha: string) {
        try {
            console.log('Sending login request with:', { telefone, password: senha });
            const response = await api.post('/login', { telefone, password: senha });
            const { token, user } = response.data;

            setUser(user);
            setToken(token);

            // Store data in AsyncStorage
            await AsyncStorage.setItem('@Pastelaria:user', JSON.stringify(user));
            await AsyncStorage.setItem('@Pastelaria:token', token);
            // The interceptor will now use this token for subsequent requests
        } catch (error: any) {
            console.log(error); // Log the full error object for debugging
            const errorMessage = error.response?.data?.error || 'Erro desconhecido ao fazer login.';
            throw new Error(errorMessage);
        }
    }

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

// Create a hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { AuthContext };