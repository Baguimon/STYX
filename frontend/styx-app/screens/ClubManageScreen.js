import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert, ScrollView, ActivityIndicator, Modal, Pressable
} from 'react-native';
import { getClub, getClubMembers, updateClub, kickMember, blockMember, setUserPoste, transferCaptain } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

const defaultPlayerImage = require('../assets/player-default.png');

// === Logos prédéfinis à proposer ===
const CLUB_LOGO_CHOICES = [
  require('../assets/club-imgs/ecusson-1.png'),
  require('../assets/club-imgs/ecusson-2.png'),
  require('../assets/club-imgs/ecusson-3.png'),
];

const POSTES_11 = [
  { key: 'GB', label: 'GB' },
  { key: 'DG', label: 'DG' },
  { key: 'DC1', label: 'DC1' },
  { key: 'DC2', label: 'DC2' },
  { key: 'DD', label: 'DD' },
  { key: 'MG', label: 'MG' },
  { key: 'MC', label: 'MC' },
  { key: 'MD', label: 'MD' },
  { key: 'AG', label: 'AG' },
  { key: 'BU', label: 'BU' },
  { key: 'AD', label: 'AD' },
  { key: 'REMPLACANT', label: 'REMPLACANT' },
];

export default function ClubManageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { club: initialClub, members: initialMembers } = route.params || {};
  const [club, setClub] = useState(initialClub || null);
  const [members, setMembers] = useState(initialMembers || []);
  const [name, setName] = useState(initialClub?.name || '');
  const [loading, setLoading] = useState(false);

  // Pour la mini-fenêtre de changement de poste
  const [posteModal, setPosteModal] = useState({ open: false, member: null });
  // Pour la modal de sélection de logo
  const [logoModalVisible, setLogoModalVisible] = useState(false);

  const { userInfo } = useContext(AuthContext);

  // Fonction utilitaire pour extraire le nom de fichier d'un require (expo)
  function getAssetFilename(asset) {
    if (typeof asset === 'object' && asset.uri) {
      const parts = asset.uri.split('/');
      return parts[parts.length - 1];
    }
    if (typeof asset === 'string') {
      const parts = asset.split('/');
      return parts[parts.length - 1];
    }
    return '';
  }

  // Rafraîchir club et membres
  const fetchClubData = useCallback(async () => {
    if (!club?.id) return;
    setLoading(true);
    try {
      const [freshClub, freshMembers] = await Promise.all([
        getClub(club.id),
        getClubMembers(club.id)
      ]);
      setClub(freshClub);
      setMembers(freshMembers);
      setName(freshClub.name);
    } catch (e) {}
    setLoading(false);
  }, [club?.id]);

  useEffect(() => { fetchClubData(); }, [fetchClubData]);

  // Nom du club
  const handleSaveName = async () => {
    if (!name || name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom du club est trop court.');
      return;
    }
    setLoading(true);
    try {
      await updateClub(club.id, { name });
      await fetchClubData();
      Alert.alert('Succès', 'Nom du club mis à jour !');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de modifier le nom");
    }
    setLoading(false);
  };

  // Virer un membre
  const handleKick = memberId => {
    Alert.alert(
      "Exclure ce joueur",
      "Tu es sûr de vouloir virer ce joueur du club ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Virer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await kickMember(club.id, memberId);
              await fetchClubData();
            } catch (e) {
              Alert.alert('Erreur', "Impossible de virer ce joueur");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Bloquer un membre
  const handleBlock = memberId => {
    Alert.alert(
      "Bloquer ce joueur",
      "Le joueur sera bloqué et ne pourra plus revenir. Continuer ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await blockMember(club.id, memberId);
              await fetchClubData();
            } catch (e) {
              Alert.alert('Erreur', "Impossible de bloquer ce joueur");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Changement de poste via mini fenetre
  const handleSelectPosteBtn = async (memberId, posteKey) => {
    setLoading(true);
    try {
      await setUserPoste(club.id, memberId, posteKey);
      setPosteModal({ open: false, member: null }); // ferme la modal
      await fetchClubData();
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || "Impossible de changer le poste");
      setPosteModal({ open: false, member: null });
    }
    setLoading(false);
  };

  // Transfert de capitanat
  const handleTransferCaptain = (member) => {
    Alert.alert(
      "Donner le capitanat",
      `Tu es sûr de vouloir transférer le capitanat à ${member.username || member.nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, transférer",
          onPress: async () => {
            setLoading(true);
            try {
              await transferCaptain(club.id, member.id);
              await fetchClubData();
              Alert.alert("Succès", "Le capitanat a été transféré.");
            } catch (e) {
              Alert.alert("Erreur", "Impossible de transférer le capitanat.");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Gestion du choix du logo
  const handleChooseLogo = async (imgSrc) => {
    setLoading(true);
    try {
      const filename = getAssetFilename(imgSrc);
      // On envoie le nom du fichier en tant que logo (pas d'upload !)
      await updateClub(club.id, { image: `/assets/club-imgs/${filename}` }); // Ajuste selon ton backend si besoin
      setLogoModalVisible(false);
      await fetchClubData();
      Alert.alert('Succès', "Logo mis à jour !");
    } catch (e) {
      Alert.alert('Erreur', "Erreur lors du changement de logo.");
      setLogoModalVisible(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.header}>
          {/* Affichage du logo du club, on ouvre la modal de sélection */}
          <TouchableOpacity onPress={() => setLogoModalVisible(true)}>
            <Image
              source={
                club?.image
                  ? CLUB_LOGO_CHOICES.find(img =>
                      club.image.endsWith(getAssetFilename(img))
                    ) || CLUB_LOGO_CHOICES[0]
                  : CLUB_LOGO_CHOICES[0]
              }
              style={styles.clubImage}
            />
            <Ionicons name="camera" size={22} color="#00D9FF" style={styles.editIcon} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
              placeholder="Nom du club"
              placeholderTextColor="#555"
              editable={!loading}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName} disabled={loading}>
              <Text style={styles.saveBtnText}>Modifier le nom</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestion des membres</Text>
        {members.map((m) => (
          <View key={m.id} style={styles.memberRow}>
            <Image
              source={m.image ? { uri: m.image } : defaultPlayerImage}
              style={styles.memberAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>{m.username || m.nom}</Text>
              <Text style={{ color: '#82E482', fontSize: 13 }}>
                Poste : {m.poste === null ? 'Aucun' : m.poste}
              </Text>
              <TouchableOpacity
                style={styles.editPosteBtn}
                onPress={() => setPosteModal({ open: true, member: m })}
              >
                <Ionicons name="pencil" size={16} color="#00D9FF" />
                <Text style={{ color: '#00D9FF', marginLeft: 4, fontWeight: 'bold' }}>Changer poste</Text>
              </TouchableOpacity>
            </View>
            {/* Actions membres */}
            {userInfo?.id !== m.id && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleKick(m.id)}
                >
                  <Ionicons name="person-remove" size={19} color="#e23030" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleBlock(m.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#b70000" />
                </TouchableOpacity>
                {club.clubCaptain?.id !== m.id && (
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleTransferCaptain(m)}
                  >
                    <Ionicons name="star" size={19} color="#FFD700" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MODAL - Sélection du logo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoModalVisible}
        onRequestClose={() => setLogoModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setLogoModalVisible(false)}
        />
        <View style={styles.logoModalContainer}>
          <Text style={styles.logoModalTitle}>Choisis un logo pour ton club</Text>
          <ScrollView contentContainerStyle={styles.logoGrid}>
            {CLUB_LOGO_CHOICES.map((imgSrc, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleChooseLogo(imgSrc)}
                style={[
                  styles.logoChoice,
                  club?.image &&
                  club.image.endsWith(getAssetFilename(imgSrc))
                    ? styles.logoSelected
                    : null
                ]}
              >
                <Image source={imgSrc} style={styles.logoImagePreview} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setLogoModalVisible(false)}>
            <Text style={{ color: '#00D9FF', fontWeight: 'bold' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL Mini BottomSheet pour choisir le poste */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={posteModal.open}
        onRequestClose={() => setPosteModal({ open: false, member: null })}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setPosteModal({ open: false, member: null })}
        />
        <View style={styles.bottomSheet}>
          <Text style={styles.bottomSheetTitle}>Choisir un poste pour {posteModal.member?.username || posteModal.member?.nom}</Text>
          <View style={styles.bottomSheetContent}>
            {POSTES_11.map(p => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.bottomSheetPosteBtn,
                  posteModal.member?.poste === p.key && styles.selectedSheetPosteBtn
                ]}
                onPress={() => handleSelectPosteBtn(posteModal.member.id, p.key)}
              >
                <Text style={[
                  styles.bottomSheetPosteBtnText,
                  posteModal.member?.poste === p.key && styles.selectedSheetPosteBtnText
                ]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
            {/* Aucun */}
            <TouchableOpacity
              style={[
                styles.bottomSheetPosteBtn,
                posteModal.member?.poste == null && styles.selectedSheetPosteBtn,
                { backgroundColor: '#c73030', borderColor: '#c73030' }
              ]}
              onPress={() => handleSelectPosteBtn(posteModal.member.id, null)}
            >
              <Text style={styles.bottomSheetPosteBtnText}>Aucun</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeSheetBtn}
            onPress={() => setPosteModal({ open: false, member: null })}
          >
            <Text style={{ color: '#00D9FF', fontWeight: 'bold' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171a24',
    padding: 20,
    paddingBottom: 10,
    borderRadius: 12,
    margin: 14,
    marginBottom: 8
  },
  clubImage: {
    width: 82,
    height: 82,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00D9FF',
    backgroundColor: '#222',
  },
  editIcon: {
    position: 'absolute',
    right: 5,
    bottom: 7,
    backgroundColor: '#111',
    padding: 4,
    borderRadius: 20
  },
  nameInput: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderColor: '#222',
    marginBottom: 8,
    backgroundColor: '#23284a',
    borderRadius: 6,
    padding: 8,
  },
  saveBtn: {
    backgroundColor: '#00D9FF',
    paddingVertical: 7,
    borderRadius: 9,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 3,
  },
  saveBtnText: {
    color: '#181818',
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D9FF',
    marginVertical: 18,
    marginLeft: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23284a',
    marginHorizontal: 13,
    marginBottom: 12,
    borderRadius: 12,
    padding: 13,
  },
  memberAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    marginRight: 13,
    backgroundColor: '#222'
  },
  editPosteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,217,255,0.11)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  iconBtn: {
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#161D2C',
    marginLeft: 4,
  },
  // Mini bottom sheet styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.37)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#191B2B',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
    padding: 20,
    zIndex: 2,
    elevation: 5,
  },
  bottomSheetTitle: {
    color: '#00D9FF',
    fontWeight: '700',
    fontSize: 19,
    marginBottom: 12,
    textAlign: 'center'
  },
  bottomSheetContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 16,
  },
  bottomSheetPosteBtn: {
    backgroundColor: '#23284a',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#888',
    margin: 3,
  },
  selectedSheetPosteBtn: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  bottomSheetPosteBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  selectedSheetPosteBtnText: {
    color: '#181818'
  },
  closeSheetBtn: {
    marginTop: 6,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    fontSize: 21,
    marginBottom: 15,
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
  logoImagePreview: {
    width: 78,
    height: 78,
    borderRadius: 40,
    backgroundColor: '#222',
  },
});
