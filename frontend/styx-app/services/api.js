import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://main-bvxea6i-y25mlzc6no7vs.ch-1.platformsh.site/api';

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour les tokens (peut être utilisé + tard si tu mets l’auth JWT côté back)
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  const publicRoutes = ['/register', '/login', '/users','/games', '/clubs'];
  const isPublic = publicRoutes.some(route => config.url.includes(route));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Détails d’un utilisateur par ID ---
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ========== USERS ==========

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

// ========== GAMES ==========

export const createGame = async (form) => {
  return api.post('/games', form);
};

export const getGames = async () => {
  const response = await api.get('/games');
  return response.data;
};

export const getGameById = async (id) => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

// ----------- Ajout fonction DÉTAILS MATCH -----------
// Alias pour l’UI, peut pointer sur la même route
export const getGameDetails = getGameById;

// ** LA BONNE MÉTHODE POUR REJOINDRE **
export const joinGame = async (gameId, userId, team) => {
  const response = await api.post(`/games/${gameId}/join`, { userId, team });
  return response.data;
};

export const getUserGames = async (userId) => {
  const response = await api.get(`/games/user/${userId}`);
  return response.data;
};

// ========== CLUBS ==========

export const getUserClub = async (userId) => {
  const response = await api.get(`/users/${userId}/club`);
  return response.data;
};

export const getClub = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}`);
  return response.data;
};

export const getClubs = async () => {
  const response = await api.get('/clubs');
  return response.data;
}

export const getClubMembers = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}/members`);
  return response.data;
};

export const createClub = async (form) => {
  return api.post('/clubs', form);
};

export const joinClub = async (userId, clubId) => {
  return api.post(`/users/${userId}/join-club`, { clubId });
};

export const leaveClub = async (userId) => {
  return api.post(`/users/${userId}/leave-club`);
};

export const setUserPoste = async (clubId, userId, poste) => {
  return api.post(`/clubs/${clubId}/set-poste/${userId}`, { poste });
};

export const transferCaptain = async (clubId, newCaptainId) => {
  return api.post(`/clubs/${clubId}/transfer-captain`, { newCaptainId });
};

export const updateClub = (clubId, data) =>
  api.patch(`/clubs/${clubId}`, data);

export const kickMember = (clubId, memberId) =>
  api.post(`/clubs/${clubId}/kick-member/${memberId}`);

// Récupérer les messages du club
// Récupérer les messages
export const getClubMessages = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/messages`);
  return res.data;
};

// Envoyer un message
export const sendClubMessage = async (clubId, { userId, text }) => {
  const res = await api.post(`/clubs/${clubId}/messages`, { userId, text });
  return res.data;
};

// Supprimer un message
export const deleteClubMessage = async (clubId, messageId) => {
  const res = await api.delete(`/clubs/${clubId}/messages/${messageId}`);
  return res.data;
};


export default api;
