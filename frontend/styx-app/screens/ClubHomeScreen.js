import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getUserClub } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClub = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          const clubData = await getUserClub(userId);
          if (isActive) {
            if (clubData && clubData.id) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'ClubDetail', params: { clubId: clubData.id } }]
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'NoClubScreen' }]
              });
            }
          }
        } catch (e) {
          if (isActive) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'NoClubScreen' }]
            });
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClub();
      return () => { isActive = false; };
    }, [])
  );

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  return null; // Redirige direct, pas de rendu
}
