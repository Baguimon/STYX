// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { loginUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import styxLogo from '../assets/styx-logo.png';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const data = await loginUser({ email, password });

      // 👉 Log la réponse pour vérifier TOUT ce que tu reçois
      console.log('Réponse data.user:', data.user);

      if (!data.user || !data.token) {
        Alert.alert('Erreur', 'Réponse du serveur invalide.');
        return;
      }

      await AsyncStorage.setItem('token', data.token);
      await login({ token: data.token, user: data.user });

      Alert.alert('✅ Connexion réussie');
    } catch (error) {
      console.log('Erreur Axios:', error);
      if (error.response) {
        console.log('Erreur serveur:', error.response.data);
        console.log('Code:', error.response.status);
      }
      if (error.response?.status === 401) {
        Alert.alert('❌ Identifiants incorrects');
      } else {
        Alert.alert('❌ Erreur', 'Réponse du serveur invalide');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoContainer}>
        <Image source={styxLogo} style={styles.logo} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Connexion</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#AAA"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={{ position: 'relative' }}>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#AAA"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.link}>Pas encore de compte ? S’inscrire</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A23',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 120,
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#050A23',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ECECEC',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#050A23',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  button: {
    backgroundColor: '#8BEAFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 15,
  },
  link: {
    color: '#8BEAFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
