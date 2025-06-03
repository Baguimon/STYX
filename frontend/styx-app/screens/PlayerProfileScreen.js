import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import { getUserById, getClubMembers } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const DEFAULT_AVATAR = require('../assets/player-default.png');
const DEFAULT_CLUB = require('../assets/club-default.png');

function getClubLogoSource(image) {
  if (!image || image === '') return DEFAULT_CLUB;
  if (image === '/assets/club-imgs/ecusson-1.png') return require('../assets/club-imgs/ecusson-1.png');
  if (image === '/assets/club-imgs/ecusson-2.png') return require('../assets/club-imgs/ecusson-2.png');
  if (image === '/assets/club-imgs/ecusson-3.png') return require('../assets/club-imgs/ecusson-3.png');
  if (typeof image === 'string' && image.startsWith('http')) return { uri: image };
  return DEFAULT_CLUB;
}

export default function PlayerProfileScreen({ route }) {
  const navigation = useNavigation();
  const { playerId } = route.params;
  const [player, setPlayer] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const data = await getUserById(playerId);
      setPlayer(data);
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
      setPlayer(null);
      setClubMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlayer(); }, [playerId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlayer();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#00D9FF" size="large" />
      </View>
    );
  }
  if (!player) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Joueur non trouvé</Text>
      </View>
    );
  }

  const username = player.username || '---';
  const level = player.level || '---';

  // Club infos
  let clubId = player.club?.id || player.clubId || null;
  let clubName = player.club?.name || player.clubName || '';
  let clubImage = player.club?.image || player.clubImage || null;

  if ((!clubId || !clubName || !clubImage) && clubMembers.length > 0 && clubMembers[0]?.club) {
    const memberClub = clubMembers[0].club;
    clubId = clubId || memberClub.id;
    if (!clubName || clubName === '' || clubName === '---') clubName = memberClub.name || '---';
    if (!clubImage || clubImage === '') clubImage = memberClub.image || '';
  }
  if (!clubName) clubName = '---';
  const nbClubMembers = clubMembers?.length ?? '---';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#111' }}
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
      {/* BOUTON RETOUR */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      {/* Top Avatar + infos */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarWrapper}>
          <Image source={DEFAULT_AVATAR} style={styles.avatar} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.username}>{username}</Text>
        </View>
        {/* PAS DE TROIS POINTS SUR LE PROFIL AUTRE JOUEUR */}
      </View>

      {/* Stats du joueur */}
      <View style={styles.statsRow}>
        <View style={styles.statsCol}>
          <Text style={styles.statsNumber}>---</Text>
          <Text style={styles.statsLabel}>Matchs joués</Text>
        </View>
      </View>
      <View style={styles.levelBlock}>
        <Text style={styles.levelIcon}>🙂</Text>
        <Text style={styles.levelText}>{level}</Text>
      </View>

      <Text style={styles.sectionTitle}>Stats du joueur</Text>
      <View style={styles.statDetails}>
        <Text style={styles.statsMainRow}>--- <Text style={{ color: '#13D76F' }}>V</Text>-<Text style={{ color: '#EAC94B' }}>N</Text>-<Text style={{ color: '#E33232' }}>D</Text></Text>
        <Text style={styles.statsSubRow}>--- MVP</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 38,
    alignItems: 'center',
    backgroundColor: '#111',
    minHeight: '100%',
  },
  backButton: {
    marginTop: 20,
    marginLeft: 0,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#00D9FF',
    fontSize: 17,
    fontWeight: 'bold',
    paddingLeft: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    marginTop: 20,
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
  clubBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23284a',
    borderRadius: 14,
    width: '87%',
    alignSelf: 'center',
    marginBottom: 10
  },
  clubImageZoomed: {
    width: 120,
    height: 120,
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
});
