import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator, RefreshControl
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeInRight
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

import logoStyx from '../assets/styx-logo.png';
import mapsLogo from '../assets/maps-logo.png';
import planLogo from '../assets/plan-logo.png';
import wazeLogo from '../assets/waze-logo.png';

import { Share } from 'react-native';

import { getGameById, joinGame, leaveGame, switchTeam } from '../services/api';

const TEAM_COLORS = {
  1: '#2196F3',
  2: '#e74c3c'
};

// ----------- AnimatedButton ----------- //
function AnimatedButton({ onPress, children, style, animateOnPress }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      animateOnPress && { rotate: `${rotation.value}deg` }
    ].filter(Boolean),
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.76}
        onPressIn={() => { scale.value = withTiming(0.92); }}
        onPressOut={() => { scale.value = withTiming(1); }}
        onPress={() => {
          if (animateOnPress) {
            rotation.value = 0;
            rotation.value = withTiming(360, { duration: 440 }, () => {
              rotation.value = 0;
            });
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress && onPress();
        }}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ----------- HaloAvatar ----------- //
function HaloAvatar({ isMe, avatarUri, size = 34, borderColor }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isMe) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1800 }),
        -1
      );
    } else {
      rotation.value = 0;
    }
  }, [isMe]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {isMe && (
        <Animated.View
          style={[
            {
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              alignItems: "center", justifyContent: "center",
            },
            animatedStyle
          ]}
        >
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 2}
              stroke={borderColor || "#41B2D1"}
              strokeWidth={3.5}
              fill="none"
              strokeDasharray="14 10"
              opacity={0.93}
            />
          </Svg>
        </Animated.View>
      )}
      <Image
        source={avatarUri ? { uri: avatarUri } : require('../assets/avatar.png')}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#333"
        }}
      />
    </View>
  );
}

