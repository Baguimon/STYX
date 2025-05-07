import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGames } from '../services/api';

export default function GameSearchScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    getGames().then(setGames).catch(console.error);
  }, []);

  const filteredGames = games.filter(
    (game) =>
      (searchCity === '' || (game.location && game.location.toLowerCase().includes(searchCity.toLowerCase()))) &&
      (selectedCategory === 'Toutes' ||
        (selectedCategory === 'Foot débutant' && game.status?.toLowerCase().includes('débutant')) ||
        (selectedCategory === 'Foot compétitif' && game.status?.toLowerCase().includes('compétitif')))
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.header}>
        <Image source={require('../assets/balls-pattern.png')} style={styles.ballIcon} />
        <View style={styles.headerText}>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.city}>Paris 16e</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.players}>{item.playerCount}/{item.maxPlayers}</Text>
          {item.status === 'ouvert' && <View style={styles.statusDot} />}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, { backgroundColor: pressed ? '#329CB6' : '#46B3D0' }]}
        onPress={() => {
          setSelectedGameId(item.id);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Rejoindre</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Image source={require('../assets/styx-logo.png')} style={styles.banner} />

      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher une ville..."
        placeholderTextColor="#ccc"
        value={searchCity}
        onChangeText={setSearchCity}
      />

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* POPUP */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, color: '#ccc' }}>✕</Text>
            </TouchableOpacity>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                console.log('Rejoindre avec le Club');
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Rejoindre avec le Club</Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                console.log('Rejoindre Seul');
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Rejoindre Seul</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#46B3D0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 90,
    resizeMode: 'contain',
    marginBottom: 10,
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
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ballIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  city: {
    fontSize: 13,
    color: '#ccc',
  },
  date: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  players: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4cd137',
    marginTop: 6,
  },
  button: {
    alignSelf: 'center',
    marginTop: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#46B3D0',
    alignItems: 'center',
    width: '75%',
  },
  modalButton: {
    marginTop: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#46B3D0',
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
});
