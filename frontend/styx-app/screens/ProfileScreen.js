import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator, Modal, Pressable, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { getUserById, getClubMembers } from '../services/api';

const DEFAULT_AVATAR = require('../assets/player-default.png');
const DEFAULT_CLUB = require('../assets/club-default.png');

// --- Mapping d'images de clubs locaux et fallback url distante
function getClubLogoSource(image) {
  if (!image || image === '') return DEFAULT_CLUB;
  if (image === '/assets/club-imgs/ecusson-1.png') return require('../assets/club-imgs/ecusson-1.png');
  if (image === '/assets/club-imgs/ecusson-2.png') return require('../assets/club-imgs/ecusson-2.png');
  if (image === '/assets/club-imgs/ecusson-3.png') return require('../assets/club-imgs/ecusson-3.png');
  if (typeof image === 'string' && image.startsWith('http')) return { uri: image };
  return DEFAULT_CLUB;
}

export default function ProfileScreen() {
  const { userInfo } = useContext(AuthContext);
  const [freshUser, setFreshUser] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserAndClub = useCallback(async () => {
    if (!userInfo?.id) return;
    setLoading(true);
    try {
      const data = await getUserById(userInfo.id);
      setFreshUser(data);
      if (data.clubId) {
        try {
          const members = await getClubMembers(data.clubId);
          setClubMembers(members);
        } catch (e) {
          setClubMembers([]);
        }
      } else {
        setClubMembers([]);
      }
    } catch (e) {
      setFreshUser(null);
      setClubMembers([]);
    }
    setLoading(false);
  }, [userInfo]);

  useEffect(() => { fetchUserAndClub(); }, [fetchUserAndClub]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserAndClub();
    setRefreshing(false);
  }, [fetchUserAndClub]);

  // Overlay actions
  const handleEditAccount = () => {
    setModalVisible(false);
    Alert.alert('✏️ Modifier', 'Fonction à implémenter.');
  };
  const handleDeleteAccount = () => {
    setModalVisible(false);
    Alert.alert('❌ Supprimer', 'Fonction à implémenter.');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#00D9FF" size="large" />
      </View>
    );
  }
  if (!freshUser) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Non connecté</Text>
      </View>
    );
  }

  const username = freshUser.username || '---';
  const level = freshUser.level || '---';

  // --- CLub datas: récupère depuis freshUser.club, sinon premier membre
  let clubId = freshUser.club?.id || freshUser.clubId || null;
  let clubName = freshUser.club?.name || freshUser.clubName || '';
  let clubImage = freshUser.club?.image || freshUser.clubImage || null;

  // Fallback (si pas trouvé dans freshUser)
  if ((!clubId || !clubName || !clubImage) && clubMembers.length > 0 && clubMembers[0]?.club) {
    const memberClub = clubMembers[0].club;
    clubId = clubId || memberClub.id;
    if (!clubName || clubName === '' || clubName === '---') clubName = memberClub.name || '---';
    if (!clubImage || clubImage === '') clubImage = memberClub.image || '';
  }

  // Si malgré tout on n'a pas de nom
  if (!clubName) clubName = '---';

  const nbClubMembers = clubMembers?.length ?? '---';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D9FF"
            colors={['#00D9FF']}
          />
        }
      >
        {/* Top Avatar + infos */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={DEFAULT_AVATAR} style={styles.avatar} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.username}>{username}</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.menuDots}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Matchs joués */}
        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <Text style={styles.statsNumber}>---</Text>
            <Text style={styles.statsLabel}>Matchs joués</Text>
          </View>
        </View>

        {/* Niveau */}
        <View style={styles.levelBlock}>
          <Text style={styles.levelIcon}>🙂</Text>
          <Text style={styles.levelText}>{level}</Text>
        </View>

        {/* Section stats */}
        <Text style={styles.sectionTitle}>Stats du joueur</Text>
        <View style={styles.statDetails}>
          <Text style={styles.statsMainRow}>--- <Text style={{ color: '#13D76F' }}>V</Text>-<Text style={{ color: '#EAC94B' }}>N</Text>-<Text style={{ color: '#E33232' }}>D</Text></Text>
          <Text style={styles.statsSubRow}>--- MVP</Text>
        </View>

        {/* Derniers matchs */}
        <Text style={styles.sectionTitle}>Derniers Matchs</Text>
        <View style={styles.matchCard}>
          <Text style={styles.matchPlaceholder}>---</Text>
        </View>

        {/* Bloc club */}
        <Text style={styles.sectionTitle}>Club du Joueur</Text>
        {clubId ? (
          <View style={styles.clubBlock}>
            <Image
              source={getClubLogoSource(clubImage)}
              style={styles.clubImageZoomed}
              resizeMode="contain"
            />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.clubName}>{clubName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={styles.clubStatSmall}>Joueurs </Text>
                <Text style={styles.clubStatNum}>{nbClubMembers}</Text>
                <Text style={[styles.clubStatSmall, { marginLeft: 18 }]}>V-N-D </Text>
                <Text style={[styles.clubStatNum, { color: '#13D76F', marginLeft: 2 }]}>---</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginVertical: 25 }}>
            <Text style={{ color: '#aaa', fontSize: 19, fontWeight: 'bold', paddingVertical: 20 }}>
              Aucun club
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* --------- OVERLAY MODAL --------- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Gérer mon compte</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleEditAccount}>
              <Text style={styles.modalBtnText}>Modifier le compte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#E33232' }]} onPress={handleDeleteAccount}>
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Supprimer le compte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* --------- FIN MODAL --------- */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
    alignItems: 'center',
    backgroundColor: '#111',
    minHeight: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    marginTop: 2,
    width: '93%',
    alignSelf: 'center',
    justifyContent: 'space-between'
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#00D9FF',
    borderRadius: 45,
    width: 70,
    height: 70,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#222',
  },
  headerText: {
    marginLeft: 18,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  username: {
    fontSize: 23,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 9,
  },
  menuDots: {
    color: '#AAA',
    fontSize: 30,
    marginRight: 7,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    width: '55%',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 2,
    marginTop: 6
  },
  statsCol: {
    alignItems: 'center'
  },
  statsNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
  },
  statsLabel: {
    color: '#A9A9A9',
    fontSize: 14,
  },
  levelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 7,
  },
  levelIcon: {
    fontSize: 18,
    marginRight: 7,
    color: '#fff'
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 13
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    marginLeft: 21,
    marginBottom: 6,
    alignSelf: 'flex-start'
  },
  statDetails: {
    width: '83%',
    backgroundColor: '#191B2B',
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
    alignSelf: 'center'
  },
  statsMainRow: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
    letterSpacing: 2,
  },
  statsSubRow: {
    color: '#82E482',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  matchCard: {
    width: '86%',
    height: 75,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D9FF',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  matchPlaceholder: {
    color: '#A9A9A9',
    fontSize: 19,
    fontWeight: 'bold',
  },
  clubBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23284a',
    borderRadius: 14,
    width: '87%',
    alignSelf: 'center',
    marginBottom: 10
  },
  clubLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00D9FF'
  },
  clubName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 1
  },
  clubStatSmall: {
    color: '#A9A9A9',
    fontSize: 13,
    fontWeight: '500'
  },
  clubStatNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 3
  },
  // ------ MODAL OVERLAY -----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.39)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: '#222A',
    borderRadius: 19,
    padding: 26,
    minWidth: 260,
    alignItems: 'center'
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 18,
    letterSpacing: 1,
    textAlign: 'center'
  },
  modalBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 33,
    alignItems: 'center',
    marginBottom: 13,
    width: 195,
  },
  modalBtnText: {
    color: '#003249',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center'
  },
  modalCancel: {
    marginTop: 1,
    padding: 10,
    width: '100%',
    alignItems: 'center'
  },
  modalCancelText: {
    color: '#A9A9A9',
    fontSize: 15,
    fontWeight: '600'
  },
  clubImageZoomed: {
  width: 120,
  height: 120,
  },
});
