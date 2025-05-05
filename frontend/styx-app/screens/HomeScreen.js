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
import { getGames } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function HomeScreen() {
  const [games, setGames] = useState([]);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await getGames();
      setGames(data);
    } catch (error) {
      console.error('Erreur de chargement des matchs', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.location}</Text>
      <Text>Date : {new Date(item.date).toLocaleString()}</Text>
      <Text>Joueurs : {item.playerCount}/{item.maxPlayers}</Text>
      <Text>Status : {item.status}</Text>
      <Text>Club : {item.isClubMatch ? 'Oui' : 'Non'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createMatchButton}
        onPress={() => navigation.navigate('CreateMatch')}
      >
        <Text style={styles.createMatchText}>+ Ajouter un match</Text>
      </TouchableOpacity>

      <FlatList
        data={games}
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
  createMatchButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  createMatchText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});

