// screens/LoginScreen.js
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

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(
        'http://10.0.0.27:8000/api/login',
        { email, password }
      );
      await login(data.token);
      Alert.alert('✅ Connexion réussie');
      // Le RootNavigator bascule automatiquement sur Main
    } catch (error) {
      console.error(error);
      Alert.alert(
        '❌ Erreur',
        'Identifiants invalides ou serveur indisponible.'
      );
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

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#AAA"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Si tu crées ForgotPasswordScreen, décommente : */}
        {/* <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.link}>Pas encore de compte ? S’inscrire</Text>
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
  /* forgotContainer / forgot décommenter si utilisé */
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgot: {
    fontSize: 14,
    color: '#8BEAFF',
    textDecorationLine: 'underline',
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
