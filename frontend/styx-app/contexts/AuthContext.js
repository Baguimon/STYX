// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../services/api'; // <-- à ajouter dans ton api.js !

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        try {
          // Récupère le profil utilisateur via le token
          const user = await getMe();
          if (user && !user.error) {
            setUserInfo(user);
            setIsAuthenticated(true);
          } else {
            // Token expiré/invalide
            await AsyncStorage.removeItem('token');
            setUserInfo(null);
            setIsAuthenticated(false);
          }
        } catch (e) {
          // API inaccessible ou token expiré
          await AsyncStorage.removeItem('token');
          setUserInfo(null);
          setIsAuthenticated(false);
        }
      }
    };
    loadUser();
  }, []);

  // login prend maintenant le user (profil), pas juste le token
  const login = async (user, token) => {
    if (!token || !user) return;
    await AsyncStorage.setItem('token', token);
    setUserInfo(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
