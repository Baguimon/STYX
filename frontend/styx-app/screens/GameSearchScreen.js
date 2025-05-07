import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGames } from '../services/api';
import ballIcon from '../assets/balls-pattern.png';

export default function GameSearchScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getGames();
        setGames(data);
      } catch (error) {
        console.error('Erreur lors du chargement des matchs :', error);
      }
    };
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const city = game.city || '';
    return (
      (searchCity === '' || city.toLowerCase().includes(searchCity.toLowerCase())) &&
      (selectedCategory === 'Toutes' ||
        (selectedCategory === 'Foot débutant' && game.status?.toLowerCase().includes('débutant')) ||
        (selectedCategory === 'Foot compétitif' && game.status?.toLowerCase().includes('compétitif')))
    );
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={ballIcon} style={styles.icon} />
        <View style={styles.details}>
          <Text style={styles.title}>{item.location}</Text>
          <Text style={styles.subtitle}>{item.city || 'Ville inconnue'}</Text>
        </View>
        <View style={styles.statusBlock}>
          <Text style={styles.players}>{item.playerCount}/{item.maxPlayers}</Text>
          {item.status?.toLowerCase() === 'ouvert' && <View style={styles.statusDot} />}
        </View>
      </View>

      <Text style={styles.date}>{formatDate(item.date)}</Text>

      <Pressable
        onPress={() => console.log('Match ID:', item.id)}
        style={({ pressed }) => [
          styles.joinButton,
          { backgroundColor: pressed ? '#329CB6' : '#46B3D0' },
        ]}
      >
        <Text style={styles.joinText}>Rejoindre</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Retour</Text>
      </Pressable>

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
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.activeFilter,
            ]}
          >
            <Text style={styles.filterText}>{category}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 45,
  },
  back: {
    color: '#46B3D0',
    fontSize: 16,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#666',
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: '#46B3D0',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 42,
    height: 42,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 12,
  },
  statusBlock: {
    alignItems: 'flex-end',
  },
  players: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#0f0',
    borderRadius: 4,
    marginTop: 4,
  },
  date: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  joinButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
