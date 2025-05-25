import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export default function CreateClubScreen() {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  if (userInfo && userInfo.clubId) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Tu es déjà membre d’un club</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Tu dois quitter ton club actuel pour en créer un nouveau.
          </Text>
        </View>
      </View>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Merci de renseigner le nom du club');
      return;
    }
    try {
      await createClub({ name, clubCaptainId: userInfo?.id });
      Alert.alert('Succès', 'Club créé !');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer le club");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Créer un club</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nom du club</Text>
        <TextInput
          placeholder="Entrez le nom de votre club"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TouchableOpacity style={[styles.nextBtn, { marginTop: 20 }]} onPress={handleCreate}>
          <Text style={styles.nextText}>Créer</Text>
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
  input: {
    backgroundColor: '#2A2A40',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 15,
    width: 240,
    marginTop: 10,
    textAlign: 'center',
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
  nextText: { color: '#050A23', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
