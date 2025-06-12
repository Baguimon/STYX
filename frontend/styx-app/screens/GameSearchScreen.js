import React, { useEffect, useState, useContext } from 'react';
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
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGames, joinGame } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import matchIcon from '../assets/match-icon.png';

const { width } = Dimensions.get('window');

export default function GameSearchScreen() {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  const [games, setGames] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch(console.error);
  }, []);

  // Filtrer les games ouverts et TRIER du plus proche au plus lointain
  const filteredGames = games
    .filter(
      (game) =>
        game.status === 'ouvert' &&
        (searchCity === '' ||
          (game.location && game.location.toLowerCase().includes(searchCity.toLowerCase())))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatDateFR = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) +
      ' ' +
      date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
    );
  };

  // Fonction pour rejoindre le match
  const handleJoin = async (team) => {
    if (!userInfo || !userInfo.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    setLoading(true);
    try {
      await joinGame(selectedGame.id, userInfo.id, team);
      Alert.alert('Succès', "Tu as rejoint le match !");
      setModalVisible(false);
      getGames().then(setGames);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || "Impossible de rejoindre ce match");
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  // Nouveau composant carte verticale
  const renderItem = ({ item }) => {
    let displayLocation = item.location?.length > 24
      ? item.location.slice(0, 24) + '...'
      : item.location;

    const joueursDisplay =
      typeof item.playerCount === 'number' && typeof item.maxPlayers === 'number'
        ? `${item.playerCount} / ${item.maxPlayers}`
        : typeof item.playerCount === 'number'
        ? `${item.playerCount} joueurs`
        : typeof item.maxPlayers === 'number'
        ? `Max ${item.maxPlayers}`
        : "—";

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.leftIcon}>
            <Image source={matchIcon} style={styles.matchIcon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{displayLocation || "Lieu inconnu"}</Text>
            {item.locationDetails ? (
              <Text style={styles.cardSub}>{item.locationDetails}</Text>
            ) : null}
            <Text style={styles.cardDate}>{formatDateFR(item.date)}</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text style={styles.cardPlayers}>{joueursDisplay}</Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: item.playerCount < item.maxPlayers ? '#27D34D' : '#f44' }
              ]}
            />
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? '#329CB6' : '#46B3D0' },
          ]}
          onPress={() => {
            setSelectedGame(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Rejoindre</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* BOUTON RETOUR, position absolue, TOUJOURS CLIQUABLE */}
      <View style={styles.absoluteBackBtn}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 16, fontSize: 16 }}>
              Choisis ton équipe
            </Text>
            <Pressable
              style={styles.modalButton}
              disabled={loading}
              onPress={() => handleJoin(1)}
            >
              <Text style={styles.modalButtonText}>Équipe 1</Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              disabled={loading}
              onPress={() => handleJoin(2)}
            >
              <Text style={styles.modalButtonText}>Équipe 2</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_HEIGHT = 110;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", paddingHorizontal: 16, paddingTop: 40 },
  absoluteBackBtn: {
    position: 'absolute',
    top: 38,
    left: 8,
    zIndex: 50,
    // adapt paddingTop if your statusbar is higher (ex: iPhone X)
  },
  backButton: { marginBottom: 5 },
  backText: { color: '#39b5d4', fontSize: 16, fontWeight: 'bold', paddingVertical: 7, paddingHorizontal: 6 },
  banner: { width: '100%', height: 200, marginBottom: -50, marginTop: -35, alignSelf: 'center' },
  searchBar: { backgroundColor: '#222', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 },
  card: {
    backgroundColor: "#272930",
    borderRadius: CARD_RADIUS,
    minHeight: CARD_HEIGHT,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#666',
    flexDirection: "column",
    alignItems: "stretch",
    position: 'relative'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  leftIcon: {
    marginRight: 15,
    width: 48, height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  matchIcon: { width: 44, height: 44, resizeMode: "contain" },
  cardTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    maxWidth: width * 0.45,
    marginBottom: 0,
  },
  cardSub: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 1,
  },
  cardDate: {
    color: "#b5bac7",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
    marginTop: 1,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 44,
    marginLeft: 8,
  },
  cardPlayers: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  statusDot: {
    width: 10, height: 10,
    borderRadius: 11,
    marginTop: 6,
    alignSelf: "flex-end",
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
    width: "85%",
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#46B3D0',
    marginBottom: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 1,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  modalButtonText: { color: '#fff', fontSize: 16 },
  closeBtn: { position: 'absolute', right: 8, top: 8 },
});
