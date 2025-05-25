import React, { useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getClubs, joinClub } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export default function JoinClubScreen() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  if (userInfo && userInfo.clubId) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Déjà membre d’un club</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Tu dois quitter ton club actuel pour en rejoindre un autre.
          </Text>
        </View>
      </View>
    );
  }

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClubs = async () => {
        setLoading(true);
        try {
          const data = await getClubs();
          if (isActive) setClubs(data);
        } catch (e) {
          if (isActive) setClubs([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClubs();
      return () => { isActive = false; };
    }, [])
  );

  const handleJoin = async (clubId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await joinClub(userId, clubId);
      Alert.alert('Succès', 'Tu as rejoint le club !');
      navigation.reset({ index: 0, routes: [{ name: 'ClubHome' }] });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de rejoindre le club");
      console.log('Erreur joinClub :', e?.response?.data, e.message, e);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  if (!clubs.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Aucun club disponible</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aucun club n’est disponible pour l’instant.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Liste des clubs</Text>
      <FlatList
        data={clubs}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => handleJoin(item.id)}>
              <Text style={styles.nextText}>Rejoindre</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A23', alignItems: 'center', paddingHorizontal: 16, paddingTop: 36 },
  stepTitle: { color: '#00D9FF', fontSize: 25, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#00D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: 340,
  },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  nextBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    minWidth: 180,
  },
  nextText: { color: '#050A23', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
