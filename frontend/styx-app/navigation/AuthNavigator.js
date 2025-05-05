// navigation/AuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'; // à créer plus tard si besoin

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Écran de connexion */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Écran d'inscription */}
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Si tu ajoutes ForgotPasswordScreen : */}
      {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </Stack.Navigator>
  );
}
