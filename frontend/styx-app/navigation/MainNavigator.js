// navigation/MainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import CreateGameScreen from '../screens/CreateGameScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Barre d’onglets */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Écran “Créer un match” */}
      <Stack.Screen
        name="CreateGame"
        component={CreateGameScreen}
        options={{ title: 'Créer un Match', headerShown: true }}
      />

      {/* Détail utilisateur */}
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{ title: 'Détail Utilisateur', headerShown: true }}
      />
    </Stack.Navigator>
  );
}
