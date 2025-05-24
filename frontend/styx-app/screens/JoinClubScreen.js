import React, { useState, useContext } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import { getClubs, joinClub } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export default function JoinClubScreen() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  // BLOQUER si déjà membre d’un club
  if (userInfo && userInfo.clubId) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ fontSize:16, color:'#888', margin:16 }}>
          Tu es déjà membre d’un club. Tu dois le quitter pour en rejoindre un autre.
        </Text>
      </View>
    );
  }

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClubs = async () => {
        setLoading(true);
        try {
          const data = await getClubs();
          if (isActive) setClubs(data);
        } catch (e) {
          if (isActive) setClubs([]);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClubs();
      return () => {
        isActive = false;
      };
    }, [])
  );

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

  if (loading) return <ActivityIndicator size="large" />;

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
