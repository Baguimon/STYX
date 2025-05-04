import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.0.27:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token à chaque requête, sauf pour les routes publiques
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  // Liste des routes publiques
  const publicRoutes = ['/register', '/login', '/users'];

  // Ne pas ajouter le token pour les routes publiques
  const isPublic = publicRoutes.some(route => config.url.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const registerUser = async (form) => {
  return api.post('/register', form);
};

export const loginUser = async (form) => {
  return api.post('/login', form);
};

export default api;


