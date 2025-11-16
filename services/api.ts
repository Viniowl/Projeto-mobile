import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.0.3:3000', // Certifique-se de que este é o seu IP local ou URL do servidor
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@Pastelaria:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;