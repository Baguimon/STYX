// Importation des dépendances
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de base de l'API backend
const API_URL = 'https://main-bvxea6i-y25mlzc6no7vs.ch-1.platformsh.site/api';

// Création d'une instance Axios avec l'URL de base
const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur Axios pour ajouter automatiquement le token JWT si disponible
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  // Routes accessibles sans authentification
  const publicRoutes = ['/register', '/login', '/users', '/games', '/clubs'];
  const isPublic = publicRoutes.some(route => config.url.includes(route));

  // Ajout du header Authorization uniquement pour les routes privées
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config; // Pas de protection CSRF nécessaire ici
});


// ====================== UTILISATEURS ======================

// Récupérer les infos d'un utilisateur par ID
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Supprimer un utilisateur par ID
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Récupérer tous les utilisateurs
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// Enregistrer un nouvel utilisateur
export const registerUser = async (form) => {
  return api.post('/register', form);
};

// Connexion d'un utilisateur
export const loginUser = async (form) => {
  return api.post('/login', form);
};


// ====================== JEUX ======================

// Créer un nouveau jeu
export const createGame = async (form) => {
  return api.post('/games', form);
};

// Récupérer tous les jeux
export const getGames = async () => {
  const response = await api.get('/games');
  return response.data;
};

// Récupérer un jeu par son ID
export const getGameById = async (id) => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

// Alias (nom alternatif) pour getGameById
export const getGameDetails = getGameById;

// Rejoindre un jeu
export const joinGame = async (gameId, userId, team) => {
  const response = await api.post(`/games/${gameId}/join`, { userId, team });
  return response.data;
};

// Quitter un jeu
export const leaveGame = async (gameId, userId) => {
  const response = await api.post(`/games/${gameId}/leave`, { userId });
  return response.data;
};

// Changer d'équipe dans un jeu
export const switchTeam = async (gameId, userId, team) => {
  const response = await api.post(`/games/${gameId}/switch-team`, { userId, team });
  return response.data;
};

// Récupérer tous les jeux d'un utilisateur
export const getUserGames = async (userId) => {
  const response = await api.get(`/games/user/${userId}`);
  return response.data;
};


// ====================== CLUBS ======================

// Récupérer le club d’un utilisateur
export const getUserClub = async (userId) => {
  const response = await api.get(`/users/${userId}/club`);
  return response.data;
};

// Récupérer les infos d’un club par ID
export const getClub = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}`);
  return response.data;
};

// Récupérer tous les clubs
export const getClubs = async () => {
  const response = await api.get('/clubs');
  return response.data;
};

// Récupérer les membres d’un club
export const getClubMembers = async (clubId) => {
  const response = await api.get(`/clubs/${clubId}/members`);
  return response.data;
};

// Créer un nouveau club
export const createClub = async (form) => {
  return api.post('/clubs', form);
};

// Rejoindre un club
export const joinClub = async (userId, clubId) => {
  return api.post(`/users/${userId}/join-club`, { clubId });
};

// Quitter un club
export const leaveClub = async (userId) => {
  return api.post(`/users/${userId}/leave-club`);
};

// Définir un poste (rôle) pour un membre du club
export const setUserPoste = async (clubId, userId, poste) => {
  return api.post(`/clubs/${clubId}/set-poste/${userId}`, { poste });
};

// Transférer le capitanat à un autre membre
export const transferCaptain = async (clubId, newCaptainId) => {
  return api.post(`/clubs/${clubId}/transfer-captain`, { newCaptainId });
};

// Mettre à jour les infos d’un club
export const updateClub = (clubId, data) =>
  api.patch(`/clubs/${clubId}`, data);

// Exclure un membre du club
export const kickMember = (clubId, memberId) =>
  api.post(`/clubs/${clubId}/kick-member/${memberId}`);

// Récupérer les messages du club
export const getClubMessages = async (clubId) => {
  const res = await api.get(`/clubs/${clubId}/messages`);
  return res.data;
};

// Envoyer un message dans le club
export const sendClubMessage = async (clubId, { userId, text }) => {
  const res = await api.post(`/clubs/${clubId}/messages`, { userId, text });
  return res.data;
};

// Supprimer un message du club
export const deleteClubMessage = async (clubId, messageId) => {
  const res = await api.delete(`/clubs/${clubId}/messages/${messageId}`);
  return res.data;
};

// Mettre à jour l’avatar d’un utilisateur (via fetch direct, hors axios)
export async function updateUserAvatarIndex(userId, avatarIndex) {
  const res = await fetch(`https://main-bvxea6i-y25mlzc6no7vs.ch-1.platformsh.site/users/${userId}/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarIndex }),
  });
  if (!res.ok) throw new Error('Erreur serveur');
  return res.json();
}

// Export par défaut de l'instance Axios
export default api;
