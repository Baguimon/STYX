import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import { getUserClub, leaveClub } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClub = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          const clubData = await getUserClub(userId);
          if (isActive) setClub(clubData);
        } catch (e) {
          if (isActive) setClub(null);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClub();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLeave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      // Sauvegarde clubId MAINTENANT (tant que le state club est bien là)
      const clubId = club?.id;
      if (!clubId) {
        Alert.alert('Erreur', 'Club introuvable');
        return;
      }
      console.log('API_leaveClub →', { clubId, userId });
      await leaveClub(userId, clubId);
      Alert.alert('Tu as quitté le club');
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClubHome' }]
      });
    } catch (e) {
      if (e.response?.status === 404) {
        Alert.alert('Club supprimé', 'Retour à l\'accueil.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ClubHome' }]
        });
      } else {
        Alert.alert('Erreur', "Impossible de quitter le club");
        console.log('Erreur leaveClub :', e?.response?.data, e.message, e);
      }
    }
  };

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
      <Text style={{ fontSize:16, color:'#888', marginBottom:10 }}>
        Capitaine : {club.clubCaptain}
      </Text>
      <Button title="Voir le club" onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })} />
      <View style={{ height: 12 }} />
      <Button title="Quitter le club" color="#d00" onPress={handleLeave} />
    </View>
  );
}
