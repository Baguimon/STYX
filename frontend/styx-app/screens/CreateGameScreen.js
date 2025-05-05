// screens/CreateMatchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';

export default function CreateGameScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    date: '',
    location: '',
    maxPlayers: '',
    playerCount: '',
    status: '',
    isClubMatch: false,
  });

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        maxPlayers: parseInt(form.maxPlayers, 10),
        playerCount: parseInt(form.playerCount, 10),
        date: new Date(form.date).toISOString(),
        createdAt: new Date().toISOString(),
        isClubMatch: form.isClubMatch === 'true' || form.isClubMatch === true,
      };

      await createGame(payload);
      Alert.alert('Succès', 'Match créé avec succès');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Impossible de créer le match");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Date (YYYY-MM-DD HH:MM)</Text>
      <TextInput
        style={styles.input}
        value={form.date}
        onChangeText={(text) => handleChange('date', text)}
        placeholder="2025-05-04 18:00"
      />

      <Text style={styles.label}>Lieu</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(text) => handleChange('location', text)}
        placeholder="Ex: Parc des sports"
      />

      <Text style={styles.label}>Nombre de joueurs max</Text>
      <TextInput
        style={styles.input}
        value={form.maxPlayers}
        onChangeText={(text) => handleChange('maxPlayers', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Nombre de joueurs actuels</Text>
      <TextInput
        style={styles.input}
        value={form.playerCount}
        onChangeText={(text) => handleChange('playerCount', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Statut</Text>
      <TextInput
        style={styles.input}
        value={form.status}
        onChangeText={(text) => handleChange('status', text)}
        placeholder="Ouvert / Fermé"
      />

      <Text style={styles.label}>Match de club ? (true/false)</Text>
      <TextInput
        style={styles.input}
        value={form.isClubMatch.toString()}
        onChangeText={(text) => handleChange('isClubMatch', text)}
        placeholder="true ou false"
      />

      <Button title="Créer le match" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
});
