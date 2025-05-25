import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { getUserGames } from '../services/api';

export default function UpcomingGamesScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo?.id) {
      getUserGames(userInfo.id)
        .then(data => setGames(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userInfo]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('GameDetails', { game: item })}>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.info}>
        {item.playerCount} / {item.maxPlayers} - {formatDate(item.date)}
      </Text>
      <Text style={styles.status}>{item.status}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><Text>Chargement...</Text></View>;
  }

  if (!games.length) {
    return <View style={styles.center}><Text>Aucun match à venir.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes matchs à venir</Text>
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 18, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#23272A', padding: 16, borderRadius: 12, marginBottom: 12 },
  location: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  info: { fontSize: 15, color: '#bbb', marginTop: 4 },
  status: { fontSize: 13, color: '#0af', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
