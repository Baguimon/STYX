import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserDetailsScreen({ route }) {
  const { user } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.username}</Text>
      <Text>Email : {user.email}</Text>
      <Text>Rôle : {user.role}</Text>
      <Text>Niveau : {user.level}</Text>
      <Text>Date d'inscription : {user.createdAt}</Text>
      <Text>Club ID : {user.clubId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
