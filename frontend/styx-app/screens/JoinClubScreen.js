import React, { useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, Pressable, ScrollView, Image } from 'react-native';
import { getClubs, joinClub, getClubMembers, getClub } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const defaultPlayerImage = require('../assets/player-default.png');

export default function JoinClubScreen() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overlayClub, setOverlayClub] = useState(null);
  const [overlayMembers, setOverlayMembers] = useState([]);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const navigation = useNavigation();
  const { userInfo, refreshUserInfo } = useContext(AuthContext);

  if (userInfo && userInfo.clubId) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Déjà membre d’un club</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Tu dois quitter ton club actuel pour en rejoindre un autre.
          </Text>
        </View>
      </View>
    );
  }

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClubs = async () => {
        setLoading(true);
        try {
          const data = await getClubs();
          if (isActive) setClubs(data);
        } catch (e) {
          if (isActive) setClubs([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClubs();
      return () => { isActive = false; };
    }, [])
  );

  const handleJoin = async (clubId) => {
    const userId = userInfo?.id;
    if (!userId) {
      Alert.alert("Erreur", "Utilisateur non identifié.");
      return;
    }
    try {
      await joinClub(userId, clubId);
      // <<=== AJOUTE CE REFRESH
      if (typeof refreshUserInfo === "function") {
        await refreshUserInfo(); // récupère les nouvelles infos utilisateur depuis le backend
      }
      Alert.alert('Succès', 'Tu as rejoint le club !');
      navigation.reset({ index: 0, routes: [{ name: 'ClubHome' }] });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de rejoindre le club");
      console.log('Erreur joinClub :', e?.response?.data, e.message, e);
    }
  };

  const handleInspect = async (clubId) => {
    setOverlayLoading(true);
    setOverlayClub(null);
    setOverlayMembers([]);
    try {
      const [club, members] = await Promise.all([
        getClub(clubId),
        getClubMembers(clubId)
      ]);
      setOverlayClub(club);
      setOverlayMembers(members);
    } catch (e) {
      setOverlayClub(null);
      setOverlayMembers([]);
      Alert.alert("Erreur", "Impossible de charger le club.");
    }
    setOverlayLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  if (!clubs.length) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Aucun club disponible</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aucun club n’est disponible pour l’instant.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Retour</Text>
      </TouchableOpacity>
      <Text style={styles.stepTitle}>Liste des clubs</Text>
      <FlatList
        data={clubs}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.inspectBtn}
                onPress={() => handleInspect(item.id)}
              >
                <Text style={styles.inspectText}>Voir le club</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => handleJoin(item.id)}
              >
                <Text style={styles.nextText}>Rejoindre</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* OVERLAY MODAL */}
      <Modal
        visible={!!overlayClub || overlayLoading}
        animationType="fade"
        transparent
        onRequestClose={() => { setOverlayClub(null); setOverlayMembers([]); }}
      >
        <View style={styles.overlayBackground}>
          <View style={styles.overlayCard}>
            <Pressable
              style={styles.overlayClose}
              onPress={() => { setOverlayClub(null); setOverlayMembers([]); }}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            {overlayLoading ? (
              <ActivityIndicator size="large" color="#00D9FF" />
            ) : overlayClub ? (
              <ScrollView style={{ flex: 1 }}>
                <Text style={styles.overlayTitle}>{overlayClub.name}</Text>
                <Text style={styles.overlaySubtitle}>Joueurs du club :</Text>
                {overlayMembers.length === 0 ? (
                  <Text style={{ color: "#AAD4E0", marginTop: 18, textAlign: 'center' }}>Aucun joueur dans ce club.</Text>
                ) : (
                  overlayMembers.map(member => (
                    <View key={member.id} style={styles.overlayMemberRow}>
                      <View style={styles.overlayAvatar}>
                        <Image
                          source={defaultPlayerImage}
                          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#222' }}
                        />
                      </View>
                      <View>
                        <Text style={styles.overlayMemberName}>{member.username || member.nom}</Text>
                        <Text style={styles.overlayMemberRole}>{member.role || 'Membre'}</Text>
                      </View>
                    </View>
                  ))
                )}
                <TouchableOpacity
                  style={styles.overlayJoinBtn}
                  onPress={() => {
                    handleJoin(overlayClub.id);
                    setOverlayClub(null);
                  }}
                >
                  <Text style={styles.overlayJoinText}>Rejoindre ce club</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 115,
  },
  cancelBtn: {
    position: 'absolute',
    top: 60,
    left: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  cancelText: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  stepTitle: {
    color: '#00D9FF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1A1F3D',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
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
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
    justifyContent: 'center',
  },
  inspectBtn: {
    backgroundColor: '#222842',
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 23,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1.3,
    borderColor: '#00D9FF',
    minWidth: 120,
  },
  inspectText: {
    color: '#00D9FF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  nextBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 120,
  },
  nextText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  // OVERLAY
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(10,14,20,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlayCard: {
    backgroundColor: '#23284a',
    borderRadius: 24,
    padding: 22,
    minWidth: 320,
    maxWidth: 410,
    minHeight: 380,
    width: '95%',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  overlayClose: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  overlayTitle: {
    color: '#00D9FF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  overlaySubtitle: {
    color: '#AAD4E0',
    fontSize: 15.5,
    fontWeight: '600',
    marginBottom: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  overlayMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    gap: 9,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(40,50,70,0.55)',
  },
  overlayAvatar: {
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  overlayMemberName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  overlayMemberRole: {
    color: '#AAD4E0',
    fontWeight: '400',
    fontSize: 12,
    marginTop: -1,
  },
  overlayJoinBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 22,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    marginBottom: 8,
    alignItems: 'center',
  },
  overlayJoinText: {
    color: '#050A23',
    fontWeight: 'bold',
    fontSize: 16.5,
    textAlign: 'center',
    letterSpacing: 0.12,
  },
});
