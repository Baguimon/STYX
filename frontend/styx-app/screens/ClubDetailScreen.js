import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { getClub, getClubMembers, leaveClub } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ClubDetailScreen() {
  const route = useRoute();
  const { clubId } = route.params;
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clubData = await getClub(clubId);
        setClub(clubData);
        const membersData = await getClubMembers(clubId);
        setMembers(membersData);
      } catch (e) {
        Alert.alert('Erreur', "Impossible de charger le club");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId]);

  const handleLeave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await leaveClub(userId);
      Alert.alert('Tu as quitté le club');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de quitter le club");
    }
  };

  if (loading) return <Text>Chargement...</Text>;

  if (!club) return <Text>Club introuvable</Text>;

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:22, fontWeight:'bold', marginBottom:8 }}>{club.name}</Text>
      <Text style={{ color:'#555', marginBottom:12 }}>Capitaine ID: {club.clubCaptain}</Text>
      <Text style={{ fontSize:18, marginBottom:6 }}>Membres du club :</Text>
      <FlatList
        data={members}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={{ paddingVertical:4 }}>{item.username} (lvl: {item.level}, rôle: {item.role})</Text>
        )}
      />
      <Button title="Quitter le club" color="#d00" onPress={handleLeave} />
    </View>
  );
}
