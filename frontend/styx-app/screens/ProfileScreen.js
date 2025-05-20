// ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Progress from 'react-native-progress';

export default function ProfileScreen() {
  // Exemples de données statiques (à remplacer par tes vrais props ou useContext)
  const user = {
    name: 'Pogba',
    age: 28,
    avatar: require('../assets/avatar.png'),
    matches: 18,
    friends: 23,
    level: 'Débutant',
    xpPercent: 0.8,
    totalHours: 26,
    stats: {
      V: 9,
      N: 2,
      D: 7,
      mvp: 2,
      sport: 'Football',
    },
    lastGames: [
      {
        sport: 'Football',
        result: 'Victoire',
        score: '4 - 2',
        mvp: 'User4562891',
        opponent: 'FC Barcelone',
        details: true,
      },
      {
        sport: 'Football',
        result: 'Défaite',
        score: '1 - 2',
        mvp: 'User4350291',
        opponent: 'Real Madrid',
        details: true,
      },
    ],
    club: {
      name: 'Webscen',
      joueurs: '4/11',
      stats: { V: 3, N: 0, D: 1 },
      sport: 'Football',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* HEADER PROFIL */}
      <View style={styles.headerRow}>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text style={styles.name}>
            {user.name} <Text style={styles.age}>• {user.age}</Text>
          </Text>
          <View style={styles.statsSummaryRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user.matches}</Text>
              <Text style={styles.statLabel}>Matchs joués</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user.friends}</Text>
              <Text style={styles.statLabel}>Amis</Text>
            </View>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelIcon}>🙂</Text>
            <Text style={styles.levelText}>{user.level}</Text>
            <Text style={styles.hours}>{user.totalHours}h</Text>
          </View>
          <Progress.Bar
            progress={user.xpPercent}
            color="#8BEAFF"
            unfilledColor="#333"
            borderWidth={0}
            height={7}
            width={200}
            style={{ marginTop: 5, marginLeft: -5 }}
          />
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Stats du joueur */}
      <Text style={styles.sectionTitle}>Stats du joueur</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        <Text style={styles.vnd}>
          <Text style={styles.victory}>{user.stats.V}</Text>-
          <Text style={styles.draw}>{user.stats.N}</Text>-
          <Text style={styles.defeat}>{user.stats.D}</Text>
        </Text>
        <Text style={styles.vndLegend}>
          {'  '}
          <Text style={styles.victory}>V</Text>-
          <Text style={styles.draw}>N</Text>-
          <Text style={styles.defeat}>D</Text>
        </Text>
      </View>
      <Text style={styles.mvp}>{user.stats.mvp} <Text style={{color:'#fff'}}>MVP</Text></Text>
      <Text style={styles.sportMostPlayed}>
        Sport le plus joué <Text style={styles.sportHighlight}>{user.stats.sport}</Text>
      </Text>

      {/* Derniers matchs */}
      <Text style={styles.sectionTitle}>Deniers Matchs</Text>
      <View style={styles.matchesRow}>
        {user.lastGames.map((game, i) => (
          <View key={i} style={styles.matchCard}>
            <Text style={styles.matchSport}>{game.sport}</Text>
            <Text
              style={[
                styles.matchResult,
                game.result === 'Victoire' ? styles.resultWin : styles.resultLose,
              ]}
            >
              {game.result}
            </Text>
            <Text style={styles.matchScore}>{game.score}</Text>
            <Text style={styles.matchMvp}>
              <Text style={styles.matchMvpLabel}>MVP </Text>
              {game.mvp}
            </Text>
            <Text style={styles.matchOpponent}>VS: {game.opponent}</Text>
            <View style={styles.matchDetailsRow}>
              <Image source={game.img} style={styles.matchImg} />
              <TouchableOpacity>
                <Text style={styles.matchDetailsBtn}>Détails</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Club du joueur */}
      <Text style={styles.sectionTitle}>Club du Joueur</Text>
      <View style={styles.clubSection}>
        <Image source={user.club.logo} style={styles.clubLogo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.clubName}>{user.club.name}</Text>
          <Text style={styles.clubStatLabel}>Joueurs <Text style={styles.clubStatValue}>{user.club.joueurs}</Text></Text>
          <Text style={styles.clubStats}>
            <Text style={styles.victory}>{user.club.stats.V}</Text>-
            <Text style={styles.draw}>{user.club.stats.N}</Text>-
            <Text style={styles.defeat}>{user.club.stats.D}</Text> {'  '}
            <Text style={styles.vndLegend}>V-N-D</Text>
          </Text>
          <Text style={styles.sportMostPlayed}>
            Sport du club <Text style={styles.sportHighlight}>{user.club.sport}</Text>
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.clubBtn}>
        <Text style={styles.clubBtnText}>Voir le club</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 80,
    borderWidth: 2.5,
    borderColor: '#202127',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    marginBottom: 2,
  },
  age: {
    color: '#ccc',
    fontSize: 21,
    fontWeight: 'normal',
  },
  menuBtn: {
    marginLeft: 10,
    padding: 8,
    alignSelf: 'flex-start',
  },
  menuDots: {
    color: '#fff',
    fontSize: 32,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 2,
  },
  statBox: {
    marginRight: 30,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 13,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  levelIcon: {
    fontSize: 19,
    marginRight: 5,
  },
  levelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 15,
  },
  hours: {
    color: '#ccc',
    fontSize: 15,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 6,
  },
  vnd: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 7,
  },
  victory: { color: '#5ae169', fontWeight: 'bold' },
  draw: { color: '#ffaa3c', fontWeight: 'bold' },
  defeat: { color: '#f2475d', fontWeight: 'bold' },
  vndLegend: { fontSize: 15, color: '#bbb' },
  mvp: {
    color: '#5ae1ec',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 5,
  },
  sportMostPlayed: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 5,
  },
  sportHighlight: {
    color: '#8BEAFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 3,
  },
  matchesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 14,
    marginRight: 12,
    marginBottom: 14,
    width: 230,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  matchSport: { fontSize: 17, fontWeight: 'bold', color: '#1c1b24', marginBottom: 4 },
  matchResult: { fontWeight: 'bold', fontSize: 15 },
  resultWin: { color: '#5ae169' },
  resultLose: { color: '#f2475d' },
  matchScore: { fontSize: 16, color: '#18181B', fontWeight: '600' },
  matchMvpLabel: { color: '#7ec1e3' },
  matchMvp: { fontSize: 13, color: '#555', marginBottom: 2 },
  matchOpponent: { fontSize: 13, color: '#222', marginBottom: 4 },
  matchDetailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, justifyContent: 'space-between' },
  matchImg: { width: 54, height: 54, borderRadius: 12 },
  matchDetailsBtn: {
    color: '#7ec1e3',
    fontWeight: '700',
    fontSize: 16,
    padding: 7,
    borderRadius: 10,
  },
  clubSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    backgroundColor: '#222428',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
  },
  clubLogo: {
    width: 68,
    height: 68,
    borderRadius: 40,
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#8BEAFF',
  },
  clubName: { fontWeight: 'bold', color: '#fff', fontSize: 18, marginBottom: 5 },
  clubStatLabel: { color: '#bbb', fontSize: 14, marginBottom: 2 },
  clubStatValue: { color: '#fff', fontWeight: 'bold' },
  clubStats: { fontSize: 15, marginBottom: 2 },
  clubBtn: {
    backgroundColor: 'transparent',
    borderColor: '#8BEAFF',
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    borderRadius: 16,
    marginTop: 2,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  clubBtnText: { color: '#8BEAFF', fontSize: 16, fontWeight: '600' },
  bottomSpace: { height: 60 },
});
