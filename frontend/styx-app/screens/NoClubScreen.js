import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NoClubScreen() {
  const navigation = useNavigation();
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
      <TouchableOpacity
        style={[styles.nextBtn, styles.secondaryBtn]}
        onPress={() => navigation.navigate('JoinClub')}
      >
        <Text style={[styles.nextText, styles.secondaryText]}>Rejoindre un club</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111', // Fond ultra sombre comme partout ailleurs
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stepTitle: {
    color: '#00D9FF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
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
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardValue: {
    color: '#AAD4E0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  nextBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    minWidth: 180,
  },
  nextText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#222842',
    marginTop: 16,
  },
  secondaryText: {
    color: '#00D9FF',
  },
});
