// screens/HomeScreen.js
import React, { useRef, useContext, useEffect, useState } from 'react';
import {
  Animated,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { getGames } from '../services/api';

import fieldImage   from '../assets/field.jpg';
import styxLogo     from '../assets/styx-logo.png';
import bellIcon     from '../assets/adaptive-icon.png';
import userIcon     from '../assets/profile-icon.png';
import bgCreate     from '../assets/create-bg.jpg';
import bgJoin       from '../assets/join-bg.jpg';
import bgClub       from '../assets/club-bg.jpg';
import bgProfile    from '../assets/profile-bg.jpg';

const { width, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const scrollRef  = useRef(null);
  const scrollY    = useRef(new Animated.Value(0)).current;
  const arrowAnim  = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const [games, setGames] = useState([]);
  useEffect(() => {
    getGames().then(setGames).catch(console.error);
  }, []);

  // Animation de la flèche
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const arrowTranslate = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const TOURNAMENTS = [
    { name: 'Paris 16e', score: '8 vs 8', date: '18/02' },
    { name: 'Argenteuil', score: '6 vs 6', date: '18/02' },
    { name: 'St-Ouen',   score: '11 vs 11', date: '19/02' },
  ];

  const scrollToMenu = () => {
    scrollRef.current?.scrollTo({ y: screenHeight, animated: true });
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      snapToInterval={screenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      style={styles.container}
    >
      {/* 1) Landing */}
      <TouchableWithoutFeedback onPress={scrollToMenu}>
        <View style={[styles.section, { height: screenHeight }]}>
          <ImageBackground source={fieldImage} style={styles.background}>
            <View style={styles.header}>
              <TouchableOpacity><Image source={bellIcon} style={styles.icon} /></TouchableOpacity>
              <Image source={styxLogo} style={styles.logo} />
              <TouchableOpacity><Image source={userIcon} style={styles.icon} /></TouchableOpacity>
            </View>

            <Animated.View
              style={[
                styles.arrowContainer,
                { transform: [{ translateY: arrowTranslate }] }
              ]}
            >
              <Text style={styles.arrow}>↑</Text>
            </Animated.View>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>

      {/* 2) Menu principal */}
      <View style={[styles.section, { height: screenHeight }]}>
        <ImageBackground source={fieldImage} style={styles.background}>
          <View style={styles.menuOverlay} />

          <View style={styles.card}>
            <View style={styles.row}>
              <Feature
                bg={bgCreate}
                label="Créer"
                subtitle="un match"
                onPress={() => navigation.navigate('CreateGame')}
              />
              <Feature
                bg={bgJoin}
                label="Rejoindre"
                subtitle="un match"
                onPress={() => navigation.navigate('JoinGame')}
              />
            </View>
            <View style={styles.row}>
              <Feature
                bg={bgClub}
                label="Club"
                subtitle=""
                onPress={() => navigation.navigate('Club')}
              />
              <Feature
                bg={bgProfile}
                label="Profil"
                subtitle=""
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </View>

          <View style={styles.tournois}>
            <View style={styles.tournoisHeader}>
              <Text style={styles.tournoisTitle}>Tournois</Text>
              <TouchableOpacity><Text style={styles.tournoisMore}>Voir plus</Text></TouchableOpacity>
            </View>
            {TOURNAMENTS.map(t => (
              <View key={t.name} style={styles.tournoisItem}>
                <Text style={styles.tName}>{t.name}</Text>
                <Text style={styles.tInfo}>{t.score}   {t.date}</Text>
                <TouchableOpacity style={styles.tBtn}>
                  <Text style={styles.tBtnText}>Détails</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
          <Text style={styles.footer}>© Styx 2025</Text>
        </ImageBackground>
      </View>
    </Animated.ScrollView>
  );
}

function Feature({ bg, label, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.featureWrapper} onPress={onPress}>
      <ImageBackground source={bg} style={styles.feature} imageStyle={styles.featureImage}>
        <View style={styles.overlay} />
        <Text style={styles.featureText}>{label}</Text>
        {subtitle ? (
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        ) : null}
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section:   { width: '100%' },

  background:     { flex: 1, resizeMode: 'cover' },
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon:           { width: 24, height: 24, marginTop: -28, tintColor: '#FFF' },
  logo:           { width: 300, height: 140, marginTop: -38,resizeMode: 'contain' },
  arrowContainer: { position: 'absolute', bottom: 120, left: 0, right: 0, alignItems: 'center' },
  arrow:          { fontSize: 32, color: '#FFF' },

  menuOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  card: {
    marginHorizontal: 16,
    marginTop: 75,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureWrapper: {
    width: ((width - 10 - 30) / 2) * 0.9,
    height: ((width - 15 - 30) / 2) * 0.9,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
    marginTop: 5,
  },
  feature:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  featureImage:   { borderRadius: 8 },
  overlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  featureText:    { position: 'absolute', top: '35%', color: '#FFF', fontSize: 18, fontWeight: '600' },
  featureSubtitle:{ position: 'absolute', top: '55%', color: '#FFF', fontSize: 14, textAlign: 'center', width: '100%' },

  tournois:       { marginHorizontal: 16, marginTop: 35, padding: 16, backgroundColor: '#F7F7F7', borderRadius: 12 },
  tournoisHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tournoisTitle:  { fontSize: 20, fontWeight: 'bold' },
  tournoisMore:   { fontSize: 14, color: '#0af' },
  tournoisItem:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 8 },
  tName:          { flex: 1, fontWeight: '600' },
  tInfo:          { flex: 1, color: '#666' },
  tBtn:           { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#0af', borderRadius: 6 },
  tBtnText:       { color: '#0af', fontSize: 12, fontWeight: '600' },

  logout:        { margin: 16, marginTop: 40, padding: 12, backgroundColor: '#d9534f', borderRadius: 8, alignItems: 'center' },
  logoutText:    { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  footer:        { textAlign: 'center', color: '#AAA', marginTop: -12 },
});
