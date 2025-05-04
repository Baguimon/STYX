import React, { useRef, useEffect } from 'react';
import { View, Animated, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export default function TabBarIcon({ name, size, color, focused, image }) {
  const baseSize = size;

  const scaleAnim = useRef(new Animated.Value(focused ? 1.3 : 1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      {image ? (
        <Animated.Image
          source={image}
          style={{
            width: baseSize,
            height: baseSize,
            tintColor: color,
            transform: [{ scale: scaleAnim }]
          }}
          resizeMode="contain"
        />
      ) : (
        <AnimatedIcon
          name={name}
          size={baseSize}
          color={color}
          style={{ transform: [{ scale: scaleAnim }] }}
        />
      )}
    </View>
  );
}
