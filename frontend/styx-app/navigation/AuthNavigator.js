import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator'; 
import { AuthContext } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === null) return null; 

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Main' : 'Login'} screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
