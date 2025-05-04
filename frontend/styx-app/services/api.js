import axios from 'axios';

const API_URL = 'http://10.0.0.27:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Aucun token injecté : API publique

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


export default api;


