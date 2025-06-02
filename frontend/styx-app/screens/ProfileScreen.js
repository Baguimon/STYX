import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const DEFAULT_AVATAR = require('../assets/player-default.png');

export default function ProfileScreen() {
  const { userInfo } = useContext(AuthContext);

  if (!userInfo) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Non connecté</Text>
      </View>
    );
  }

  const username = userInfo.username || '---';
  const level = userInfo.level || '---';
  const clubName = userInfo.club?.name || '---';
  const clubPlayerCount = userInfo.club?.playerCount !== undefined
    ? userInfo.club.playerCount
    : '---';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Avatar + infos */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={DEFAULT_AVATAR}
              style={styles.avatar}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.userAge}>---</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.menuDots}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Matchs joués / amis */}
        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <Text style={styles.statsNumber}>---</Text>
            <Text style={styles.statsLabel}>Matchs joués</Text>
          </View>
          <View style={styles.statsCol}>
            <Text style={styles.statsNumber}>---</Text>
            <Text style={styles.statsLabel}>Amis</Text>
          </View>
        </View>

        {/* Niveau */}
        <View style={styles.levelBlock}>
          <Text style={styles.levelIcon}>🙂</Text>
          <Text style={styles.levelText}>{level}</Text>
          <Text style={styles.levelDuration}>---</Text>
        </View>
        <View style={styles.levelBarBG}>
          <View style={[styles.levelBarFill, { width: '40%' }]} />
        </View>

        {/* Section stats */}
        <Text style={styles.sectionTitle}>Stats du joueur</Text>
        <View style={styles.statDetails}>
          <Text style={styles.statsMainRow}>--- <Text style={{color: '#13D76F'}}>V</Text>-<Text style={{color: '#EAC94B'}}>N</Text>-<Text style={{color: '#E33232'}}>D</Text></Text>
          <Text style={styles.statsSubRow}>--- MVP</Text>
          {/* LIGNE SUPPRIMÉE: Sport le plus joué */}
        </View>

        {/* Derniers matchs */}
        <Text style={styles.sectionTitle}>Derniers Matchs</Text>
        <View style={styles.matchCard}>
          <Text style={styles.matchPlaceholder}>---</Text>
        </View>

        {/* Bloc club */}
        <Text style={styles.sectionTitle}>Club du Joueur</Text>
        <View style={styles.clubBlock}>
          <Image source={require('../assets/club-default.png')} style={styles.clubLogo} />
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.clubName}>{clubName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={styles.clubStatSmall}>Joueurs </Text>
              <Text style={styles.clubStatNum}>{clubPlayerCount}</Text>
              <Text style={[styles.clubStatSmall, { marginLeft: 18 }]}>V-N-D </Text>
              <Text style={[styles.clubStatNum, { color: '#13D76F', marginLeft: 2 }]}>---</Text>
            </View>
            {/* LIGNE SUPPRIMÉE: Sport du club */}
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
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
  userAge: {
    color: '#A9A9A9',
    fontSize: 19,
    fontWeight: '500',
  },
  menuDots: {
    color: '#AAA',
    fontSize: 30,
    marginRight: 7,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    width: '75%',
    justifyContent: 'space-between',
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
  levelDuration: {
    color: '#A9A9A9',
    fontSize: 14,
  },
  levelBarBG: {
    backgroundColor: '#191B2B',
    width: '77%',
    height: 7,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 18,
    marginTop: 1,
    overflow: 'hidden'
  },
  levelBarFill: {
    height: 7,
    backgroundColor: '#00D9FF',
    borderRadius: 4,
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
  statsLabel2: {
    color: '#A9A9A9',
    fontSize: 13,
    marginTop: 2
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
    padding: 12,
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
  clubBtn: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 33,
    marginBottom: 18,
    marginTop: 1
  },
  clubBtnText: {
    color: '#00D9FF',
    fontWeight: 'bold',
    fontSize: 16
  },
});
