// navigation/RootNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  // Tant que l'état d'authentification n'est pas connu, on ne rend rien
  if (isAuthenticated === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1) Intro (avant login) */}
      {!isAuthenticated && (
        <Stack.Screen name="Intro" component={IntroScreen} />
      )}

      {/* 2) Auth (Login / Register / Forgot) */}
      {!isAuthenticated && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}

      {/* 3) Main (Tabs + CreateMatch + UserDetails) */}
      {isAuthenticated && (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