export default function GameDetailsScreen() {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const gameId = route.params?.game?.id || route.params?.gameId;
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamTab, setTeamTab] = useState(1);

  // Pull to refresh
  const [refreshing, setRefreshing] = useState(false);

  // Pour la map
  const [coords, setCoords] = useState(null);
  const [coordsLoading, setCoordsLoading] = useState(false);

  useEffect(() => { fetchDetails(); }, []);
  useEffect(() => { if (game?.location) fetchCoords(game.location); }, [game?.location]);
  const fetchDetails = async () => {
    setLoading(true);
    try {
      await getGameById(gameId).then(setGame);
    } catch (e) { }
    setLoading(false);
  };
  const fetchCoords = async (address) => {
    setCoordsLoading(true);
    setCoords(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const res = await fetch(url, { headers: { "User-Agent": "styx-app" } });
      const data = await res.json();
      if (data.length > 0) {
        setCoords({ lat: data[0].lat, lon: data[0].lon });
      }
    } catch (e) { setCoords(null); }
    finally { setCoordsLoading(false); }
  };

  const myPlayer = game?.players?.find(p => p.id === userInfo.id);
  const myTeam = myPlayer?.team;
  const alreadyJoined = !!myTeam;
  const team1Players = game?.players?.filter(p => p.team === 1) || [];
  const team2Players = game?.players?.filter(p => p.team === 2) || [];
  const isFull = game?.playerCount >= game?.maxPlayers;

  const openMaps = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const openWaze = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    Linking.openURL(`https://waze.com/ul?q=${query}`);
    Linking.openURL(`https://waze.com/ul?q=${query}`);
  };
  const openPlan = () => {
    if (!game?.location) return;
    const query = encodeURIComponent(game.location);
    Linking.openURL(`http://maps.apple.com/?q=${query}`);
  };

  const staticMapUrl = coords
    ? `https://static-maps.yandex.ru/1.x/?lang=fr_FR&ll=${coords.lon},${coords.lat}&z=15&l=map&size=450,230&pt=${coords.lon},${coords.lat},pm2rdm`
    : null;

  const handleJoin = async () => {
    try { await joinGame(gameId, userInfo.id, teamTab); fetchDetails(); }
    catch (e) { alert(`Erreur détaillée : ${e.response?.data?.error || e.message}`); }
  };

  const handleLeave = async () => {
    try { await leaveGame(gameId, userInfo.id); fetchDetails(); }
    catch (e) { alert(`Erreur détaillée : ${e.response?.data?.error || e.message}`); }
  };

  const handleSwitchTeam = async () => {
    try { const newTeam = myTeam === 1 ? 2 : 1; await switchTeam(gameId, userInfo.id, newTeam); fetchDetails(); }
    catch (e) { alert(`Erreur détaillée : ${e.response?.data?.error || e.message}`); }
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `⚽️ Rejoins notre match sur Styx !\nLieu : ${game.location}\nDate : ${formatShortDate(game.date)}\n\nId du match : ${gameId}\nOu lien : https://styxapp.com/match/${gameId}`
      });
    } catch (error) {
      alert('Erreur lors du partage du lien');
    }
  };

  // --- Pull to refresh ---
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetails();
    setRefreshing(false);
  };


  if (loading || !game) {
    return (
      <View style={styles.loadingScreen}>
        <Image
          source={require('../assets/styx-logo.png')}
          style={styles.loadingLogo}
        />
        <ActivityIndicator size="large" color="#00D9FF" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 36 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00D9FF"
          colors={["#00D9FF"]}
        />
      }
    >
      {/* Header: flèche + logo sur la même ligne */}
      <View style={styles.headerRow}>
        <AnimatedButton onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../assets/back-arrow.png')} style={{ width: 22, height: 22, tintColor: '#fff' }} />
        </AnimatedButton>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Image source={logoStyx} style={styles.logoStyx} />
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Sous-header: date + joueurs sur la même ligne */}
      <View style={styles.subHeaderRow}>
        <Text style={styles.topBarText}>Date: {formatShortDate(game.date)}</Text>
        <Text style={styles.headerRight}>
          Joueurs : {game.playerCount} / {game.maxPlayers}
        </Text>
      </View>

      {/* Localisation */}
      <View style={styles.locationBox}>
        <Text style={styles.locationTextBig}>{game.location}</Text>
        <View style={styles.locationBtns}>
          <AnimatedButton onPress={openMaps} style={styles.locAppBtn}>
            <Image source={mapsLogo} style={styles.locLogo} />
          </AnimatedButton>
          <AnimatedButton onPress={openPlan} style={styles.locAppBtn}>
            <Image source={planLogo} style={styles.locLogo} />
          </AnimatedButton>
          <AnimatedButton onPress={openWaze} style={styles.locAppBtn}>
            <Image source={wazeLogo} style={styles.locLogo} />
          </AnimatedButton>
        </View>
        {coordsLoading ? (
          <ActivityIndicator color="#41B2D1" size="large" style={{ marginTop: 10 }} />
        ) : coords && staticMapUrl ? (
          <Image source={{ uri: staticMapUrl }} style={styles.mapImg} />
        ) : (
          <Text style={{ color: '#bbb', marginTop: 12 }}>Carte non disponible</Text>
        )}
      </View>

      {/* Joueurs + Invite */}
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Joueurs</Text>
        <AnimatedButton style={styles.inviteBtnRow} onPress={handleShareInvite}>
          <Image source={require('../assets/person-add.png')} style={styles.inviteIcon} />
          <Text style={styles.inviteBtnTxt}>Inviter</Text>
        </AnimatedButton>
      </View>

      {/* Onglets équipes */}
      <View style={styles.teamsTabs}>
        <AnimatedButton
          style={[styles.teamTab, teamTab === 1 && styles.teamTabActiveBlue]}
          onPress={() => setTeamTab(1)}
        >
          <Text style={[styles.teamTabText, teamTab === 1 && { color: TEAM_COLORS[1] }]}>Équipe 1</Text>
        </AnimatedButton>
        <AnimatedButton
          style={[styles.teamTab, teamTab === 2 && styles.teamTabActiveRed]}
          onPress={() => setTeamTab(2)}
        >
          <Text style={[styles.teamTabText, teamTab === 2 && { color: TEAM_COLORS[2] }]}>Équipe 2</Text>
        </AnimatedButton>
      </View>

      {/* Liste joueurs (fade/slide in) */}
      <View>
        {(teamTab === 1 ? team1Players : team2Players).length === 0 && (
          <Text style={styles.noPlayerTxt}>Aucun joueur dans cette équipe.</Text>
        )}
        {(teamTab === 1 ? team1Players : team2Players).map((player, i) => {
          const borderColor = player.team === 1 ? TEAM_COLORS[1] : TEAM_COLORS[2];
          const profileBtnColor = player.team === 1 ? TEAM_COLORS[1] : TEAM_COLORS[2];
          const isMe = player.id === userInfo.id;
          return (
            <Animated.View
              key={player.id}
              entering={FadeInRight.duration(420).delay(i * 60)}
              style={[
                styles.playerRow,
                { borderColor, borderWidth: 2 }
              ]}
            >
              <HaloAvatar
                isMe={isMe}
                avatarUri={player.avatar}
                borderColor={borderColor}
              />
              <Text style={styles.playerName}>{player.username || player.name}</Text>
              <AnimatedButton
                style={[
                  styles.playerProfileBtn,
                  { borderColor: profileBtnColor }
                ]}
                onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id })}
              >
                <Text style={[styles.profileBtnTxt, { color: profileBtnColor }]}>Profil</Text>
              </AnimatedButton>
            </Animated.View>
          );
        })}
      </View>

      {/* Actions bas */}
      <View style={styles.actionsRow}>
        {alreadyJoined && (
          <>
            <AnimatedButton style={styles.switchBtn} onPress={handleSwitchTeam}>
              <Text style={styles.switchBtnText}>Changer d'équipe</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.quitBtn} onPress={handleLeave}>
              <Text style={styles.quitBtnText}>Quitter le match</Text>
            </AnimatedButton>
          </>
        )}
        {!alreadyJoined && !isFull && (
          <AnimatedButton style={[styles.joinBtn, { backgroundColor: TEAM_COLORS[teamTab] }]} onPress={handleJoin}>
            <Text style={styles.joinBtnText}>Rejoindre {teamTab === 1 ? "Équipe 1" : "Équipe 2"}</Text>
          </AnimatedButton>
        )}
      </View>
    </ScrollView>
  );
}

