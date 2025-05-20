// screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { registerUser } from '../services/api';
import styxLogo from '../assets/styx-logo.png';

const LEVELS = ['Débutant', 'Amateur', 'Expérimenté'];
const USERNAME_REGEX = /^[A-Za-z0-9._-]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    username: '',
    level: null,
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const nextStep = async () => {
    if (step === 0) {
      if (!form.username.trim()) return Alert.alert('⚠️', 'Veuillez saisir un nom d’utilisateur');
      if (!USERNAME_REGEX.test(form.username)) {
        return Alert.alert('⚠️', 'Le nom d’utilisateur ne peut contenir que lettres, chiffres, ".", "_" ou "-"');
      }
    }
    if (step === 1 && !form.level) {
      return Alert.alert('⚠️', 'Veuillez choisir votre niveau');
    }
    if (step === 2) {
      if (!form.email.match(/^[^@ ]+@[^@ ]+\.[^@ ]+$/)) {
        return Alert.alert('⚠️', 'Veuillez saisir un email valide');
      }
    }
    if (step === 3) {
      if (!PASSWORD_REGEX.test(form.password)) {
        return Alert.alert(
          '⚠️',
          'Le mot de passe doit avoir 8 caractères min., 1 majuscule, 1 chiffre et 1 symbole'
        );
      }
      if (form.password !== confirmPassword) {
        return Alert.alert('⚠️', 'Les mots de passe ne correspondent pas');
      }
      try {
        const { data } = await registerUser(form);
        Alert.alert('✅', data.message || 'Inscription réussie');
        navigation.replace('Login');
      } catch (err) {
        console.error(err);
        Alert.alert('❌ Erreur', err.response?.data?.message || 'Échec de l’inscription');
      }
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
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
        <Text style={styles.title}>Inscription</Text>

        {step === 0 && (
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#AAA"
            value={form.username}
            onChangeText={v => handleChange('username', v)}
            autoCapitalize="none"
          />
        )}

        {step === 1 && (
          <View style={styles.levelContainer}>
            {LEVELS.map(lv => (
              <TouchableOpacity
                key={lv}
                style={[
                  styles.levelButton,
                  form.level === lv && styles.levelButtonActive
                ]}
                onPress={() => handleChange('level', lv)}
              >
                <Text
                  style={[
                    styles.levelText,
                    form.level === lv && styles.levelTextActive
                  ]}
                >
                  {lv}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#AAA"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}

        {step === 3 && (
          <>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#AAA"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={v => handleChange('password', v)}
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

            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#AAA"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(prev => !prev)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          {step > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={prevStep}
            >
              <Text style={styles.navButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={nextStep}
          >
            <Text style={styles.navButtonText}>
              {step < 3 ? 'Suivant' : `S'inscrire`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 300, height: 120, resizeMode: 'contain' },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  title: {
    fontSize: 24, fontWeight: '600', color: '#050A23',
    textAlign: 'center', marginBottom: 20,
  },
  input: {
    backgroundColor: '#ECECEC',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#050A23',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#8BEAFF',
    borderColor: '#8BEAFF',
  },
  levelText: {
    color: '#050A23',
    fontSize: 14,
  },
  levelTextActive: {
    color: '#050A23',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#DDD', marginHorizontal: 5,
  },
  progressDotActive: { backgroundColor: '#8BEAFF' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#CCC',
    marginRight: 10,
  },
  nextButton: { backgroundColor: '#8BEAFF' },
  navButtonText: {
    color: '#050A23',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: { marginTop: 10 },
  link: {
    color: '#8BEAFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
