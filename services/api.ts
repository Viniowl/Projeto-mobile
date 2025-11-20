// Configuração do cliente Axios para chamadas à API do backend.
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Cria instância do Axios com baseURL do backend
const api = axios.create({
  baseURL: 'http://192.168.0.3:3000', // Certifique-se de que este é o seu IP local ou URL do servidor
});

// Interceptor para adicionar token JWT automaticamente nos headers das requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@Pastelaria:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Exporta instância configurada do Axios
export default api;