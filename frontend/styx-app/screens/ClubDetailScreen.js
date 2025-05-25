import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import { getClub, getClubMembers, setUserPoste, leaveClub, transferCaptain } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const defaultClubImage = require('../assets/club-default.png');
const defaultPlayerImage = require('../assets/player-default.png');
const FIELD_IMAGE = require('../assets/field-club.jpg');

const SCREEN_WIDTH = Dimensions.get('window').width;
const Y_OFFSET = -0.1; 

const POSTES_11 = [
  { key: 'GB', label: 'GB', x: 0.5, y: 0.94 + Y_OFFSET },
  { key: 'DG', label: 'DG', x: 0.15, y: 0.75 + Y_OFFSET },
  { key: 'DC1', label: 'DC', x: 0.32, y: 0.82 + Y_OFFSET },
  { key: 'DC2', label: 'DC', x: 0.68, y: 0.82 + Y_OFFSET },
  { key: 'DD', label: 'DD', x: 0.85, y: 0.75 + Y_OFFSET },
  { key: 'MG', label: 'MG', x: 0.21, y: 0.52 + Y_OFFSET },
  { key: 'MC', label: 'MC', x: 0.5, y: 0.64 + Y_OFFSET },
  { key: 'MD', label: 'MD', x: 0.79, y: 0.52 + Y_OFFSET },
  { key: 'AG', label: 'AG', x: 0.3, y: 0.25 + Y_OFFSET },
  { key: 'BU', label: 'BU', x: 0.5, y: 0.17 + Y_OFFSET },
  { key: 'AD', label: 'AD', x: 0.7, y: 0.25 + Y_OFFSET },
];