// format date JJ/MM
function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#14171a" },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 0,
    backgroundColor: "#14171a",
    paddingHorizontal: 8,
    marginTop: -15,
    marginBottom: -30,
  },
  backBtn: { padding: 0, marginLeft: 5 },
  logoStyx: {
    width: 250,
    height: 120,
    resizeMode: 'contain',
    alignSelf: "center",
    marginRight: 5,
  },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, backgroundColor: "#14171a" },
  headerRight: { color: "#fff", fontSize: 17, fontWeight: 'bold' },
  topBarText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  sectionTitle: { color: "#fff", fontWeight: "bold", fontSize: 25, marginTop: 22, marginBottom: 9, marginLeft: 14 },
  locationBox: { backgroundColor: "#232834", borderRadius: 25, marginHorizontal: 16, marginBottom: 12, padding: 18, alignItems: "center", marginTop: 25 },
  locationTextBig: { color: "#fff", fontSize: 21, textAlign: "center", marginBottom: 14 },
  locationBtns: { flexDirection: "row", marginBottom: 8, gap: 22, justifyContent: "center" },
  locAppBtn: { marginHorizontal: 10, padding: 8, borderRadius: 18, backgroundColor: "#181d22" },
  locLogo: { width: 54, height: 54, borderRadius: 13, backgroundColor: "#232834" },
  mapImg: { width: 320, height: 250, borderRadius: 15, marginTop: 10, resizeMode: "cover", opacity: 0.99 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginTop: 15, marginBottom: 2 },
  inviteBtnRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#fff", borderRadius: 10, paddingHorizontal: 13, paddingVertical: 7, backgroundColor: "#181d22", marginTop: 14 },
  inviteIcon: { width: 22, height: 22, marginRight: 7, tintColor: "#fff" },
  inviteBtnTxt: { color: "#fff", fontWeight: "bold" },
  teamsTabs: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 14, marginBottom: 10, paddingHorizontal: 10 },
  teamTab: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, marginHorizontal: 8, backgroundColor: "#232834", width: 170 },
  teamTabActiveBlue: { borderWidth: 2, borderColor: "#2196F3", backgroundColor: "#1a2636" },
  teamTabActiveRed: { borderWidth: 2, borderColor: "#e74c3c", backgroundColor: "#331a1a" },
  teamTabText: { color: "#bbb", fontWeight: "bold", fontSize: 17 },
  noPlayerTxt: { color: "#bbb", fontSize: 15, textAlign: "center", marginVertical: 12 },
  playerRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#232834", borderRadius: 10, marginHorizontal: 18, marginBottom: 8, padding: 8, paddingHorizontal: 12, marginTop: 4, borderWidth: 2, borderColor: "#41B2D1" },
  playerAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 10, backgroundColor: "#333" },
  playerName: { color: "#fff", fontWeight: "600", fontSize: 15, flex: 1, marginLeft: 8 },
  playerProfileBtn: { borderWidth: 1, borderColor: "#41B2D1", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 11, marginLeft: 10 },
  profileBtnTxt: { color: "#41B2D1", fontWeight: "bold" },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 23 },
  joinBtn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, margin: 8 },
  joinBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
  quitBtn: { backgroundColor: "#f44", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, margin: 8, width: 210 },
  quitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 17, textAlign: "center" },
  switchBtn: { backgroundColor: "#41B2D1", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, margin: 8, marginTop: 40, width: 210 },
  switchBtnText: { color: "#232834", fontWeight: "bold", fontSize: 17, textAlign: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#14171a' },
  loadingLogo: { width: 160, height: 80, resizeMode: 'contain', marginBottom: 8, },
  loadingText: { color: '#00D9FF', fontWeight: 'bold', marginTop: 18, fontSize: 19, letterSpacing: 1.2, },
});
