import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import CreateGameScreen from '../screens/CreateGameScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab bar sans header */}
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Écran pour créer un match */}
      <Stack.Screen
        name="CreateMatch"
        component={CreateGameScreen}
        options={{ title: 'Créer un Match' }}
      />

      {/* Détail utilisateur */}
      <Stack.Screen
        name="UserDetails"
        component={UserDetailsScreen}
        options={{ title: 'Détail Utilisateur' }}
      />
    </Stack.Navigator>
  );
}
