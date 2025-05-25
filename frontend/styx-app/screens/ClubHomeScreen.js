import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getUserClub, leaveClub } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClub = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          const clubData = await getUserClub(userId);
          if (isActive) setClub(clubData);
        } catch (e) {
          if (isActive) setClub(null);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClub();
      return () => { isActive = false; };
    }, [])
  );

  const handleLeave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await leaveClub(userId);
      Alert.alert('Tu as quitté le club');
      navigation.reset({ index: 0, routes: [{ name: 'ClubHome' }] });
    } catch (e) {
      if (e.response?.status === 404) {
        Alert.alert('Club supprimé', 'Retour à l\'accueil.');
        navigation.reset({ index: 0, routes: [{ name: 'ClubHome' }] });
      } else {
        Alert.alert('Erreur', "Impossible de quitter le club");
        console.log('Erreur leaveClub :', e?.response?.data, e.message, e);
      }
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#00D9FF" />;

  if (!club) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Aucun club trouvé</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu n'es membre d'aucun club pour le moment.</Text>
          <Text style={styles.cardValue}>Crée ton propre club ou rejoins-en un !</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('CreateClub')}>
          <Text style={styles.nextText}>Créer un club</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.nextBtn, { marginTop: 16 }]} onPress={() => navigation.navigate('JoinClub')}>
          <Text style={styles.nextText}>Rejoindre un club</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Ton club</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{club.name}</Text>
        <Text style={styles.cardValue}>Capitaine : {club.clubCaptain}</Text>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}>
          <Text style={styles.nextText}>Voir le club</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#d00', marginTop: 12 }]} onPress={handleLeave}>
          <Text style={[styles.nextText, { color: '#FFF' }]}>Quitter le club</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A23', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  stepTitle: { color: '#00D9FF', fontSize: 25, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
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
  cardValue: { color: '#AAD4E0', fontSize: 16, textAlign: 'center', marginBottom: 16 },
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
