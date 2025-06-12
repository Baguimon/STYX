import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import GameSearchScreen from '../screens/GameSearchScreen'; 
import CreateGameScreen from '../screens/CreateGameScreen'; 
import ClubStackNavigator from '../navigation/ClubStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

// images
import HomeIcon from '../assets/home-icon.png';
import TerrainIcon from '../assets/terrain-icon.png';
import PlusIcon from '../assets/plus-icon.png';
import ClubLogo from '../assets/club-icon.png';
import ProfileIcon from '../assets/profile-icon.png';

const Tab = createBottomTabNavigator();

function CustomTabBarIcon({ image, focused, isCenter }) {
  if (isCenter) {
    // Bouton central stylé
    return (
      <View style={styles.centerButton}>
        <Image source={image} style={{ width: 36, height: 36, tintColor: '#000' }} />
      </View>
    );
  }
  return (
    <Image
      source={image}
      style={{
        width: 32,
        height: 32,
        tintColor: '#00d9ff',
        opacity: focused ? 1 : 0.7,
      }}
      resizeMode="contain"
    />
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => <CustomTabBarIcon image={HomeIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Terrain"
        component={GameSearchScreen}
        options={{
          tabBarIcon: ({ focused }) => <CustomTabBarIcon image={TerrainIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Créer"
        component={CreateGameScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon image={PlusIcon} focused={focused} isCenter />
          ),
        }}
        listeners={{
          tabPress: e => {
            // modal si besoin au lieu de naviguer
          },
        }}
      />
      <Tab.Screen
        name="Club"
        component={ClubStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ClubLogo}
              style={{
                width: 38,
                height: 38,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: focused ? '#00d9ff' : 'transparent',
                backgroundColor: '#000',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <CustomTabBarIcon image={ProfileIcon} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    backgroundColor: '#77dfff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
