import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import MainNavigator from './MainNavigator'; // ✅ Nouveau fichier qui contient Tabs + autres écrans

import { AuthContext } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  // On n'affiche rien tant que l'authentification n'est pas déterminée
  if (isAuthenticated === null) return null;

  // Si déjà connecté, RootNavigator gère la redirection vers "Main"
  if (isAuthenticated) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Main' : 'Login'} screenOptions={{ headerShown: true }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: true }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
