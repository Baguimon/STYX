// screens/CreateGameScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';

export default function CreateGameScreen() {
  const navigation = useNavigation();

  // Date complète et flags inline
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Autres champs du formulaire
  const [form, setForm] = useState({
    location: '',
    maxPlayers: '',
    playerCount: '',
    status: '',
    isClubMatch: 'false',
  });

  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        maxPlayers: parseInt(form.maxPlayers, 10),
        playerCount: parseInt(form.playerCount, 10),
        isClubMatch: form.isClubMatch === 'true',
        status: form.status,
        location: form.location,
      };
      await createGame(payload);
      Alert.alert('Succès', 'Match créé avec succès');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible de créer le match");
    }
  };

  // Définition des étapes
  const steps = [
    {
      title: 'Sélectionnez la date',
      content: (
        <>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.cardTitle}>Date</Text>
            <Text style={styles.cardValue}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerInlineContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                onChange={(_, selected) => {
                  if (selected) setDate(selected);
                }}
                style={styles.pickerInline}
              />
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerDoneText}>Valider</Text>
              </TouchableOpacity>
            </View>
          )}
          {showDatePicker && Platform.OS !== 'ios' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </>
      ),
    },
    {
      title: 'Sélectionnez l’heure',
      content: (
        <>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.cardTitle}>Heure</Text>
            <Text style={styles.cardValue}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerInlineContainer}>
              <DateTimePicker
                value={date}
                mode="time"
                display="inline"
                onChange={(_, selected) => {
                  if (selected) setDate(selected);
                }}
                style={styles.pickerInline}
              />
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerDoneText}>Valider</Text>
              </TouchableOpacity>
            </View>
          )}
          {showTimePicker && Platform.OS !== 'ios' && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onChange={(_, selected) => {
                setShowTimePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </>
      ),
    },
    {
      title: 'Lieu',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lieu</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={t => handleChange('location', t)}
            placeholder="Ex : Parc des sports"
            placeholderTextColor="#888"
          />
        </View>
      ),
    },
    {
      title: 'Joueurs max',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Joueurs max</Text>
          <TextInput
            style={styles.input}
            value={form.maxPlayers}
            onChangeText={t => handleChange('maxPlayers', t)}
            keyboardType="numeric"
            placeholder="Ex : 10"
            placeholderTextColor="#888"
          />
        </View>
      ),
    },
    {
      title: 'Joueurs actuels',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Joueurs actuels</Text>
          <TextInput
            style={styles.input}
            value={form.playerCount}
            onChangeText={t => handleChange('playerCount', t)}
            keyboardType="numeric"
            placeholder="Ex : 1"
            placeholderTextColor="#888"
          />
        </View>
      ),
    },
    {
      title: 'Statut',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statut</Text>
          <TextInput
            style={styles.input}
            value={form.status}
            onChangeText={t => handleChange('status', t)}
            placeholder="Ouvert / Fermé"
            placeholderTextColor="#888"
          />
        </View>
      ),
    },
    {
      title: 'Match de club ?',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match de club ?</Text>
          <TextInput
            style={styles.input}
            value={form.isClubMatch}
            onChangeText={t => handleChange('isClubMatch', t)}
            placeholder="true ou false"
            placeholderTextColor="#888"
          />
        </View>
      ),
    },
    {
      title: 'Récapitulatif',
      content: (
        <View style={styles.card}>
          {Object.entries({ date, ...form }).map(([k, v]) => (
            <Text key={k} style={styles.summaryText}>
              <Text style={{ fontWeight: '600' }}>{k}:</Text>{' '}
              {k === 'date' ? date.toLocaleString() : v.toString()}
            </Text>
          ))}
        </View>
      ),
    },
  ];

  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <View style={styles.container}>
            {/* ← ANNULER */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.stepTitle}>{steps[step].title}</Text>
        {steps[step].content}
      </ScrollView>
      <View style={[styles.nav, step === 0 && styles.navCenter]}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)}>
            <Text style={styles.prevText}>Précédent</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.submitBtn]}
          onPress={() => (isLast ? handleSubmit() : setStep(s => s + 1))}
        >
          <Text style={styles.nextText}>
            {isLast ? 'Valider' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A23',
    // on iOS on ajoute un paddingTop pour la notch et un paddingBottom pour le safe-area
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 120 : 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  cancelBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,  // décale sous la notch sur iOS
    left: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  cancelText: {
    color: '#AAD4E0',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTitle: {
    color: '#00D9FF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#00D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardValue: {
    color: '#AAD4E0',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#2A2A40',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 15,
    marginTop: 10,
  },
  pickerInlineContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pickerInline: {
    width: '100%',
  },
  pickerDone: {
    backgroundColor: '#00D9FF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickerDoneText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryText: {
    color: '#AAD4E0',
    fontSize: 14,
    marginBottom: 8,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#050A23',
    borderTopWidth: 1,
    borderTopColor: '#1A1F3D',
  },
  navCenter: {
    justifyContent: 'center',
  },
  prevBtn: {
    backgroundColor: '#2A2A40',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  prevText: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  submitBtn: {
    flex: 1,
    alignItems: 'center',
  },
  nextSolo: {
    width: '60%',
    alignSelf: 'center',
  },
  nextText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
});