// GameDetailsScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import fieldImg from '../assets/field.jpg'; // Visuel statique du terrain

import { getGameById, joinGame, leaveGame, switchTeam } from '../services/api';

const TEAM_COLORS = {
  1: '#2196F3',
  2: '#e74c3c'
};

export default function GameDetailsScreen() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const gameId = route.params?.game?.id || route.params?.gameId;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamTab, setTeamTab] = useState(1);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = () => {
    setLoading(true);
    getGameById(gameId)
      .then(setGame)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Trouve l'équipe de l'utilisateur connecté
  const myPlayer = game?.players?.find(p => p.id === userInfo.id);
  const myTeam = myPlayer?.team;
  const alreadyJoined = !!myTeam;

  const team1Players = game?.players?.filter(p => p.team === 1) || [];
  const team2Players = game?.players?.filter(p => p.team === 2) || [];

  // Gestion équipe pleine
  const isFull = game?.playerCount >= game?.maxPlayers;

  // Fonctions d'ouverture des apps de navigation
  const openMaps = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };
  const openWaze = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    const url = `https://waze.com/ul?q=${query}`;
    Linking.openURL(url);
  };
  const openCityMapper = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    const url = `https://citymapper.com/directions?endaddress=${query}`;
    Linking.openURL(url);
  };

  // Join/Leave/Switch team
  const handleJoin = async () => {
    try {
      await joinGame(gameId, userInfo.id, teamTab);
      fetchDetails();
    } catch (e) {
      alert("Impossible de rejoindre le match !");
    }
  };
  const handleLeave = async () => {
    try {
      await leaveGame(gameId, userInfo.id);
      fetchDetails();
    } catch (e) {
      alert("Impossible de quitter le match !");
    }
  };
  const handleSwitchTeam = async () => {
    try {
      const newTeam = myTeam === 1 ? 2 : 1;
      await switchTeam(gameId, userInfo.id, newTeam);
      fetchDetails();
    } catch (e) {
      alert("Impossible de changer d'équipe !");
    }
  };

  if (loading || !game) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#bbb" }}>Chargement...</Text>
      </View>
    );
  }

  // Affichage principal
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du Match</Text>
      </View>

      {/* Bandeau date / joueurs */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>
          <Ionicons name="calendar-outline" size={15} /> {formatShortDate(game.date)}
        </Text>
        <Text style={styles.topBarText}>
          <Ionicons name="people" size={15} /> {game.playerCount} / {game.maxPlayers}
        </Text>
      </View>

      {/* Localisation */}
      <Text style={styles.sectionTitle}>Localisation</Text>
      <View style={styles.locationBox}>
        <Text style={styles.locationText}>{game.location}</Text>
        <View style={styles.locationBtns}>
          <TouchableOpacity onPress={openMaps} style={styles.locAppBtn}>
            <Ionicons name="map" size={26} color="#41B2D1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openWaze} style={styles.locAppBtn}>
            <Ionicons name="navigate" size={26} color="#41B2D1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={openCityMapper} style={styles.locAppBtn}>
            <Ionicons name="subway-outline" size={26} color="#41B2D1" />
          </TouchableOpacity>
        </View>
        <Image source={fieldImg} style={styles.mapImg} />
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        {/* Boutons */}
        {!alreadyJoined && !isFull && (
          <TouchableOpacity style={[styles.joinBtn, { backgroundColor: TEAM_COLORS[teamTab] }]} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>Rejoindre {teamTab === 1 ? "Équipe 1" : "Équipe 2"}</Text>
          </TouchableOpacity>
        )}
        {alreadyJoined && (
          <>
            <TouchableOpacity style={styles.quitBtn} onPress={handleLeave}>
              <Text style={styles.quitBtnText}>Quitter le match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchTeam}>
              <Text style={styles.switchBtnText}>Changer d'équipe</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.inviteBtn}>
          <Ionicons name="person-add" size={22} color="#41B2D1" />
          <Text style={styles.inviteBtnTxt}>Inviter</Text>
        </TouchableOpacity>
      </View>

      {/* Onglets équipes */}
      <View style={styles.teamsTabs}>
        <TouchableOpacity
          style={[styles.teamTab, teamTab === 1 && styles.teamTabActiveBlue]}
          onPress={() => setTeamTab(1)}
        >
          <Text style={[styles.teamTabText, teamTab === 1 && { color: TEAM_COLORS[1] }]}>Équipe 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.teamTab, teamTab === 2 && styles.teamTabActiveRed]}
          onPress={() => setTeamTab(2)}
        >
          <Text style={[styles.teamTabText, teamTab === 2 && { color: TEAM_COLORS[2] }]}>Équipe 2</Text>
        </TouchableOpacity>
      </View>

      {/* Liste joueurs */}
      <View>
        {(teamTab === 1 ? team1Players : team2Players).length === 0 && (
          <Text style={styles.noPlayerTxt}>Aucun joueur dans cette équipe.</Text>
        )}
        {(teamTab === 1 ? team1Players : team2Players).map(player => (
          <View key={player.id} style={styles.playerRow}>
            <Image
              source={player.avatar ? { uri: player.avatar } : require('../assets/avatar.png')}
              style={styles.playerAvatar}
            />
            <Text style={styles.playerName}>{player.username || player.name}</Text>
            <TouchableOpacity
              style={styles.playerProfileBtn}
              onPress={() => navigation.navigate('UserProfile', { userId: player.id })}
            >
              <Text style={styles.profileBtnTxt}>Profil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#14171a" },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 32, paddingBottom: 13, backgroundColor: "#192230" },
  backBtn: { marginLeft: 7, marginRight: 8, marginTop: 4 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginLeft: 12, flex: 1 },

  topBar: { flexDirection: 'row', justifyContent: "space-between", padding: 12, backgroundColor: "#181d22" },
  topBarText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  sectionTitle: { color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 20, marginBottom: 9, marginLeft: 14 },

  locationBox: { backgroundColor: "#232834", borderRadius: 14, marginHorizontal: 16, marginBottom: 12, padding: 13, alignItems: "center" },
  locationText: { color: "#fff", fontWeight: "500", fontSize: 15, textAlign: "center", marginBottom: 8 },
  locationBtns: { flexDirection: "row", marginBottom: 8, gap: 16 },
  locAppBtn: { marginHorizontal: 7, padding: 7, borderRadius: 16, backgroundColor: "#181d22" },
  mapImg: { width: 170, height: 100, borderRadius: 11, marginTop: 4, resizeMode: "cover", opacity: 0.95 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 },
  joinBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, margin: 6 },
  joinBtnText: { color: "#fff", fontWeight: "bold" },
  quitBtn: { backgroundColor: "#f44", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, margin: 6 },
  quitBtnText: { color: "#fff", fontWeight: "bold" },
  switchBtn: { backgroundColor: "#ffbe76", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, margin: 6 },
  switchBtnText: { color: "#232", fontWeight: "bold" },
  inviteBtn: { backgroundColor: "#192230", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, margin: 6, paddingVertical: 10, borderWidth: 1, borderColor: "#41B2D1" },
  inviteBtnTxt: { color: "#41B2D1", marginLeft: 7 },

  teamsTabs: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 22, marginBottom: 10 },
  teamTab: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10, marginHorizontal: 8, backgroundColor: "#232834" },
  teamTabActiveBlue: { borderWidth: 2, borderColor: "#2196F3", backgroundColor: "#1a2636" },
  teamTabActiveRed: { borderWidth: 2, borderColor: "#e74c3c", backgroundColor: "#331a1a" },
  teamTabText: { color: "#bbb", fontWeight: "bold", fontSize: 16 },

  noPlayerTxt: { color: "#bbb", fontSize: 15, textAlign: "center", marginVertical: 9 },
  playerRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#232834", borderRadius: 10, marginHorizontal: 20, marginBottom: 8, padding: 8, paddingHorizontal: 12 },
  playerAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10, backgroundColor: "#333" },
  playerName: { color: "#fff", fontWeight: "600", fontSize: 15, flex: 1 },
  playerProfileBtn: { borderWidth: 1, borderColor: "#41B2D1", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 11 },
  profileBtnTxt: { color: "#41B2D1", fontWeight: "bold" },

  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
