// screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Bonjour {userInfo?.username ?? 'utilisateur'} 👋
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#8BEAFF',
    fontSize: 24,
    fontWeight: '600',
  },
});
