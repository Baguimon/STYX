// components/LocationInput.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';

// Fonction utilitaire pour extraire la ville proprement
function getCityFromAddress(address) {
  // 1. Prendre "city"
  if (address.city) return address.city;
  // 2. Sinon "town", "village", "municipality"
  if (address.town) return address.town;
  if (address.village) return address.village;
  if (address.municipality) return address.municipality;
  // 3. Sinon essayer "locality" ou "hamlet"
  if (address.locality) return address.locality;
  if (address.hamlet) return address.hamlet;
  // 4. Fallback: département, région
  if (address.county) return address.county;
  if (address.state) return address.state;
  // Sinon rien
  return '';
}

export default function LocationInput({ value, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=7&accept-language=fr&countrycodes=fr`
      )
        .then(r => r.json())
        .then(data => {
          // Filtrer uniquement les résultats qui sont bien des villes FR
          const filtered = data.filter(item => {
            const city = getCityFromAddress(item.address);
            return (
              !!city &&
              item.address &&
              item.address.country_code === 'fr'
            );
          });
          setResults(filtered);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={styles.wrapper}>
      <Autocomplete
        data={results}
        defaultValue={query}
        onChangeText={text => {
          setQuery(text);
          onSelect({ name: text, lat: null, lon: null });
        }}
        containerStyle={styles.autocompleteContainer}
        inputContainerStyle={styles.inputContainer}
        listStyle={styles.list}
        textInputProps={{
          placeholder: 'Rechercher une ville...',
          placeholderTextColor: '#888',
          style: styles.textInput,
        }}
        flatListProps={{
          keyExtractor: item => item.place_id.toString(),
          keyboardShouldPersistTaps: 'handled',
          renderItem: ({ item }) => {
            const city = getCityFromAddress(item.address);
            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  setQuery(city);
                  setResults([]);
                  onSelect({
                    name: city,
                    lat: item.lat,
                    lon: item.lon,
                    details: item,
                  });
                }}
              >
                <Text style={styles.itemText}>{city}</Text>
              </TouchableOpacity>
            );
          },
        }}
      />
      {loading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  autocompleteContainer: { backgroundColor: 'transparent' },
  inputContainer: {
    backgroundColor: '#2A2A40',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    color: '#FFF',
    fontSize: 16,
  },
  list: {
    backgroundColor: '#1A1F3D',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 200,
  },
  item: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A40',
  },
  itemText: {
    fontSize: 15,
  },
  loader: {
    position: 'absolute',
    right: 10,
    top: 14,
  },
});
