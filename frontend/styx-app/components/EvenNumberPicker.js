// components/EvenNumberPicker.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function EvenNumberPicker({ value, onChange, min = 0, max = 20 }) {
  const decrease = () => onChange(Math.max(min, value - 2));
  const increase = () => onChange(Math.min(max, value + 2));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, value <= min && styles.btnDisabled]}
        onPress={decrease}
        disabled={value <= min}
      >
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        style={[styles.btn, value >= max && styles.btnDisabled]}
        onPress={increase}
        disabled={value >= max}
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#00D9FF',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
  },
  btnDisabled: {
    backgroundColor: '#555',
  },
  btnText: {
    color: '#050A23',
    fontSize: 20,
    fontWeight: '700',
  },
  value: {
    color: '#FFF',
    fontSize: 18,
    width: 40,
    textAlign: 'center',
  },
});
