import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';

export default function RegisterScreen({ navigation }) {
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
      const response = await axios.post('http://10.0.0.27:8000/api/register', form);
      Alert.alert('✅ Succès', response.data.message);
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue lors de l\'inscription.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Nom d'utilisateur"
        value={form.username}
        onChangeText={(value) => handleChange('username', value)}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={form.password}
        onChangeText={(value) => handleChange('password', value)}
        secureTextEntry
      />

      <Button title="S'inscrire" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
});
