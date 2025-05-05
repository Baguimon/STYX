import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';

export default function CreateGameScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    date: new Date(),
    location: '',
    maxPlayers: '',
    playerCount: '',
    status: '',
    isClubMatch: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || form.date;
    setShowDatePicker(Platform.OS === 'ios');
    setForm({ ...form, date: currentDate });
  };

  const handleSubmit = async () => {
    if (!form.location || !form.maxPlayers || !form.playerCount || !form.status) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis');
      return;
    }

    const payload = {
      ...form,
      maxPlayers: parseInt(form.maxPlayers),
      playerCount: parseInt(form.playerCount),
      date: form.date.toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
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

      <Text style={styles.label}>Date du match</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text>{form.date.toLocaleString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.date}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}

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

      <Text style={styles.label}>Statut (ouvert / fermé)</Text>
      <TextInput
        style={styles.input}
        value={form.status}
        onChangeText={(text) => handleChange('status', text)}
        placeholder="Ex: Ouvert"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Match de club ?</Text>
        <Switch
          value={form.isClubMatch}
          onValueChange={(value) => handleChange('isClubMatch', value)}
        />
      </View>

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
  dateInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
});
