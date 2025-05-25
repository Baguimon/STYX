import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import { getClub, getClubMembers, setUserPoste, leaveClub } from '../services/api'; // setUserPoste & leaveClub API !
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const defaultClubImage = require('../assets/club-default.png');
const defaultPlayerImage = require('../assets/player-default.png');
const FIELD_IMAGE = require('../assets/field.jpg'); // Ton image de terrain

const SCREEN_WIDTH = Dimensions.get('window').width;

const POSTES_11 = [
  { key: 'GB', label: 'GB', x: 0.5, y: 0.06 },
  { key: 'DG', label: 'DG', x: 0.15, y: 0.25 },
  { key: 'DC1', label: 'DC', x: 0.32, y: 0.18 },
  { key: 'DC2', label: 'DC', x: 0.68, y: 0.18 },
  { key: 'DD', label: 'DD', x: 0.85, y: 0.25 },
  { key: 'MG', label: 'MG', x: 0.21, y: 0.48 },
  { key: 'MC', label: 'MC', x: 0.5, y: 0.36 },
  { key: 'MD', label: 'MD', x: 0.79, y: 0.48 },
  { key: 'AG', label: 'AG', x: 0.3, y: 0.75 },
  { key: 'BU', label: 'BU', x: 0.5, y: 0.83 },
  { key: 'AD', label: 'AD', x: 0.7, y: 0.75 },
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

  // Pour chaque poste, trouver le joueur assigné ou null
  const getPlayerForPoste = (posteKey) =>
    members.find(u => u.poste === posteKey);

  // Tous les IDs sur le terrain
  const fieldMemberIds = POSTES_11.map(pos => getPlayerForPoste(pos.key)?.id).filter(Boolean);
  const remplacants = members.filter(m => !fieldMemberIds.includes(m.id));

  // Sélection de poste pour ce joueur
  const handleSelectPoste = async (posteKey) => {
    if (!userInfo?.id) return;
    try {
      await setUserPoste(clubId, userInfo.id, posteKey);
      setMembers(prev =>
        prev.map(m =>
          m.id === userInfo.id ? { ...m, poste: posteKey } : (m.poste === posteKey ? { ...m, poste: null } : m)
        )
      );
    } catch (e) {
      if (e.response?.data?.error) {
        Alert.alert('Erreur', e.response.data.error);
      } else {
        Alert.alert('Erreur', 'Impossible de prendre ce poste');
      }
    }
  };

  // Quitter le club
  const handleLeave = async () => {
    try {
      const userId = userInfo?.id;
      await leaveClub(userId, club.id);
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
            <View style={styles.fieldWrapper}>
              <Image source={FIELD_IMAGE} style={styles.fieldImage} />
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
                        marginLeft: -25,
                        marginTop: -25,
                        borderColor: isUser ? '#00D9FF' : 'transparent',
                        borderWidth: isUser ? 2 : 0,
                      }
                    ]}
                    disabled={!isLibre && !isUser}
                    onPress={() => {
                      if (isLibre || isUser) handleSelectPoste(slot.key);
                    }}
                  >
                    <Image
                      source={player?.image ? { uri: player.image } : defaultPlayerImage}
                      style={styles.playerAvatar}
                    />
                    <Text style={styles.playerOnFieldText}>{slot.label}</Text>
                    <Text style={{ color: isLibre ? '#00D9FF' : '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 2 }}>
                      {isLibre ? 'Libre' : (player.username || player.nom)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* REMPLAÇANTS */}
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Remplaçants :</Text>
            <View style={styles.remplacantsRow}>
              {remplacants.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                <View key={`empty-rep-${i}`} style={styles.remplacantEmpty}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                </View>
              ))}
              {remplacants.map(r => (
                <View key={r.id} style={styles.remplacantEmpty}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                </View>
              ))}
              {Array.from({ length: Math.max(0, 5 - remplacants.length) }).map((_, i) => (
                <View key={`empty-rep-x${i}`} style={styles.remplacantEmpty}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                </View>
              ))}
            </View>

            {/* LISTE JOUEURS */}
            <Text style={styles.sectionTitle}>Joueurs</Text>
            <View>
              {members.map(item => (
                <View key={item.id} style={styles.playerCard}>
                  <Image
                    source={item.image ? { uri: item.image } : defaultPlayerImage}
                    style={styles.playerListAvatar}
                  />
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
  sectionTitle: {
    color: '#00D9FF',
    fontWeight: '700',
    fontSize: 19,
    marginVertical: 10,
    letterSpacing: 1,
    textAlign: 'left',
  },
  fieldWrapper: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 1.2,
    borderRadius: 20,
    alignSelf: 'center',
    overflow: 'hidden',
    marginVertical: 16,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fieldImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    opacity: 0.82
  },
  playerOnField: {
    position: 'absolute',
    alignItems: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE + 30,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  playerAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
    marginBottom: 2,
  },
  playerOnFieldText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  remplacantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
    gap: 5,
    justifyContent: 'flex-start'
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
    justifyContent: 'center'
  },
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
});
