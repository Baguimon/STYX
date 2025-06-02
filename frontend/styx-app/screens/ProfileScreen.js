import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const DEFAULT_AVATAR = require('../assets/player-default.png');
const DEFAULT_CLUB = require('../assets/club-default.png');

export default function ProfileScreen() {
  const { userInfo } = useContext(AuthContext);

  // Fallback de démo si pas connecté
  const fakeUser = {
    username: 'Pogba',
    email: 'pogba@bleus.fr',
    level: 'Débutant',
    poste: 'MC',
    club: { name: 'Webscen' },
    createdAt: '2024-06-01',
    // Ce qui manque dans le back :
    // matchsJoues: 18,
    // amis: 23,
    // stats: { win: 3, draw: 0, lose: 1 },
  };
  const user = userInfo || fakeUser;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181818' }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* TOP HEADER + AVATAR */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.menuBtn}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>⋯</Text>
          </TouchableOpacity>
          <Image source={DEFAULT_AVATAR} style={styles.avatar} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.userAge}>• --</Text>
          </View>
        </View>

        {/* INFOS JEUX */}
        <View style={styles.userStatsRow}>
          <View style={styles.statsBloc}>
            <Text style={styles.statsNumber}>{'--'}</Text>
            <Text style={styles.statsLabel}>Matchs joués</Text>
          </View>
          <View style={styles.statsBloc}>
            <Text style={styles.statsNumber}>{'--'}</Text>
            <Text style={styles.statsLabel}>Amis</Text>
          </View>
        </View>

        {/* NIVEAU & BARRE */}
        <View style={styles.levelRow}>
          <Text style={styles.levelIcon}>🙂</Text>
          <Text style={styles.levelLabel}>{user.level || '---'}</Text>
          <Text style={styles.levelHour}>--h</Text>
        </View>
        <View style={styles.levelBarContainer}>
          <View style={styles.levelBarBg}>
            {/* Barre vide */}
          </View>
        </View>

        {/* STATS DU JOUEUR */}
        <Text style={styles.sectionTitle}>Stats du joueur</Text>
        <View style={styles.sectionCard}>
          <Text style={styles.statsLine}>
            --- &nbsp; <Text style={{ color: '#7dff91', fontWeight: 'bold' }}>V</Text>
            -<Text style={{ color: '#ffd700', fontWeight: 'bold' }}>N</Text>
            -<Text style={{ color: '#e23030', fontWeight: 'bold' }}>D</Text>
          </Text>
          <Text style={styles.mvpLine}>-- MVP</Text>
          <Text style={styles.infoLine}>Sport le plus joué <Text style={styles.sportMain}>---</Text></Text>
        </View>

        {/* DERNIERS MATCHS */}
        <Text style={styles.sectionTitle}>Derniers Matchs</Text>
        <View style={[styles.sectionCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 78 }]}>
          <Text style={{ color: '#999' }}>Aucun match à afficher pour le moment.</Text>
        </View>

        {/* CLUB DU JOUEUR */}
        <Text style={styles.sectionTitle}>Club du Joueur</Text>
        <View style={[styles.sectionCard, { flexDirection: 'row', alignItems: 'center', minHeight: 90, paddingHorizontal: 10 }]}>
          <Image source={DEFAULT_CLUB} style={styles.clubLogo} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.clubName}>{user.club?.name || 'Sans club'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.clubStatLabel}>Joueurs</Text>
              <Text style={styles.clubStatValue}>--/11</Text>
              <Text style={[styles.clubStatLabel, { marginLeft: 8 }]}>V-N-D</Text>
              <Text style={styles.clubStatValue}>--- </Text>
            </View>
            <Text style={styles.clubSport}>
              Sport du club <Text style={{ color: '#34e5ff', fontWeight: 'bold' }}>---</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.clubBtn}>
          <Text style={styles.clubBtnText}>Voir le club</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 7,
  },
  menuBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#00D9FF',
    backgroundColor: '#202d3c',
    marginRight: 18,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 12,
    marginBottom: 2,
    textAlign: 'center',
  },
  userAge: {
    color: '#ccc',
    fontWeight: '600',
    fontSize: 16,
    marginTop: -2,
    marginBottom: 7,
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    width: '100%',
    marginBottom: 6,
  },
  statsBloc: {
    alignItems: 'center',
    flex: 1,
  },
  statsNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  statsLabel: {
    color: '#b5b6c0',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 8,
    marginBottom: 2,
    gap: 7,
  },
  levelIcon: {
    color: '#fff',
    fontSize: 16,
    marginRight: 4,
  },
  levelLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 2,
  },
  levelHour: {
    color: '#b5b6c0',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  levelBarContainer: {
    width: '70%',
    alignSelf: 'center',
    marginTop: 1,
    marginBottom: 18,
  },
  levelBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 8,
    backgroundColor: '#303846',
    marginTop: 0,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 9,
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  sectionCard: {
    backgroundColor: '#1e212e',
    borderRadius: 18,
    padding: 18,
    width: '89%',
    marginBottom: 12,
    alignSelf: 'center',
  },
  statsLine: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  mvpLine: {
    color: '#82e482',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  infoLine: {
    color: '#b8e6fa',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 1,
  },
  sportMain: {
    color: '#34e5ff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 3,
  },
  clubLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#00D9FF',
    backgroundColor: '#1e212e',
  },
  clubName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  clubStatLabel: {
    color: '#7cffe3',
    fontSize: 14,
    fontWeight: '500',
  },
  clubStatValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 2,
    marginLeft: 0,
    marginRight: 2,
  },
  clubSport: {
    color: '#b8e6fa',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
  clubBtn: {
    backgroundColor: 'transparent',
    borderColor: '#34e5ff',
    borderWidth: 1.7,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 7,
    alignSelf: 'center',
  },
  clubBtnText: {
    color: '#34e5ff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.8,
  },
});
