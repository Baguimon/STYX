// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '../services/api'; // Ajoute cette ligne !

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    };
    loadUser();
  }, []);

  const login = async (user) => {
    if (!user) return;
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUserInfo(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUserInfo(null);
    setIsAuthenticated(false);
  };

  // AJOUTE CECI :
  const refreshUserInfo = async () => {
    try {
      if (!userInfo?.id) return;
      const freshUser = await getUserById(userInfo.id);
      setUserInfo(freshUser);
      await AsyncStorage.setItem('user', JSON.stringify(freshUser));
    } catch (e) {
      // Optionnel : tu peux logout ici si tu veux gérer une erreur grave
      console.log('Erreur refreshUserInfo:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userInfo,
        login,
        logout,
        refreshUserInfo // <- expose la fonction ici !
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
