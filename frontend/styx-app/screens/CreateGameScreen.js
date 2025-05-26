import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';
import LocationInput from '../components/LocationInput';
import EvenNumberPicker from '../components/EvenNumberPicker';

// Fonction pour extraire uniquement la ville
function getCityFromAddressComponents(components, fallbackName = '') {
  if (!components) return '';

  let cityObj = components.find(c => c.types.includes('locality'));
  if (cityObj) return cityObj.long_name;

  cityObj = components.find(c => c.types.includes('administrative_area_level_3'));
  if (cityObj) return cityObj.long_name;

  cityObj = components.find(c =>
    c.types.includes('administrative_area_level_2') &&
    !["Département", "Region", "Occitanie", "Grand Est", "Île-de-France", "Bretagne", "Nouvelle-Aquitaine"].some(region =>
      c.long_name.includes(region)
    )
  );
  if (cityObj) return cityObj.long_name;

  if (fallbackName) {
    const parts = fallbackName.split(',').map(p => p.trim());
    const city = parts.find(word =>
      word &&
      !word.match(/(France|Metropole|Europe|Est|Ouest|Sud|Nord|Centre|Département|Region|Occitanie|Grand Est|Île-de-France|Bretagne|Nouvelle-Aquitaine)/i)
      && /^[A-ZÀ-Ÿ][a-zà-ÿ\- ]{2,25}$/.test(word)
    );
    if (city) return city;
  }
  return '';
}

export default function CreateGameScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(date);

  // snake_case for backend compatibility
  const [form, setForm] = useState({
    location: '',
    location_details: '',
    max_players: '',
    player_count: '',
    status: '',
    is_club_match: 'false',
  });

  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        date: date.toISOString(),
        location: form.location,
        location_details: form.location_details,
        max_players: parseInt(form.max_players, 10),
        player_count: parseInt(form.player_count, 10),
        is_club_match: form.is_club_match === 'true' || form.is_club_match === true,
        status: form.status,
        created_at: new Date().toISOString(),
        // players_team1_id: null, // Décommente/complète si besoin
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
            <Text style={styles.cardValue}>
              {date.toLocaleDateString()}
            </Text>
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
            onSelect={({ name, lat, lon, details }) => {
              let city = '';
              if (details && details.address_components) {
                city = getCityFromAddressComponents(details.address_components, name);
              }
              if (!city && name) {
                const parts = name.split(',').map(p => p.trim());
                const tryCity = parts.find(word =>
                  word &&
                  !word.match(/(France|Metropole|Europe|Est|Ouest|Sud|Nord|Centre|Département|Region|Occitanie|Grand Est|Île-de-France|Bretagne|Nouvelle-Aquitaine)/i)
                  && /^[A-ZÀ-Ÿ][a-zà-ÿ\- ]{2,25}$/.test(word)
                );
                city = tryCity || name;
              }
              handleChange('location', city);
              // Tu peux stocker latitude/longitude ailleurs si jamais tu ajoutes à la BDD plus tard
            }}
          />
          <TextInput
            style={[styles.input, { marginTop: 18 }]}
            placeholder="Détail du lieu (ex : Parc, terrain, salle...)"
            placeholderTextColor="#888"
            value={form.location_details}
            maxLength={50}
            onChangeText={text => handleChange('location_details', text)}
          />
          <Text style={{ color: "#888", fontSize: 12, alignSelf: "flex-end" }}>
            {form.location_details.length}/50
          </Text>
        </View>
      ),
    },
    {
      title: 'Joueurs max',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Joueurs max</Text>
          <EvenNumberPicker
            value={parseInt(form.max_players, 10) || 0}
            min={2}
            max={20}
            onChange={val => handleChange('max_players', val.toString())}
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
            value={form.player_count}
            onChangeText={t => handleChange('player_count', t)}
            keyboardType="numeric"
            placeholder="Ex : 3"
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
            {['true', 'false'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.toggleButton,
                  form.is_club_match === option && styles.toggleButtonActive
                ]}
                onPress={() => handleChange('is_club_match', option)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    form.is_club_match === option && styles.toggleTextActive
                  ]}
                >
                  {option === 'true' ? 'Oui' : 'Non'}
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
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Récapitulatif du match</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Heure</Text>
            <Text style={styles.summaryValue}>
              {date.toLocaleDateString()} à{' '}
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Lieu</Text>
            <Text style={styles.summaryValue}>{form.location}</Text>
          </View>
          {form.location_details ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Détail</Text>
              <Text style={styles.summaryValue}>{form.location_details}</Text>
            </View>
          ) : null}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Joueurs</Text>
            <Text style={styles.summaryValue}>
              {form.player_count} / {form.max_players}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Statut</Text>
            <Text style={styles.summaryValue}>{form.status}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Club</Text>
            <Text style={styles.summaryValue}>
              {form.is_club_match === 'true' ? 'Oui' : 'Non'}
            </Text>
          </View>
        </View>
      ),
    }
  ];

  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const isStepValid = () => {
    switch (step) {
      case 0: return !!date;
      case 1: return !!date;
      case 2: return !!form.location && form.location.trim().length > 0;
      case 3: return form.max_players && parseInt(form.max_players, 10) >= 2;
      case 4: return form.player_count && parseInt(form.player_count, 10) >= 0;
      case 5: return !!form.status;
      case 6: return form.is_club_match === 'true' || form.is_club_match === 'false';
      default: return true;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>

      <FlatList
        data={[steps[step]]}
        keyExtractor={(_, index) => index.toString()}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <>
            <Text style={styles.stepTitle}>{item.title}</Text>
            {item.content}
          </>
        )}
      />

      <View style={[styles.nav, step === 0 && styles.navCenter]}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(s => s - 1)}>
            <Text style={styles.prevText}>Précédent</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            if (!isStepValid()) {
              Alert.alert('Attention', 'Merci de compléter ce champ avant de continuer.');
              return;
            }
            if (isLast) {
              handleSubmit();
            } else {
              setStep(s => s + 1);
            }
          }}
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
    overflow: 'visible',
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
  summaryCard: {
    backgroundColor: '#2A2A40',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryCardTitle: {
    color: '#00D9FF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#AAD4E0',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
