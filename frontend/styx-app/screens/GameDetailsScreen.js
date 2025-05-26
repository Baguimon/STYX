import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import fieldImg from '../assets/field.jpg'; // Ajoute une image de terrain dans tes assets !

import { getGameDetails, joinGame, leaveGame, switchTeam } from '../services/api';

export default function GameDetailsScreen() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const gameId = route.params?.game?.id || route.params?.gameId;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = () => {
    setLoading(true);
    getGameDetails(gameId)
      .then(setGame)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (loading || !game) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#bbb" }}>Chargement...</Text>
      </View>
    );
  }

  // Trouve l'équipe de l'utilisateur connecté
  const myTeam = game.team;
  const alreadyJoined = !!myTeam;

  // Sépare joueurs par équipe
  const team1Players = game.players?.filter(p => p.team === 1) || [];
  const team2Players = game.players?.filter(p => p.team === 2) || [];
  // Met à jour la compo random (pour le terrain)
  const postes = ['GB', 'DC', 'DD', 'DG', 'MC', 'MD', 'MG', 'BU', 'AD', 'AG'];
  const compoTeam = [...team1Players, ...team2Players].slice(0, postes.length);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail du Match</Text>
      </View>
      {/* Infos principales */}
      <View style={styles.topInfos}>
        <Text style={styles.title}>{game.location}</Text>
        <Text style={styles.date}>{formatDateFR(game.date)}</Text>
        <Text style={styles.status}>Statut : {game.status}</Text>
        <Text style={styles.playersCount}>
          Joueurs : {game.playerCount} / {game.maxPlayers}
        </Text>
        <Text style={styles.teamLabel}>
          Ton équipe :
          <Text style={{
            color: myTeam === 1 ? "#2196F3" : myTeam === 2 ? "#e74c3c" : "#aaa",
            fontWeight: 'bold'
          }}>
            {myTeam ? `  ${myTeam}` : " Non assigné"}
          </Text>
        </Text>
      </View>
      {/* Actions */}
      <View style={styles.actionsRow}>
        {!alreadyJoined ? (
          <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(gameId)}>
            <Text style={styles.joinBtnText}>Rejoindre le match</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.quitBtn} onPress={() => handleLeave(gameId)}>
              <Text style={styles.quitBtnText}>Quitter le match</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchBtn} onPress={() => handleSwitchTeam(gameId)}>
              <Text style={styles.switchBtnText}>Changer d'équipe</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.notifBtn} disabled>
          <Ionicons name="notifications" size={22} color="#888" />
          <Text style={styles.notifBtnTxt}>Notif</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inviteBtn}>
          <Ionicons name="person-add" size={22} color="#41B2D1" />
          <Text style={styles.inviteBtnTxt}>Inviter</Text>
        </TouchableOpacity>
      </View>
      {/* Terrain / compo */}
      <View style={styles.fieldView}>
        <Image source={fieldImg} style={styles.fieldImg} />
        <View style={styles.compoOverlay}>
          {compoTeam.map((player, i) => (
            <View key={player.id || i} style={styles.playerPosteRow}>
              <Text style={styles.posteTxt}>{postes[i]}</Text>
              <Text style={styles.playerName}>{player.name || player.username || "?"}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Liste des joueurs */}
      <View style={styles.teamsSection}>
        <Text style={styles.teamsTitle}>Joueurs inscrits</Text>
        <View style={styles.teamsRow}>
          <View style={styles.teamCol}>
            <Text style={[styles.teamColTitle, { color: "#2196F3" }]}>Équipe 1</Text>
            {team1Players.map(p => (
              <Text key={p.id} style={styles.playerLine}>{p.name}</Text>
            ))}
          </View>
          <View style={styles.teamCol}>
            <Text style={[styles.teamColTitle, { color: "#e74c3c" }]}>Équipe 2</Text>
            {team2Players.map(p => (
              <Text key={p.id} style={styles.playerLine}>{p.name}</Text>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Fonctions handlers (pour la démo, à remplacer avec tes vrais services)
  function handleJoin(id) {
    Alert.alert("Inscription", "Tu as rejoint le match (demo)");
    // joinGame(id, userInfo.id, 1); // Ajoute l'API plus tard
  }
  function handleLeave(id) {
    Alert.alert("Quitter", "Tu as quitté le match (demo)");
    // leaveGame(id, userInfo.id);
  }
  function handleSwitchTeam(id) {
    Alert.alert("Équipe", "Tu as changé d'équipe (demo)");
    // switchTeam(id, userInfo.id);
  }
}

function formatDateFR(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) +
    ' ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
}

// Styles (ajuste selon tes couleurs)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#14171a" },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 32, paddingBottom: 13, backgroundColor: "#192230" },
  backBtn: { marginLeft: 7, marginRight: 8, marginTop: 4 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginLeft: 12, flex: 1 },
  topInfos: { alignItems: 'center', marginVertical: 13 },
  title: { color: "#fff", fontWeight: "bold", fontSize: 20, marginBottom: 2, textAlign: "center" },
  date: { color: "#b5bac7", fontSize: 15, marginBottom: 2 },
  status: { color: "#41B2D1", fontSize: 15, marginBottom: 2 },
  playersCount: { color: "#bbb", fontSize: 15, marginBottom: 6 },
  teamLabel: { color: "#bbb", fontSize: 15, marginBottom: 6 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 8 },
  joinBtn: { backgroundColor: "#41B2D1", borderRadius: 10, paddingVertical: 9, paddingHorizontal: 18, margin: 7 },
  joinBtnText: { color: "#fff", fontWeight: "bold" },
  quitBtn: { backgroundColor: "#f44", borderRadius: 10, paddingVertical: 9, paddingHorizontal: 15, margin: 7 },
  quitBtnText: { color: "#fff", fontWeight: "bold" },
  switchBtn: { backgroundColor: "#ffbe76", borderRadius: 10, paddingVertical: 9, paddingHorizontal: 18, margin: 7 },
  switchBtnText: { color: "#232", fontWeight: "bold" },
  notifBtn: { backgroundColor: "#222", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, margin: 7, paddingVertical: 9, opacity: 0.5 },
  notifBtnTxt: { color: "#bbb", marginLeft: 7 },
  inviteBtn: { backgroundColor: "#192230", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, margin: 7, paddingVertical: 9, borderWidth: 1, borderColor: "#41B2D1" },
  inviteBtnTxt: { color: "#41B2D1", marginLeft: 7 },
  fieldView: { marginTop: 18, alignItems: "center", justifyContent: "center" },
  fieldImg: { width: 270, height: 140, resizeMode: "contain", opacity: 0.82 },
  compoOverlay: { position: "absolute", top: 28, left: 32 },
  playerPosteRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  posteTxt: { color: "#41B2D1", width: 34, fontWeight: "bold" },
  playerName: { color: "#fff", fontWeight: "500" },
  teamsSection: { marginTop: 30, paddingHorizontal: 15 },
  teamsTitle: { color: "#fff", fontWeight: "bold", fontSize: 17, marginBottom: 7 },
  teamsRow: { flexDirection: "row", justifyContent: "space-between" },
  teamCol: { flex: 1, marginRight: 8 },
  teamColTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 6 },
  playerLine: { color: "#eee", fontSize: 14, marginBottom: 2, paddingLeft: 7 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
