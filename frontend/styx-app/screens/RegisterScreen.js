// screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

import styxLogo from '../assets/styx-logo.png';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(
        'http://10.0.0.27:8000/api/register',
        form
      );
      Alert.alert('✅ Succès', response.data.message);
      // Redirige vers l'écran Login
      navigation.replace('Login');
    } catch (error) {
      console.error(error);
      Alert.alert(
        '❌ Erreur',
        'Une erreur est survenue lors de l\'inscription.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo centré */}
      <View style={styles.logoContainer}>
        <Image source={styxLogo} style={styles.logo} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Inscription</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#AAA"
          value={form.email}
          onChangeText={(v) => handleChange('email', v)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          placeholderTextColor="#AAA"
          value={form.username}
          onChangeText={(v) => handleChange('username', v)}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={form.password}
          onChangeText={(v) => handleChange('password', v)}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>

      {/* Lien vers l'écran Login */}
      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={styles.loginLink}
      >
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
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
    marginBottom: 15,
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
  button: {
    backgroundColor: '#8BEAFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 10,
  },
  link: {
    color: '#8BEAFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
