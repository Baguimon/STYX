import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Image, ScrollView, Pressable } from 'react-native';
import { createClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

// Logos prédéfinis
const CLUB_LOGO_CHOICES = [
  { uri: '/assets/club-imgs/ecusson-1.png', img: require('../assets/club-imgs/ecusson-1.png') },
  { uri: '/assets/club-imgs/ecusson-2.png', img: require('../assets/club-imgs/ecusson-2.png') },
  { uri: '/assets/club-imgs/ecusson-3.png', img: require('../assets/club-imgs/ecusson-3.png') },
];

export default function CreateClubScreen() {
  const [name, setName] = useState('');
  const [logoModal, setLogoModal] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(CLUB_LOGO_CHOICES[0]); // Default: 1er logo
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
      await createClub({
        name,
        clubCaptainId: userInfo?.id,
        image: selectedLogo.uri,
      });
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
        <Text style={[styles.cardTitle, { marginTop: 25, marginBottom: 10 }]}>Logo du club</Text>
        <TouchableOpacity
          style={styles.logoPreviewBtn}
          onPress={() => setLogoModal(true)}
          activeOpacity={0.85}
        >
          <Image
            source={selectedLogo.img}
            style={styles.logoPreview}
            resizeMode="contain"
          />
          <Text style={{ color: '#00D9FF', marginTop: 9, fontWeight: 'bold' }}>Changer le logo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.nextBtn, { marginTop: 20 }]} onPress={handleCreate}>
          <Text style={styles.nextText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Modal choix du logo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoModal}
        onRequestClose={() => setLogoModal(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setLogoModal(false)}
        />
        <View style={styles.logoModalContainer}>
          <Text style={styles.logoModalTitle}>Choisis un logo pour ton club</Text>
          <ScrollView contentContainerStyle={styles.logoGrid} horizontal>
            {CLUB_LOGO_CHOICES.map((imgObj) => (
              <TouchableOpacity
                key={imgObj.uri}
                onPress={() => { setSelectedLogo(imgObj); setLogoModal(false); }}
                style={[
                  styles.logoChoice,
                  selectedLogo?.uri === imgObj.uri ? styles.logoSelected : null
                ]}
              >
                <View style={styles.logoPreviewWrapper}>
                  <Image
                    source={imgObj.img}
                    style={styles.logoImageZoomed}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setLogoModal(false)}>
            <Text style={{ color: '#00D9FF', fontWeight: 'bold' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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

  logoPreviewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 44,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#00D9FF',
  },

  // Modal & logo choix
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  logoModalContainer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#191B2B',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    padding: 20,
    zIndex: 10,
    elevation: 10,
    alignItems: 'center',
  },
  logoModalTitle: {
    color: '#00D9FF',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center'
  },
  logoGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingBottom: 8,
  },
  logoChoice: {
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 60,
    padding: 6,
    backgroundColor: '#191B2B',
  },
  logoSelected: {
    borderColor: '#00D9FF',
    backgroundColor: '#23284a',
  },
  logoPreviewWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageZoomed: {
    width: 140,
    height: 140,
  },
  closeSheetBtn: {
    marginTop: 6,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
