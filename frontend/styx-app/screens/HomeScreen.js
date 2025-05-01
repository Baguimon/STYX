import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUsers } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erreur de chargement des utilisateurs', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('UserDetails', { user: item })}>
      <View style={styles.item}>
        <Text style={styles.username}>{item.username}</Text>
        <Text>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <View style={styles.logoutContainer}>
        <Button title="Déconnexion" onPress={logout} color="#D9534F" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});


