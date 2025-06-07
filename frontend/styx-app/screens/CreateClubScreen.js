import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { createClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

const CLUB_LOGO_CHOICES = [
  { uri: '/assets/club-imgs/ecusson-1.png', img: require('../assets/club-imgs/ecusson-1.png') },
  { uri: '/assets/club-imgs/ecusson-2.png', img: require('../assets/club-imgs/ecusson-2.png') },
  { uri: '/assets/club-imgs/ecusson-3.png', img: require('../assets/club-imgs/ecusson-3.png') },
];

export default function CreateClubScreen() {
  const [name, setName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(CLUB_LOGO_CHOICES[0].uri);
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
      await createClub({ name, clubCaptainId: userInfo?.id, image: selectedLogo });
      Alert.alert('Succès', 'Club créé !');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer le club");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={50}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Créer un club</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nom du club</Text>
          <TextInput
            placeholder="Entrez le nom de votre club"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
            returnKeyType="done"
          />
          <Text style={[styles.cardTitle, { marginTop: 18, marginBottom: 8 }]}>
            Choisis un logo pour ton club
          </Text>
          <View style={styles.logosWrapper}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.logosScroll}
              showsHorizontalScrollIndicator={false}
            >
              {CLUB_LOGO_CHOICES.map((imgObj) => (
                <TouchableOpacity
                  key={imgObj.uri}
                  onPress={() => setSelectedLogo(imgObj.uri)}
                  style={[
                    styles.logoChoice,
                    selectedLogo === imgObj.uri ? styles.logoSelected : null,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={imgObj.img} style={styles.logoImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity style={[styles.nextBtn, { marginTop: 24 }]} onPress={handleCreate}>
            <Text style={styles.nextText}>Créer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 80 : 36, // grand margin top pour ne pas être collé
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  backText: {
    color: '#00D9FF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  stepTitle: {
    color: '#00D9FF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 22,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 26,
    borderLeftWidth: 4,
    borderLeftColor: '#00D9FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 7,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#23284a',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 16,
    width: '100%',
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#222645',
  },
  nextBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    minWidth: 180,
    shadowColor: '#00D9FF',
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 4,
  },
  nextText: {
    color: '#050A23',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  logosWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  logosScroll: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  logoChoice: {
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#23284a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
    transition: 'all 0.2s',
  },
  logoSelected: {
    borderColor: '#00D9FF',
    backgroundColor: '#181E34',
    shadowColor: '#00D9FF',
    shadowOpacity: 0.25,
    elevation: 8,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
});
