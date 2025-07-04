import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { createClub } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

// Liste des logos proposés pour le club
const CLUB_LOGO_CHOICES = [
  { uri: '/assets/club-imgs/ecusson-1.png', img: require('../assets/club-imgs/ecusson-1.png') },
  { uri: '/assets/club-imgs/ecusson-2.png', img: require('../assets/club-imgs/ecusson-2.png') },
  { uri: '/assets/club-imgs/ecusson-3.png', img: require('../assets/club-imgs/ecusson-3.png') },
];

export default function CreateClubScreen() {
  // État du nom du club et logo sélectionné
  const [name, setName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(CLUB_LOGO_CHOICES[0].uri);
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  // Si l'utilisateur est déjà dans un club, il ne peut pas en créer un nouveau
  if (userInfo && userInfo.clubId) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepTitle}>Tu es déjà membre d’un club</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Tu dois quitter ton club actuel pour en créer un nouveau.
          </Text>
        </View>
      </View>
    );
  }

  // Envoie la création de club à l'API
  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Merci de renseigner le nom du club');
      return;
    }
    try {
      await createClub({ name, clubCaptainId: userInfo?.id, image: selectedLogo });
      Alert.alert('Succès', 'Club créé !');
      navigation.navigate('ClubHome');
    } catch (e) {
      // Gestion des différents messages d’erreur
      let msg = "Impossible de créer le club";
      if (e?.response?.data?.error) {
        msg = e.response.data.error;
        if (msg.includes('déjà utilisé')) {
          msg = "Ce nom de club est déjà utilisé, choisis-en un autre.";
        }
        if (msg.includes('mot interdit') || msg.includes('insulte')) {
          msg = "Le nom de club contient un mot interdit ou une insulte. Merci d'en choisir un autre.";
        }
        if (msg.includes('doit pas dépasser')) {
          msg = "Le nom de club est trop long (32 caractères max).";
        }
      }
      Alert.alert('Erreur', msg);
    }
  };

  // UI principale (formulaire de création)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        {/* Bouton retour */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        {/* Titre */}
        <Text style={styles.stepTitle}>Créer un club</Text>

        <View style={styles.card}>
          {/* Champ nom */}
          <Text style={styles.cardTitle}>Nom du club</Text>
          <TextInput
            placeholder="Entrez le nom de votre club"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
            returnKeyType="done"
          />

          {/* Choix du logo */}
          <Text style={[styles.cardTitle, { marginTop: 18, marginBottom: 8 }]}>
            Choisis un logo pour ton club
          </Text>
          <View style={styles.logosWrapper}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.logosScroll}
              showsHorizontalScrollIndicator={false}
            >
              {/* Affiche tous les logos, avec style sélectionné si besoin */}
              {CLUB_LOGO_CHOICES.map((imgObj) => (
                <TouchableOpacity
                  key={imgObj.uri}
                  onPress={() => setSelectedLogo(imgObj.uri)}
                  style={[
                    styles.logoChoice,
                    selectedLogo === imgObj.uri ? styles.logoSelected : null,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.logoPreviewWrapper}>
                    <Image source={imgObj.img} style={styles.logoImageZoomed} resizeMode="contain" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bouton valider */}
          <TouchableOpacity style={[styles.nextBtn, { marginTop: 24 }]} onPress={handleCreate}>
            <Text style={styles.nextText}>Créer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------- CSS compacté ---------- //
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#111',alignItems:'center',justifyContent:'flex-start',paddingHorizontal:12,paddingTop:Platform.OS==='ios'?80:36},
  backBtn:{alignSelf:'flex-start',marginBottom:18,backgroundColor:'transparent',paddingHorizontal:12,paddingVertical:4,borderRadius:8},
  backText:{color:'#00D9FF',fontWeight:'bold',fontSize:16,letterSpacing:0.3},
  stepTitle:{color:'#00D9FF',fontSize:25,fontWeight:'700',textAlign:'center',marginBottom:22,marginTop:10},
  card:{backgroundColor:'#1A1F3D',borderRadius:18,paddingVertical:26,paddingHorizontal:20,marginBottom:26,borderLeftWidth:4,borderLeftColor:'#00D9FF',shadowColor:'#000',shadowOffset:{width:0,height:6},shadowOpacity:0.18,shadowRadius:12,elevation:7,alignItems:'center',width:'100%',maxWidth:340},
  cardTitle:{color:'#FFF',fontSize:18,fontWeight:'600',marginBottom:8,textAlign:'center'},
  input:{backgroundColor:'#23284a',borderRadius:10,paddingVertical:13,paddingHorizontal:16,color:'#FFF',fontSize:16,width:'100%',marginTop:10,marginBottom:2,textAlign:'center',borderWidth:1,borderColor:'#222645'},
  nextBtn:{backgroundColor:'#00D9FF',borderRadius:24,paddingVertical:14,paddingHorizontal:36,alignItems:'center',minWidth:180,shadowColor:'#00D9FF',shadowOpacity:0.24,shadowRadius:6,elevation:4},
  nextText:{color:'#050A23',fontSize:17,fontWeight:'bold',textAlign:'center',letterSpacing:0.5},
  logosWrapper:{width:'100%',alignItems:'center',marginBottom:6,marginTop:2},
  logosScroll:{flexDirection:'row',justifyContent:'center',alignItems:'center',paddingVertical:4},
  logoChoice:{marginHorizontal:8,borderWidth:3,borderColor:'transparent',borderRadius:50,padding:5,backgroundColor:'#23284a',shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.18,shadowRadius:5,elevation:3,transition:'all 0.2s'},
  logoSelected:{borderColor:'#00D9FF',backgroundColor:'#181E34',shadowColor:'#00D9FF',shadowOpacity:0.25,elevation:8},
  logoPreviewWrapper:{width:78,height:78,borderRadius:39,overflow:'hidden',backgroundColor:'#222',alignItems:'center',justifyContent:'center'},
  logoImageZoomed:{width:140,height:140},
});
