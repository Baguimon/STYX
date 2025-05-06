import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGames } from '../services/api';

export default function GameSearchScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await getGames();
      setGames(data);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs :', error);
    }
  };

  const filteredGames = games.filter(
    (game) =>
      (searchCity === '' || (game.location && game.location.toLowerCase().includes(searchCity.toLowerCase()))) &&
      (selectedCategory === 'Toutes' ||
        (selectedCategory === 'Foot débutant' && game.status?.toLowerCase().includes('débutant')) ||
        (selectedCategory === 'Foot compétitif' && game.status?.toLowerCase().includes('compétitif')))
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.city}> • Ville inconnue</Text>
        </View>
        <Text style={styles.players}>
          {item.playerCount}/{item.maxPlayers}
        </Text>
      </View>
      <Text style={styles.category}>{item.status}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, { backgroundColor: pressed ? '#329CB6' : '#46B3D0' }]}
        onPress={() => console.log(`Match ID: ${item.id}`)}
      >
        <Text style={styles.buttonText}>Rejoindre</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Image source={require('../assets/styx-logo.png')} style={styles.banner} />
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher une ville..."
        placeholderTextColor="#ccc"
        value={searchCity}
        onChangeText={setSearchCity}
      />

      <View style={styles.filterContainer}>
        {['Toutes', 'Foot débutant', 'Foot compétitif'].map((category) => (
          <Pressable
            key={category}
            style={[styles.filterButton, selectedCategory === category && styles.activeFilter]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.filterText}>{category}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  topRow: {
    marginTop: 40,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#46B3D0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  banner: {
    height: 45,
    resizeMode: 'contain',
  },
  searchBar: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  filterButton: {
    padding: 6,
    backgroundColor: '#666',
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: '#46B3D0',
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  item: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#808080',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'baseline',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  city: {
    fontSize: 16,
    color: '#aaa',
  },
  players: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  category: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});
