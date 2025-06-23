import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform, FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../services/api';
import LocationInput from '../components/LocationInput';
import EvenNumberPicker from '../components/EvenNumberPicker';
import { AuthContext } from '../contexts/AuthContext';

// 🔍 Essaie de récupérer le nom de la ville à partir des composants d’adresse
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

  // 🪂 Fallback si pas de composant d’adresse détecté
  if (fallbackName) {
    const parts = fallbackName.split(',').map(p => p.trim());
    const city = parts.find(word =>
      word &&
      !word.match(/(France|Metropole|Europe|Est|Ouest|Sud|Nord|Centre|Département|Region|...)/i) &&
      /^[A-ZÀ-Ÿ][a-zà-ÿ\- ]{2,25}$/.test(word)
    );
    if (city) return city;
  }
  return '';
}

export default function CreateGameScreen() {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext); // 👤 Utilisateur connecté

  const [date, setDate] = useState(new Date()); // 📅 Date complète (date + heure)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(date); // Pour les sélections horaires

  // 📋 Formulaire de création de match
  const [form, setForm] = useState({
    location: '',
    location_details: '',
    max_players: '',
  });

  // 📝 Met à jour un champ du formulaire
  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  // ✅ Validation du formulaire et envoi
  const handleSubmit = async () => {
    try {
      if (!userInfo?.id) {
        Alert.alert('Erreur', "Impossible de récupérer l'utilisateur connecté.");
        return;
      }

      const payload = {
        date: date.toISOString(),
        location: form.location,
        location_details: form.location_details,
        max_players: parseInt(form.max_players, 10),
        created_at: new Date().toISOString(),
        creator_id: userInfo.id,
      };

      await createGame(payload);
      Alert.alert('Succès', 'Match créé avec succès');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', "Impossible de créer le match");
    }
  };

  // 🪜 Étapes du formulaire multistep
  const steps = [
    {
      title: 'Sélectionnez la date',
      content: (
        <>
          <TouchableOpacity style={styles.card} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.cardTitle}>Date</Text>
            <Text style={styles.cardValue}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {/* Affichage du sélecteur de date selon la plateforme */}
          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.pickerInlineContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(_, selected) => selected && setDate(selected)}
                style={styles.pickerInline}
              />
              <TouchableOpacity style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
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
                selected && setDate(selected);
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
          <TouchableOpacity style={styles.card} onPress={() => {
            setTempTime(date);
            setShowTimePicker(true);
          }}>
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
                onChange={(_, selected) => selected && setTempTime(selected)}
                style={styles.pickerInline}
              />
              <TouchableOpacity style={styles.pickerDone} onPress={() => {
                setDate(tempTime);
                setShowTimePicker(false);
              }}>
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
                onChange={(_, selected) => selected && setTempTime(selected)}
              />
              <TouchableOpacity style={styles.pickerDone} onPress={() => {
                setDate(tempTime);
                setShowTimePicker(false);
              }}>
                <Text style={styles.pickerDoneText}>Valider</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )
    },

    {
      title: 'Lieu du match',
      content: (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ville</Text>
          <LocationInput
            value={form.location}
            onSelect={({ name, lat, lon, details }) => {
              let city = '';
              if (details?.address_components) {
                city = getCityFromAddressComponents(details.address_components, name);
              }
              if (!city && name) {
                const parts = name.split(',').map(p => p.trim());
                const tryCity = parts.find(word =>
                  word &&
                  !word.match(/(France|Metropole|Europe|Est|Ouest|Sud|Nord|Centre|...)/i) &&
                  /^[A-ZÀ-Ÿ][a-zà-ÿ\- ]{2,25}$/.test(word)
                );
                city = tryCity || name;
              }
              handleChange('location', city);
            }}
          />

          <TextInput
            style={[styles.input, { marginTop: 18 }]}
            placeholder="Adresse exacte"
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
      title: 'Récapitulatif',
      content: (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Récapitulatif du match</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Heure</Text>
            <Text style={styles.summaryValue}>
              {date.toLocaleDateString()} à {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            <Text style={styles.summaryLabel}>Joueurs max</Text>
            <Text style={styles.summaryValue}>{form.max_players}</Text>
          </View>
        </View>
      )
    }
  ];

  const [step, setStep] = useState(0); // Étape actuelle
  const isLast = step === steps.length - 1;

  // ✅ Vérifie que les champs sont valides pour cette étape
  const isStepValid = () => {
    switch (step) {
      case 0:
      case 1:
        return !!date;
      case 2:
        return form.location?.trim() && form.location_details?.trim();
      case 3:
        return parseInt(form.max_players, 10) >= 2;
      default:
        return true;
    }
  };

  return (
    <View style={styles.container}>
      {/* Bouton Annuler */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>

      {/* Étape en cours affichée */}
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

      {/* Navigation entre les étapes */}
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
              let message = 'Merci de compléter ce champ avant de continuer.';
              if (step === 2) {
                if (!form.location?.trim()) {
                  message = 'Merci d’indiquer la ville du match.';
                } else if (!form.location_details?.trim()) {
                  message = "Merci de renseigner l'adresse exacte";
                }
              }
              Alert.alert('Attention', message);
              return;
            }

            isLast ? handleSubmit() : setStep(s => s + 1);
          }}
        >
          <Text style={styles.nextText}>{isLast ? 'Valider' : 'Suivant'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {flex:1,backgroundColor:'#111',paddingHorizontal:16,paddingTop:Platform.OS==='ios'?130:16,paddingBottom:Platform.OS==='ios'?50:16},
  cancelBtn: {position:'absolute',top:Platform.OS==='ios'?70:16,left:16,paddingVertical:8,paddingHorizontal:12,zIndex:10},
  cancelText: {color:'#AAD4E0',fontSize:16,fontWeight:'600'},
  stepTitle: {color:'#00D9FF',fontSize:25,fontWeight:'700',textAlign:'center',marginBottom:24},
  card: {backgroundColor:'#242640',borderRadius:16,padding:35,marginBottom:24,borderLeftWidth:4,borderLeftColor:'#00D9FF',overflow:'visible',shadowColor:'#000',shadowOffset:{width:0,height:6},shadowOpacity:0.25,shadowRadius:8,elevation:4},
  cardTitle: {color:'#fff',fontSize:18,fontWeight:'600',marginBottom:12},
  cardValue: {color:'#AAD4E0',fontSize:17},
  input: {backgroundColor:'#23284a',borderRadius:10,paddingVertical:14,paddingHorizontal:16,color:'#fff',fontSize:15,marginTop:10,borderWidth:1.5,borderColor:'#00D9FF55',shadowColor:'#00D9FF',shadowOpacity:0.08,shadowOffset:{width:0,height:1},shadowRadius:3,elevation:1},
  pickerInlineContainer: {backgroundColor:'#23284a',borderRadius:12,overflow:'hidden',marginBottom:20},
  pickerInline: {width:'100%'},
  pickerDone: {backgroundColor:'#00D9FF',paddingVertical:12,alignItems:'center'},
  pickerDoneText: {color:'#003249',fontSize:16,fontWeight:'600'},
  summaryText: {color:'#AAD4E0',fontSize:14,marginBottom:8},
  nav: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:16,paddingHorizontal:12,backgroundColor:'#111',borderTopWidth:1,borderTopColor:'#23284a'},
  navCenter: {justifyContent:'center'},
  prevText: {color:'#00D9FF',fontSize:16,fontWeight:'600'},
  nextBtn: {backgroundColor:'#00D9FF',borderRadius:24,paddingVertical:14,paddingHorizontal:32},
  submitBtn: {flex:1,alignItems:'center'},
  nextText: {color:'#003249',fontSize:16,fontWeight:'600'},
  summaryCard: {backgroundColor:'#202849',borderRadius:12,padding:20,marginHorizontal:16,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.2,shadowRadius:6,elevation:3},
  summaryCardTitle: {color:'#00D9FF',fontSize:20,fontWeight:'700',marginBottom:16,textAlign:'center'},
  summaryRow: {flexDirection:'row',justifyContent:'space-between',marginBottom:12},
  summaryLabel: {color:'#AAD4E0',fontSize:16,fontWeight:'600'},
  summaryValue: {color:'#fff',fontSize:16,fontWeight:'600'}
});
