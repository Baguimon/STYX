import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://main-bvxea6i-y25mlzc6no7vs.ch-1.platformsh.site/api';

const api = axios.create({
  baseURL: API_URL,
});

// Aucun token injecté : API publique


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');


  const publicRoutes = ['/register', '/login', '/users','/games'];


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

export const createGame = async (form) => {
  return api.post('/games', form);
};

export const getGames = async () => {
  const response = await api.get('/games');
  return response.data;
};

export const getUserClub = async (userId) => {
  const response = await api.get(`/users/${userId}/club`);
  return response.data;
};

export const getClub = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}`);
  return response.data;
};

export const getClubMembers = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}/members`);
  return response.data;
};

export const joinClub = async (userId, clubId) => {
  const response = await api.post(`/users/${userId}/join-club`, { clubId });
  return response.data;
};

export const leaveClub = async (userId) => {
  const response = await api.post(`/users/${userId}/leave-club`);
  return response.data;
};



export default api;


