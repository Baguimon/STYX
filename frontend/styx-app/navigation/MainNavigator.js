// navigation/MainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import CreateGameScreen from '../screens/CreateGameScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import GameSearchScreen from '../screens/GameSearchScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen'; // <--- AJOUTE CETTE LIGNE

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGame"
        component={CreateGameScreen}
        options={{ title: 'Créer un Match', headerShown: false }}
      />
      <Stack.Screen
        name="GameSearch"
        component={GameSearchScreen}
        options={{ title: 'Rejoindre un Match', headerShown: false }}
      />
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{ title: 'Détail Utilisateur', headerShown: true }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: 'Politique de confidentialité',
          headerShown: false, 
        }}
      />

    </Stack.Navigator>
  );
}
