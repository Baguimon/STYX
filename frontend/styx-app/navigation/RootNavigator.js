// navigation/RootNavigator.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../contexts/AuthContext';
import PlayerProfileScreen from '../screens/PlayerProfileScreen';

// === Ajoute cette ligne pour la screen "UpcomingGameScreen" ===

// APRÈS (corrige ici)
import MyGamesScreen from '../screens/MyGamesScreen';


// (Optionnel) Ajoute GameDetails si tu as une page détail :
import GameDetailsScreen from '../screens/GameDetailsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

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

      {/* 4) UpcomingGames accessible en dehors du MainNavigator */}
      {isAuthenticated && (
        <Stack.Screen name="MyGames" component={MyGamesScreen} />
      )}

      {/* 5) (Optionnel) Détails d'un match */}
      {isAuthenticated && (
        <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
      )}

      {/* 6) Profil d'un joueur */}
      {isAuthenticated && (
        <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} />
      )}
    </Stack.Navigator>
  );
}
