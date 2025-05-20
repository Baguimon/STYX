import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { getUserClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        const clubData = await getUserClub(userId);
        setClub(clubData);
      } catch (e) {
        setClub(null);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  if (!club) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ fontSize:18, marginBottom:16 }}>Tu n'es membre d'aucun club.</Text>
        <Button title="Créer un club" onPress={() => navigation.navigate('CreateClub')} />
        <Button title="Rejoindre un club" onPress={() => navigation.navigate('JoinClub')} />
      </View>
    );
  }

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'bold', marginBottom:16 }}>
        Ton club : {club.name}
      </Text>
      <Button title="Voir le club" onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })} />
    </View>
  );
}
