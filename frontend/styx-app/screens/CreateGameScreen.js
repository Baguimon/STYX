import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';
import LocationInput from '../components/LocationInput';


export default function CreateGameScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(date);

  const [form, setForm] = useState({
    location: '',
    latitude: null,
    longitude: null,
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
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
        maxPlayers: parseInt(form.maxPlayers, 10),
        playerCount: parseInt(form.playerCount, 10),
        isClubMatch: form.isClubMatch === 'true',
        status: form.status,
        createdAt: new Date().toISOString(),
      };
      await createGame(payload);
      Alert.alert('Succès', 'Match créé avec succès');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible de créer le match");
    }
  };

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
            <Text style={styles.cardValue}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerInlineContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
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
            onPress={() => {
              setTempTime(date);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.cardTitle}>Heure du match</Text>
            <Text style={styles.cardValue}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showTimePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerInlineContainer}>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={(_, selected) => {
                  if (selected) setTempTime(selected);
                }}
                style={styles.pickerInline}
              />
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => {
                  setDate(tempTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.pickerDoneText}>Valider</Text>
              </TouchableOpacity>
            </View>
          )}
          {showTimePicker && Platform.OS !== 'ios' && (
            <>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="default"
                onChange={(_, selected) => {
                  if (selected) setTempTime(selected);
                }}
              />
              <TouchableOpacity
                style={styles.pickerDone}
                onPress={() => {
                  setDate(tempTime);
                  setShowTimePicker(false);
                }}
              >
                <Text style={styles.pickerDoneText}>Valider</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )
    },
    {
      title: 'Lieu',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lieu</Text>
          <LocationInput
            value={form.location}
            onSelect={({ name, lat, lon }) => {
              handleChange('location', name);
              handleChange('latitude', lat);
              handleChange('longitude', lon);
            }}
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
          <View style={styles.toggleContainer}>
            {['Ouvert', 'Fermé'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.toggleButton,
                  form.status === option && styles.toggleButtonActive
                ]}
                onPress={() => handleChange('status', option)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    form.status === option && styles.toggleTextActive
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    },
    {
      title: 'Match de club ?',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match de club ?</Text>
          <View style={styles.toggleContainer}>
            {['Oui', 'Non'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.toggleButton,
                  form.isClubMatch === option && styles.toggleButtonActive
                ]}
                onPress={() => handleChange('isClubMatch', option)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    form.isClubMatch === option && styles.toggleTextActive
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    },
    {
      title: 'Récapitulatif',
      content: (
        <View style={styles.card}>
          {Object.entries({ date, ...form }).map(([k, v]) => (
            <Text key={k} style={styles.summaryText}>
              <Text style={{ fontWeight: '600' }}>{k}:</Text>{' '}
              {k === 'date' ? date.toLocaleString() : v?.toString()}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 130 : 16,
    paddingBottom: Platform.OS === 'ios' ? 50 : 16,
  },
  cancelBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 16,
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
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    padding: 35,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardValue: {
    color: '#AAD4E0',
    fontSize: 17,
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
  nextText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: '#AAD4E0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  toggleText: {
    color: '#AAD4E0',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#050A23',
  },
});
