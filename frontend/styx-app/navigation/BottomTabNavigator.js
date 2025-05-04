import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ClubScreen from '../screens/ClubScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000' },
          tabBarActiveTintColor: '#00d9ff',
          tabBarInactiveTintColor: '#00d9ff',
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Accueil') {
              iconName = 'home-outline';
            } else if (route.name === 'Club') {
              iconName = 'people-outline';
            } else if (route.name === 'Profil') {
              iconName = 'person-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Club" component={ClubScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