export default function ClubDetailScreen({ route }) {
  const clubId = route?.params?.clubId;
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getClub(clubId),
      getClubMembers(clubId)
    ])
      .then(([clubData, memberList]) => {
        setClub(clubData);
        setMembers(memberList);
      })
      .finally(() => setLoading(false));
  }, [clubId]);

  // Capitaine
  const captainId = club?.clubCaptain?.id || club?.clubCaptain;

  // Trie pour mettre le capitaine en haut
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === captainId) return -1;
    if (b.id === captainId) return 1;
    return 0;
  });

  const getPlayerForPoste = (posteKey) =>
    members.find(u => u.poste === posteKey);

  const fieldMemberIds = POSTES_11.map(pos => getPlayerForPoste(pos.key)?.id).filter(Boolean);
  const remplacants = members.filter(m => m.poste === 'REMPLACANT');

  const handleSelectPoste = async (posteKey) => {
    if (!userInfo?.id) return;
    try {
      await setUserPoste(clubId, userInfo.id, posteKey);
      setMembers(prev =>
        prev.map(m =>
          m.id === userInfo.id
            ? { ...m, poste: posteKey }
            : (m.poste === posteKey ? { ...m, poste: null } : m)
        )
      );
    } catch (e) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de prendre ce poste');
    }
  };

  const handleToggleRemplacant = async () => {
    if (!userInfo?.id) return;
    const isRemplacant = members.find(m => m.id === userInfo.id && m.poste === 'REMPLACANT');
    try {
      await setUserPoste(clubId, userInfo.id, isRemplacant ? null : 'REMPLACANT');
      setMembers(prev =>
        prev.map(m =>
          m.id === userInfo.id
            ? { ...m, poste: isRemplacant ? null : 'REMPLACANT' }
            : m
        )
      );
    } catch (e) {
      Alert.alert('Erreur', "Impossible de gérer le statut remplaçant");
    }
  };

  const handleLeave = async () => {
    try {
      const userId = userInfo?.id;
      await leaveClub(userId); // <= juste ça !
      Alert.alert('Tu as quitté le club');
      navigation.reset({
        index: 0,
        routes: [{ name: 'NoClubScreen' }]
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de quitter le club");
      console.log('Erreur leaveClub :', e?.response?.data, e.message, e);
    }
  };



  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#111' }}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#111' }}>
        <Text style={{ color:'#fff' }}>Impossible de charger le club.</Text>
      </View>
    );
  }

  const isUserOnField = fieldMemberIds.includes(userInfo?.id);
  const isUserRemplacant = members.find(m => m.id === userInfo.id && m.poste === 'REMPLACANT');

  return (
    <View style={{ backgroundColor: '#111', flex: 1 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.statsBlock}>
          <Text style={styles.statsLabel}>V-N-D</Text>
          <Text style={styles.statsValue}>
            {club.stats?.win ?? '-'}-{club.stats?.draw ?? '-'}-{club.stats?.lose ?? '-'}
          </Text>
        </View>
        <Image source={club.image ? { uri: club.image } : defaultClubImage} style={styles.clubImage} />
        <View style={styles.statsBlock}>
          <Text style={styles.statsLabel}>Joueurs</Text>
          <Text style={styles.statsValue}>{members.length || '-'}</Text>
        </View>
      </View>
      <Text style={styles.clubName}>{club.name}</Text>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'matches' && styles.tabBtnActive]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
            Matchs à venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
            Membres
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {activeTab === 'members' && (
          <View style={{ padding: 16 }}>
            {/* COMPOSITION */}
            <Text style={styles.sectionTitle}>Composition</Text>
            <View style={styles.compoContainer}>
              <Image
                source={FIELD_IMAGE}
                style={styles.terrainBackground}
                resizeMode="cover"
              />
              <View style={styles.terrainOverlay} />

              {POSTES_11.map(slot => {
                const player = getPlayerForPoste(slot.key);
                const isLibre = !player;
                const isUser = player && player.id === userInfo?.id;
                return (
                  <TouchableOpacity
                    key={slot.key}
                    style={[
                      styles.playerOnField,
                      {
                        left: `${slot.x * 100}%`,
                        top: `${slot.y * 100}%`,
                        marginLeft: -AVATAR_SIZE / 2,
                        marginTop: -AVATAR_SIZE / 2,
                        borderColor: isUser ? '#00D9FF' : 'transparent',
                        borderWidth: isUser ? 2 : 0,
                        zIndex: 2,
                      }
                    ]}
                    disabled={!isLibre && !isUser}
                    onPress={() => {
                      if (isLibre) {
                        handleSelectPoste(slot.key);
                      } else if (isUser) {
                        handleSelectPoste(null);
                      }
                    }}
                  >
                    <View style={{position:'relative'}}>
                      <Image
                        source={player?.image ? { uri: player.image } : defaultPlayerImage}
                        style={styles.playerAvatar}
                      />
                      {/* Capitaine point */}
                      {player && captainId && player.id === captainId && (
                        <View style={styles.captainDotField} />
                      )}
                    </View>
                    <Text style={styles.playerOnFieldText}>{slot.label}</Text>
                    <View style={styles.playerNameTag}>
                      <Text
                        style={[
                          styles.playerNameOnField,
                          { color: isLibre ? '#fff' : '#00D9FF' }
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {isLibre ? 'Libre' : (player.username || player.nom)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* REMPLAÇANTS */}
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Remplaçants :</Text>
            <View style={styles.remplacantsRow}>
              {/* 1. Le bouton d’action “+” ou “X”, toujours à gauche */}
              <TouchableOpacity
                style={[
                  styles.remplacantEmpty,
                  isUserRemplacant && { borderColor: '#00D9FF', borderWidth: 2 }
                ]}
                onPress={async () => {
                  try {
                    await setUserPoste(clubId, userInfo.id, isUserRemplacant ? null : 'REMPLACANT');
                    setMembers(prev =>
                      prev.map(m =>
                        m.id === userInfo.id
                          ? { ...m, poste: isUserRemplacant ? null : 'REMPLACANT' }
                          : m
                      )
                    );
                  } catch (e) {
                    Alert.alert('Erreur', "Vous êtes êtes déjà remplaçant");
                  }
                }}
              >
                {isUserRemplacant ? (
                  <Text style={{ color: '#00D9FF', fontWeight: 'bold', fontSize: 20 }}>X</Text>
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                )}
              </TouchableOpacity>

              {/* 2. Si je suis remplaçant, mon avatar juste après le “+” */}
              {isUserRemplacant && (
                <View style={[styles.remplacantEmpty, { borderColor: '#00D9FF', borderWidth: 2 }]}>
                  <Image
                    source={userInfo.image ? { uri: userInfo.image } : defaultPlayerImage}
                    style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#222' }}
                  />
                </View>
              )}

              {/* 3. Les autres remplaçants ensuite (sauf moi) */}
              {remplacants
                .filter(r => r.id !== userInfo?.id)
                .map(r => (
                  <View key={r.id} style={styles.remplacantEmpty}>
                    <Image
                      source={r.image ? { uri: r.image } : defaultPlayerImage}
                      style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#222' }}
                    />
                  </View>
                ))}
            </View>

            {/* LISTE JOUEURS */}
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleBar} />
              <Text style={styles.sectionTitle}>Joueurs</Text>
            </View>
            <View>
              {sortedMembers.map(item => (
                <View key={item.id} style={styles.playerCard}>
                  <View style={{ position: 'relative', width: 45, height: 45, marginRight: 16 }}>
                    <Image
                      source={item.image ? { uri: item.image } : defaultPlayerImage}
                      style={styles.playerListAvatar}
                    />
                    {/* Capitaine point collé à l’avatar */}
                    {item.id === captainId && (
                      <View style={styles.captainDotList} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerName}>{item.username || item.nom}</Text>
                    <Text style={styles.playerPosteList}>Poste : {item.poste || '-'}</Text>
                  </View>
                  <TouchableOpacity style={styles.profileBtn}>
                    <Text style={styles.profileBtnText}>Profil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>Ajouter des joueurs à votre club</Text>
            </TouchableOpacity>

            {/* -- BOUTON QUITTER LE CLUB -- */}
            <TouchableOpacity
              style={{
                marginTop: 36,
                marginBottom: 36,
                backgroundColor: '#d00',
                borderRadius: 24,
                paddingVertical: 18,
                alignItems: 'center',
                width: '94%',
                alignSelf: 'center',
              }}
              onPress={handleLeave}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                Quitter le club
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'matches' && (
          <View style={{ padding: 24 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              Aucun match à venir pour l’instant.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 50;
const styles = StyleSheet.create({
  // Header et infos club
  header: {
    backgroundColor: '#181818',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 26,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  clubImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#333',
  },
  statsBlock: {
    alignItems: 'center',
  },
  statsLabel: {
    color: '#82E482',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  statsValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  clubName: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
    letterSpacing: 1,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderBottomWidth: 2,
    borderBottomColor: '#00D9FF',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    backgroundColor: '#222',
  },
  tabBtnActive: {
    borderBottomColor: '#00D9FF',
    backgroundColor: '#050A23',
  },
  tabText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#00D9FF',
    fontWeight: '700',
  },

  // Section titres
  sectionTitle: {
    color: '#00D9FF',
    fontWeight: '700',
    fontSize: 19,
    marginVertical: 10,
    letterSpacing: 1,
    textAlign: 'left',
  },

  // Bloc composition AVEC terrain en fond
  compoContainer: {
    width: '100%',
    aspectRatio: 0.8, // Ajuste selon ton image terrain (0.8 pour rectangle, 1 pour carré)
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111', // fallback si l'image ne charge pas
  },
  terrainBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.85,
  },
  terrainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)', // 0.38 = assombri, tu peux tester plus (0.5 par ex.)
    zIndex: 1,
  },

  playerOnField: {
    position: 'absolute',
    alignItems: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE + 36,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  playerAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  playerOnFieldText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.7,
    backgroundColor: 'rgba(0,0,0,0.38)', // plus discret
    borderRadius: 5,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    minWidth: 22,
    alignSelf: 'center',
    marginBottom: 1,
    maxWidth: AVATAR_SIZE * 1.3,
  },
  playerNameTag: {
    backgroundColor: 'rgba(0,0,0,0.63)',
    borderRadius: 6,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    marginTop: 2,
    alignSelf: 'center',
    maxWidth: AVATAR_SIZE * 1.4,
    minWidth: 30,
  },
  playerNameOnField: {
    fontSize: 12.5,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.1,
    flexShrink: 1,
    includeFontPadding: false,
    numberOfLines: 1,
  },


  // Remplaçants
  remplacantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    gap: 5,
    justifyContent: 'flex-start',
  },
  remplacantEmpty: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#fff',
    marginRight: 5,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Liste joueurs
  playerCard: {
    width: '96%',
    backgroundColor: '#242640',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  playerListAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#00D9FF',
    backgroundColor: '#222',
  },
  playerName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  playerPosteList: {
    color: '#A9A9A9',
    fontSize: 13,
    fontWeight: '500',
  },
  profileBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  profileBtnText: {
    color: '#050A23',
    fontWeight: '700',
    fontSize: 13,
  },

  // Ajout joueurs
  addBtn: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: '#00D9FF',
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: 'center',
    width: '98%',
    alignSelf: 'center',
  },
  addBtnText: {
    color: '#050A23',
    fontWeight: 'bold',
    fontSize: 17,
  },
  captainDotField: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 8,
    backgroundColor: '#e23030',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  captainDotList: {
    position: 'absolute',
    bottom: -3,   
    right: -3,    
    width: 13,
    height: 13,
    borderRadius: 8,
    backgroundColor: '#e23030',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    marginBottom: 6,
  },
  sectionTitleBar: {
    width: 7,
    height: 28,
    backgroundColor: '#00D9FF',
    borderRadius: 3,
    marginRight: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 23,
    letterSpacing: 1,
    textShadowColor: '#232346',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

});
