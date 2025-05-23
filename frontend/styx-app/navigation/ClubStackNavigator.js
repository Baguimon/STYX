import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ClubHomeScreen from '../screens/ClubHomeScreen';      // Le screen “central”
import CreateClubScreen from '../screens/CreateClubScreen';
import JoinClubScreen from '../screens/JoinClubScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';

const Stack = createNativeStackNavigator();

export default function ClubStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClubHome" component={ClubHomeScreen} />
      <Stack.Screen name="CreateClub" component={CreateClubScreen} />
      <Stack.Screen name="JoinClub" component={JoinClubScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
    </Stack.Navigator>
  );
}
