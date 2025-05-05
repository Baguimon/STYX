// screens/IntroScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';

import ballsPattern from '../assets/balls-pattern.png';
import styxLogo from '../assets/styx-logo.png';

export default function IntroScreen({ navigation }) {
  const { width, height } = Dimensions.get('window');
  const ballCount = 20;

  // Initialisation des balles avec paramètres aléatoires
  const [balls] = useState(() =>
    Array.from({ length: ballCount }).map((_, i) => {
      const size = 20 + Math.random() * 50;
      const yPos = Math.random() * (height + size) - size;
      const duration = 4000 + Math.random() * 10000;
      const anim = new Animated.Value(Math.random());
      const rotation = Math.random() * 360;
      const opacity = 0.1 + Math.random() * 0.4;
      const delay = Math.random() * duration;
      return { id: i, size, yPos, duration, anim, rotation, opacity, delay };
    })
  );

  // Animation pour le CTA
  const ctaAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation des balles
    balls.forEach((ball) => {
      const loopAnimate = () => {
        ball.anim.setValue(0);
        Animated.timing(ball.anim, {
          toValue: 1,
          duration: ball.duration,
          delay: ball.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => finished && loopAnimate());
      };
      loopAnimate();
    });

    // Animation du texte CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaAnim, {
          toValue: 0.4,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(ctaAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [balls, ctaAnim]);

  return (
    <TouchableWithoutFeedback onPress={() => navigation.replace('Auth')}>
      <View style={styles.container}>
        {balls.map((ball) => {
          const translateX = ball.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [width + ball.size, -ball.size]
          });
          return (
            <Animated.Image
              key={ball.id}
              source={ballsPattern}
              style={[
                styles.ball,
                {
                  width: ball.size,
                  height: ball.size,
                  top: ball.yPos,
                  transform: [
                    { translateX },
                    { rotate: `${ball.rotation}deg` }
                  ],
                  opacity: ball.opacity
                }
              ]}
            />
          );
        })}

        <View style={styles.overlay} />

        <View style={styles.center}>
          <Image source={styxLogo} style={styles.logo} />
          <Animated.Text style={[styles.cta, { opacity: ctaAnim }]}>appuyez sur l’écran pour continuer</Animated.Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A23'
  },
  ball: {
    position: 'absolute',
    resizeMode: 'contain'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 35, 0.75)'
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 500,
    height: 200,
    marginBottom: 15
  },
  cta: {
    fontSize: 16,
    color: '#c2f1ff',
    fontStyle: 'italic'
  }
});
