import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Image
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getUserGames } from '../services/api';
import matchIcon from '../assets/match-icon.png';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MyGamesScreen() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const [games, setGames] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [notifState, setNotifState] = useState({});

  useEffect(() => {
    if (userInfo?.id) {
      getUserGames(userInfo.id)
        .then(setGames)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userInfo]);

  const now = new Date();
  const upcomingGames = games.filter(g => new Date(g.date) >= now);
  const pastGames = games.filter(g => new Date(g.date) < now);

  const toggleNotif = (id) => {
    setNotifState((prev) => ({ ...prev, [id]: !prev[id] }));
    // Ajoute ta vraie logique de notif ici si besoin
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Matchs</Text>
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'upcoming' && styles.tabBtnActive]}
          onPress={() => setTab('upcoming')}
        >
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>À venir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'past' && styles.tabBtnActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>Passés</Text>
        </TouchableOpacity>
      </View>
      {/* Cards */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <Text style={styles.loading}>Chargement...</Text>
        ) : (
          <FlatList
            data={tab === 'upcoming' ? upcomingGames : pastGames.length ? pastGames : fakePastGames}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <GameCard
                game={item}
                notifOn={!!notifState[item.id]}
                onToggleNotif={() => toggleNotif(item.id)}
                onPress={() => navigation.navigate('GameDetails', { game: item })}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyMsg}>
                {tab === 'upcoming'
                  ? "Aucun match à venir pour l'instant."
                  : "Aucun match passé."}
              </Text>
            }
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 35 }}
          />
        )}
      </View>
    </View>
  );
}

function GameCard({ game, notifOn, onToggleNotif, onPress }) {
  let displayLocation = game.location?.length > 24
    ? game.location.slice(0, 24) + '...'
    : game.location;

  // Couleur différente selon la team
  const teamColor = game.team === 2 ? '#d94141' : '#2170b9';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.leftIcon}>
        <Image source={matchIcon} style={styles.matchIcon} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{displayLocation || "Lieu inconnu"}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDateFR(game.date)}</Text>
        <View style={styles.teamNotifRow}>
          <View style={[styles.teamLabel, { backgroundColor: teamColor }]}>
            <Text style={styles.teamLabelText}>Équipe {game.team ?? '?'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={onToggleNotif}>
            <Ionicons
              name={notifOn ? "notifications" : "notifications-off"}
              size={18}
              color={notifOn ? "#46b3d0" : "#bbb"}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.rightInfo}>
        <Text style={styles.cardPlayers}>{game.playerCount} / {game.maxPlayers}</Text>
        <View style={[
          styles.statusDot,
          { backgroundColor: game.playerCount < game.maxPlayers ? '#27D34D' : '#f44' }
        ]} />
      </View>
    </TouchableOpacity>
  );
}

const fakePastGames = [
  { id: 'f1', location: "Stade d'Issy", date: "2024-05-01T18:00:00Z", playerCount: 12, maxPlayers: 14, team: 1 },
  { id: 'f2', location: "Le Five", date: "2024-05-10T20:00:00Z", playerCount: 10, maxPlayers: 10, team: 2 }
];

function formatDateFR(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) +
    ' ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
}

const CARD_HEIGHT = 90;
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  headerBar: {
    paddingTop: 38,
    paddingBottom: 16,
    backgroundColor: "#272930",
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative'
  },
  backBtn: {
    position: 'absolute',
    left: 18,
    top: 44,
    zIndex: 99,
    padding: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: -8,
    marginLeft: 0,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#272930",
    paddingHorizontal: 0,
    paddingTop: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: "#41B2D1",
    backgroundColor: "#272930",
  },
  tabText: {
    color: "#6d7683",
    fontSize: 20,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#41B2D1",
  },
  loading: {
    color: "#bbb",
    fontSize: 17,
    textAlign: "center",
    marginTop: 24,
  },
  emptyMsg: {
    color: "#bbb",
    fontSize: 17,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#272930",
    borderRadius: CARD_RADIUS,
    minHeight: CARD_HEIGHT,
    marginHorizontal: 12,
    marginBottom: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 2,
  },
  leftIcon: {
    marginRight: 15,
    width: 48, height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  matchIcon: {
    width: 44, height: 44, resizeMode: "contain",
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    maxWidth: width * 0.39,
    marginBottom: 0,
  },
  cardDate: {
    color: "#b5bac7",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
    marginTop: 1,
  },
  teamNotifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  teamLabel: {
    borderRadius: 11,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 10,
  },
  teamLabelText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  notifBtn: {
    marginLeft: 3,
    marginRight: 2,
    padding: 2,
    borderRadius: 14,
  },
  rightInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 13,
    minWidth: 44,
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
});
