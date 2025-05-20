import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createClub } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function CreateClubScreen() {
  const [name, setName] = useState('');
  const navigation = useNavigation();

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Merci de renseigner le nom du club');
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      await createClub({ name, clubCaptainId: userId });
      Alert.alert('Succès', 'Club créé !');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer le club");
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'bold' }}>Créer un club</Text>
      <TextInput
        placeholder="Nom du club"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth:1, borderColor:'#ccc', borderRadius:6, width:250, marginVertical:16, padding:10
        }}
      />
      <Button title="Créer" onPress={handleCreate} />
    </View>
  );
}
