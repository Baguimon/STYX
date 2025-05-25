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
  Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { getUserGames } from '../services/api';

import fieldImage   from '../assets/field.jpg';
import styxLogo     from '../assets/styx-logo.png';
import bellIcon     from '../assets/adaptive-icon.png';
import logoutIcon   from '../assets/logout.png';
import bgCreate     from '../assets/create-bg.jpg';
import bgJoin       from '../assets/join-bg.jpg';
import bgClub       from '../assets/club-bg.jpg';
import bgProfile    from '../assets/profile-bg.jpg';
import matchIcon    from '../assets/match-icon.png';

const { width, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const scrollRef  = useRef(null);
  const scrollY    = useRef(new Animated.Value(0)).current;
  const arrowAnim  = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const { logout, userInfo } = useContext(AuthContext);
  const isFocused = useIsFocused();

  const [userGames, setUserGames] = useState([]);

  // Rafraîchit à chaque fois que tu reviens sur la Home (après avoir rejoint un match)
  useEffect(() => {
    if (userInfo?.id && isFocused) {
      getUserGames(userInfo.id).then(setUserGames).catch(console.error);
    }
  }, [userInfo, isFocused]);

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

  const scrollToMenu = () => {
    scrollRef.current?.scrollTo({ y: screenHeight, animated: true });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={fieldImage}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
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
          contentContainerStyle={{ minHeight: screenHeight * 2 }}
          style={{ flex: 1 }}
        >
          {/* PAGE 1 : Landing (pas de filtre sombre) */}
          <TouchableWithoutFeedback onPress={scrollToMenu}>
            <View style={[styles.section, { height: screenHeight }]}>
              <View style={styles.header}>
                <TouchableOpacity>
                  <Image source={bellIcon} style={styles.icon} />
                </TouchableOpacity>
                <Image source={styxLogo} style={styles.logo} />
                <TouchableOpacity onPress={logout}>
                  <Image source={logoutIcon} style={styles.logoutIcon} />
                </TouchableOpacity>
              </View>
              <Animated.View
                style={[
                  styles.arrowContainer,
                  { transform: [{ translateY: arrowTranslate }], bottom: 54 },
                ]}
              >
                <Text style={styles.arrow}>↑</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>

          {/* PAGE 2 : Menu principal avec filtre sombre */}
          <View style={[styles.section, { height: screenHeight, position: 'relative' }]}>
            {/* FILTRE sombre SUR le fond mais SOUS le contenu, va jusqu'en bas */}
            <View style={styles.page2DarkOverlay} pointerEvents="none" />

            <View style={{ height: Platform.OS === 'ios' ? 80 : 55 }} />
            <Text style={styxV3.mainTitle}>MENU</Text>

            {/* Les 4 grosses cartes */}
            <View style={styles.cardRowBlock}>
              <View style={styles.cardRow}>
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
                  onPress={() => navigation.navigate('GameSearch')}
                />
              </View>
              <View style={styles.cardRow}>
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
                  onPress={() => navigation.navigate('Profil')}
                />
              </View>
            </View>

            {/* Bloc MES MATCHS À VENIR aligné sur la même largeur que les cartes */}
            <View style={styxV3.upcomingBlock}>
              <View style={styxV3.upcomingHeader}>
                <Text style={styxV3.upcomingTitle}>Mes matchs à venir</Text>
                <TouchableOpacity style={styxV3.seeMoreBtn} onPress={() => navigation.navigate('UpcomingGames')}>
                  <Text style={styxV3.seeMoreText}>Voir plus</Text>
                </TouchableOpacity>
              </View>
              {userGames.length === 0 ? (
                <Text style={styxV3.empty}>Aucun match à venir.</Text>
              ) : (
                userGames.slice(0, 2).map((g) => ( // Affichage limité à 2 matchs max
                  <TouchableOpacity
                    key={g.id}
                    style={styxV3.matchCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('GameDetails', { game: g })}
                  >
                    <View style={styxV3.leftIcon}>
                      <Image
                        source={matchIcon}
                        style={{ width: 38, height: 38 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styxV3.matchMain}>{formatDateFR(g.date)}</Text>
                      <Text style={styxV3.matchSub}>{g.location}</Text>
                    </View>
                    <View style={styxV3.rightInfo}>
                      <Text style={styxV3.matchPlayers}>{g.playerCount} / {g.maxPlayers}</Text>
                      <View style={styxV3.greenDot} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
            {/* On met un espace en bas pour que le footer ne chevauche rien */}
            <View style={{ height: 38 }} />
          </View>
        </Animated.ScrollView>

        {/* Footer toujours visible, sans fond */}
        <View style={styles.footerAbsolute} pointerEvents="none">
          <Text style={styles.footerText}>© Styx 2025</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

function formatDateFR(dateStr) {
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) +
    ' ' +
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
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

const CARD_PADDING = 16;
const CARD_SIZE = (width - CARD_PADDING * 3) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  section:   { width: '100%' },

  background:     { flex: 1, resizeMode: 'cover' },
  header: {
    marginTop: Platform.OS === 'ios' ? 54 : 34,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  icon:           { width: 26, height: 26, tintColor: '#FFF', marginTop: -28 },
  logoutIcon:     { width: 26, height: 26, tintColor: '#FFF', marginTop: -28 },
  logo:           { width: 240, height: 120, resizeMode: 'contain', alignSelf: 'center', marginTop: -28 },
  arrowContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10, bottom: 44 },
  arrow:          { fontSize: 32, color: '#FFF' },

  // FILTRE sombre juste pour la 2ème page (menu)
  page2DarkOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1,
  },

  cardRowBlock: {
    marginTop: 40,
    marginHorizontal: CARD_PADDING,
    zIndex: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  featureWrapper: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  feature:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  featureImage:   { borderRadius: 17 },
  overlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },
  featureText:    { position: 'absolute', top: '35%', color: '#FFF', fontSize: 20, fontWeight: '600' },
  featureSubtitle:{ position: 'absolute', top: '55%', color: '#FFF', fontSize: 14, textAlign: 'center', width: '100%' },

  // Footer ABSOLU, transparent
  footerAbsolute: {
    position: 'absolute',
    left: 0, right: 0, bottom: Platform.OS === 'ios' ? 14 : 5,
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  footerText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
});

const styxV3 = StyleSheet.create({
  mainTitle: {
    color: '#fff',
    fontSize: 31,
    fontWeight: 'bold',
    alignSelf: 'center',
    letterSpacing: 1,
    marginBottom: -5,
    marginTop: -22,
    zIndex: 2,
  },
  upcomingBlock: {
    backgroundColor: '#31333A',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: CARD_PADDING,
    marginTop: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  upcomingTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  seeMoreBtn: {
    backgroundColor: '#F3F3F3',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  seeMoreText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#21222A',
  },
  empty: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 22,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3d46',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  leftIcon: {
    marginRight: 13,
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#23252b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchMain: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  matchSub: {
    color: '#b5bac7',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 0,
  },
  rightInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 14,
    minWidth: 47,
  },
  matchPlayers: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 1,
  },
  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: '#27D34D',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
});
