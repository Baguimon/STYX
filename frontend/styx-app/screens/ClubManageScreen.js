import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getClub, getClubMembers, updateClub, uploadClubLogo, kickMember, blockMember, setUserPoste, transferCaptain } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

const defaultPlayerImage = require('../assets/player-default.png');

// Rôles disponibles
const POSTES = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Coach', 'Remplaçant'];

export default function ClubManageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { club: initialClub, members: initialMembers } = route.params || {};
  const [club, setClub] = useState(initialClub || null);
  const [members, setMembers] = useState(initialMembers || []);
  const [name, setName] = useState(initialClub?.name || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useContext(AuthContext);

  // Refetch club infos (factorisé pour pouvoir l'utiliser partout)
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

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  // Logo
  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const ext = filename.split('.').pop();
        const type = ext ? 'image/' + ext : 'image';
        const formData = new FormData();
        formData.append('logo', { uri, name: filename, type });
        await uploadClubLogo(club.id, formData);
        await fetchClubData();
        Alert.alert('Succès', "Logo mis à jour !");
      } catch (e) {
        Alert.alert('Erreur', "Erreur lors de l’upload du logo");
      }
      setUploading(false);
    }
  };

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

  // Changement de poste via boutons
  const handleChangePoste = (userId, currentPoste) => {
    Alert.alert(
      "Changer le poste",
      "Choisis le nouveau poste pour ce joueur :",
      POSTES.map(role => ({
        text: role,
        onPress: async () => {
          setLoading(true);
          try {
            await setUserPoste(club.id, userId, role);
            await fetchClubData();
          } catch (e) {
            Alert.alert('Erreur', "Impossible de modifier le poste");
          }
          setLoading(false);
        }
      })).concat([
        {
          text: "Retirer le poste",
          onPress: async () => {
            setLoading(true);
            try {
              await setUserPoste(club.id, userId, null);
              await fetchClubData();
            } catch (e) {
              Alert.alert('Erreur', "Impossible de retirer le poste");
            }
            setLoading(false);
          },
          style: 'destructive'
        },
        { text: "Annuler", style: "cancel" }
      ])
    );
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#111' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickLogo}>
          <Image
            source={club?.image ? { uri: club.image } : require('../assets/club-default.png')}
            style={styles.clubImage}
          />
          {uploading && <ActivityIndicator color="#00D9FF" style={styles.uploadLoader} />}
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
            <Text style={{ color: '#82E482', fontSize: 13 }}>Poste : {m.poste || '-'}</Text>
          </View>
          {/* Changement de poste via boutons */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleChangePoste(m.id, m.poste)}
          >
            <Ionicons name="pencil" size={18} color="#00D9FF" />
          </TouchableOpacity>
          {/* Boutons réservés aux autres membres que moi-même */}
          {userInfo?.id !== m.id && (
            <>
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
              {/* Transfert capitanat : affiché uniquement si ce n'est pas le capitaine actuel */}
              {club.clubCaptain?.id !== m.id && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleTransferCaptain(m)}
                >
                  <Ionicons name="star" size={19} color="#FFD700" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      ))}
      <View style={{ height: 60 }} />
    </ScrollView>
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
  uploadLoader: {
    position: 'absolute',
    alignSelf: 'center',
    top: 28,
    left: 28,
    zIndex: 10
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
  iconBtn: {
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#161D2C',
    marginLeft: 4,
  }
});
