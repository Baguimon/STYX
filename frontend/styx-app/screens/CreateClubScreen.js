import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export default function CreateClubScreen() {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  // BLOQUER si déjà membre d’un club
  if (userInfo && userInfo.clubId) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text style={{ fontSize:16, color:'#888', margin:16 }}>
          Tu es déjà membre d’un club. Tu dois le quitter pour en créer un nouveau.
        </Text>
      </View>
    );
  }

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Merci de renseigner le nom du club');
      return;
    }
    try {
      await createClub({ name, clubCaptainId: userInfo?.id });
      Alert.alert('Succès', 'Club créé !');
      navigation.navigate('ClubHome');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer le club");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Créer un club</Text>
      <TextInput
        placeholder="Nom du club"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          width: 250,
          marginVertical: 16,
          padding: 10,
        }}
      />
      <Button title="Créer" onPress={handleCreate} />
    </View>
  );
}
