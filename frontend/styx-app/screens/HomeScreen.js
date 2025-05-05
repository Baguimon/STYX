// screens/HomeScreen.js
import React, { useRef, useContext, useEffect, useState } from 'react';
import {
  Animated,
  ScrollView,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
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
  const scrollRef = useRef(null);
  const scrollY   = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  // récupérer les matchs si besoin
  const [games, setGames] = useState([]);
  useEffect(() => {
    getGames().then(setGames).catch(console.error);
  }, []);

  // données statiques pour les tournois
  const TOURNAMENTS = [
    { name: 'Paris 16e', score: '8 vs 8', date: '18/02' },
    { name: 'Argenteuil', score: '6 vs 6', date: '18/02' },
    { name: 'St‑Ouen', score: '11 vs 11', date: '19/02' },
  ];

  const onPressArrow = () => {
    scrollRef.current?.getNode
      ? scrollRef.current.getNode().scrollTo({ y: screenHeight, animated: true })
      : scrollRef.current.scrollTo({ y: screenHeight, animated: true });
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      style={styles.container}
    >
      {/* === 1) Landing (100vh) === */}
      <View style={[styles.section, { height: screenHeight }]}>
        <ImageBackground source={fieldImage} style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity><Image source={bellIcon} style={styles.icon} /></TouchableOpacity>
            <Image source={styxLogo} style={styles.logo} />
            <TouchableOpacity><Image source={userIcon} style={styles.icon} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.arrowContainer} onPress={onPressArrow}>
            <Text style={styles.arrow}>↑</Text>
          </TouchableOpacity>
          <View style={styles.sliderContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.slider}
            >
              {['Football','Basket','Tennis','Rugby','Volley'].map(s => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ImageBackground>
      </View>

      {/* === 2) Menu principal (100vh) === */}
      <View style={[styles.section, { height: screenHeight, backgroundColor: '#FFF' }]}>
        {/* Card MATCHS / CLUB / PROFIL */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MATCHS</Text>
          <View style={styles.row}>
            <Feature bg={bgCreate}  label="Créer"    onPress={() => navigation.navigate('CreateGame')} />
            <Feature bg={bgJoin}    label="Rejoindre" onPress={() => navigation.navigate('JoinGame')} />
          </View>
          <View style={styles.row}>
            <Feature bg={bgClub}    label="Club"      onPress={() => navigation.navigate('Club')} />
            <Feature bg={bgProfile} label="Profil"    onPress={() => navigation.navigate('Profile')} />
          </View>
        </View>

        {/* Tournois */}
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

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>© Styx 2025</Text>
      </View>
    </Animated.ScrollView>
  );
}

function Feature({ bg, label, onPress }) {
  return (
    <TouchableOpacity style={styles.featureWrapper} onPress={onPress}>
      <ImageBackground source={bg} style={styles.feature} imageStyle={styles.featureImage}>
        <View style={styles.overlay} />
        <Text style={styles.featureText}>{label}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section:   { width: '100%' },

  /****** landing ******/
  background: { flex: 1, resizeMode: 'cover' },
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon:  { width: 24, height: 24, tintColor: '#FFF' },
  logo:  { width: 120, height: 40, resizeMode: 'contain' },
  arrowContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0, right: 0,
    alignItems: 'center',
  },
  arrow: { fontSize: 24, color: '#FFF' },
  sliderContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  slider: { paddingHorizontal: 20 },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  chipText: { color: '#FFF', fontWeight: '600' },

  /****** menu ******/
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featureWrapper: {
    width: (width - 16*2 - 12)/2,
    height: (width - 16*2 - 12)/2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  feature: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureImage: {
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featureText: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  tournois: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  tournoisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tournoisTitle: { fontSize: 16, fontWeight: 'bold' },
  tournoisMore:  { fontSize: 14, color: '#0af' },
  tournoisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tName: { flex: 1, fontWeight: '600' },
  tInfo: { flex: 1, color: '#666' },
  tBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0af',
    borderRadius: 6,
  },
  tBtnText: { color: '#0af', fontSize: 12, fontWeight: '600' },

  logout: {
    margin: 16,
    padding: 12,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  footer: {
    textAlign: 'center',
    color: '#AAA',
    marginBottom: 20,
  },
});
