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
        `q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
      )
        .then(r => r.json())
        .then(data => setResults(data))
        .catch(() => {})
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
        listStyle={styles.list}             // ← c’est ici que ça se joue
        textInputProps={{
          placeholder: 'Rechercher un lieu…',
          placeholderTextColor: '#888',
          style: styles.textInput,
        }}
        flatListProps={{
          keyExtractor: item => item.place_id.toString(),
          keyboardShouldPersistTaps: 'handled',
          renderItem: ({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setQuery(item.display_name);
                setResults([]);
                onSelect({
                  name: item.display_name,
                  lat: item.lat,
                  lon: item.lon,
                });
              }}
            >
              <Text style={styles.itemText}>{item.display_name}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      {loading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  autocompleteContainer: {
    backgroundColor: 'transparent',
  },
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
    backgroundColor: '#1A1F3D', // fond sombre
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
    color: '#000000',
    fontSize: 15,
  },
  loader: {
    position: 'absolute',
    right: 10,
    top: 14,
  },
});
