// screens/GameDetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GameDetailsScreen({ route, navigation }) {
  const { game } = route.params || {};

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aucune information sur ce match.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
          <Text style={styles.btnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du match</Text>
      <Text>Lieu : <Text style={styles.bold}>{game.location}</Text></Text>
      <Text>Date : <Text style={styles.bold}>{formatDate(game.date)}</Text></Text>
      <Text>Joueurs : <Text style={styles.bold}>{game.playerCount} / {game.maxPlayers}</Text></Text>
      <Text>Status : <Text style={styles.bold}>{game.status}</Text></Text>
      {/* Ajoute d'autres champs si besoin */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
        <Text style={styles.btnText}>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  bold: { fontWeight: '600' },
  btn: { marginTop: 32, backgroundColor: '#0af', padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
