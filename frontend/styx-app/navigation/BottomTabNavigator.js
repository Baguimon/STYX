import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ClubScreen from '../screens/ClubScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabBarIcon from '../components/TabBarIcon';

import HomeIconImage from '../assets/home-icon.png';
import ClubIconImage from '../assets/club-icon.png';
import ProfileIconImage from '../assets/profile-icon.png';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: '#000', 
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
        },        
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#00d9ff',
        tabBarInactiveTintColor: '#00d9ff',
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let image = null;

          if (route.name === 'Accueil') {
            image = HomeIconImage;
          } else if (route.name === 'Club') {
            image = ClubIconImage;
          } else if (route.name === 'Profil') {
            image = ProfileIconImage;
          }

          return (
            <TabBarIcon
              name={iconName}
              size={size * 1.4}
              color={color}
              focused={focused}
              image={image}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Club" component={ClubScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
