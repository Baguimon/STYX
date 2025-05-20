import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import { getClubs, joinClub } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function JoinClubScreen() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const data = await getClubs();
        setClubs(data);
      } catch (e) {
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleJoin = async (clubId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await joinClub(userId, clubId);
      Alert.alert('Succès', 'Tu as rejoint le club !');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de rejoindre le club");
    }
  };

  if (loading) return <Text>Chargement...</Text>;

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:20, fontWeight:'bold', marginBottom:12 }}>Liste des clubs</Text>
      <FlatList
        data={clubs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{
            padding:12, marginBottom:10, backgroundColor:'#eee', borderRadius:8, flexDirection:'row', justifyContent:'space-between', alignItems:'center'
          }}>
            <Text>{item.name}</Text>
            <Button title="Rejoindre" onPress={() => handleJoin(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
