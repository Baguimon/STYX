import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getClub, getClubMembers, updateClub, uploadClubLogo, kickMember, blockMember, setUserPoste, transferCaptain } from '../services/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const defaultPlayerImage = require('../assets/player-default.png');

export default function ClubManageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { club: initialClub, members: initialMembers } = route.params || {};
  const [club, setClub] = useState(initialClub || null);
  const [members, setMembers] = useState(initialMembers || []);
  const [name, setName] = useState(initialClub?.name || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Re-fetch les infos du club si besoin
  useEffect(() => {
    if (!club?.id) return;
    (async () => {
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
    })();
  }, [club?.id]);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!result.cancelled) {
      setUploading(true);
      try {
        const uri = result.assets ? result.assets[0].uri : result.uri; // selon version expo
        const filename = uri.split('/').pop();
        const type = 'image/' + filename.split('.').pop();
        const formData = new FormData();
        formData.append('logo', { uri, name: filename, type });
        const updated = await uploadClubLogo(club.id, formData);
        setClub(c => ({ ...c, image: updated.image }));
        Alert.alert('Succès', "Logo mis à jour !");
      } catch (e) {
        Alert.alert('Erreur', "Erreur lors de l’upload du logo");
      }
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name || name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom du club est trop court.');
      return;
    }
    setLoading(true);
    try {
      const updated = await updateClub(club.id, { name });
      setClub(c => ({ ...c, name: updated.name }));
      Alert.alert('Succès', 'Nom du club mis à jour !');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de modifier le nom");
    }
    setLoading(false);
  };

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
              setMembers(members.filter(m => m.id !== memberId));
            } catch (e) {
              Alert.alert('Erreur', "Impossible de virer ce joueur");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

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
              setMembers(members.filter(m => m.id !== memberId));
            } catch (e) {
              Alert.alert('Erreur', "Impossible de bloquer ce joueur");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleChangePoste = (userId, currentPoste) => {
    Alert.prompt(
      "Changer de poste",
      "Entre le nouveau poste pour ce joueur (ex : 'BU', 'MC', ...). Vide pour retirer.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "OK",
          onPress: async (poste) => {
            setLoading(true);
            try {
              await setUserPoste(club.id, userId, poste || null);
              setMembers(members.map(m => m.id === userId ? { ...m, poste } : m));
            } catch (e) {
              Alert.alert('Erreur', "Impossible de modifier le poste");
            }
            setLoading(false);
          }
        }
      ],
      'plain-text',
      currentPoste || ''
    );
  };

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
              Alert.alert("Succès", "Le capitanat a été transféré.");
              navigation.goBack();
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
            source={club.image ? { uri: club.image } : require('../assets/club-default.png')}
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
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleChangePoste(m.id, m.poste)}
          >
            <Ionicons name="pencil" size={18} color="#00D9FF" />
          </TouchableOpacity>
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
