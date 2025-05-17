// screens/LocationInput.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
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
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={styles.container}>
      <Autocomplete
        data={results}
        defaultValue={query}
        onChangeText={text => {
          setQuery(text);
          onSelect({ name: text, lat: null, lon: null }); // texte libre si rien sélectionné
        }}
        flatListProps={{
          keyExtractor: item => item.place_id.toString(),
          renderItem: ({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setQuery(item.display_name);
                setResults([]);
                onSelect({
                  name: item.display_name,
                  lat: item.lat,
                  lon: item.lon
                });
              }}
            >
              <Text style={styles.itemText}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )
        }}
        inputContainerStyle={styles.input}
        listContainerStyle={styles.list}
      />
      {loading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    backgroundColor: '#2A2A40',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  list: {
    backgroundColor: '#1A1F3D',
    borderRadius: 10,
    marginTop: 4,
  },
  itemText: {
    color: '#FFF',
    padding: 12,
  },
  loader: {
    position: 'absolute',
    right: 10,
    top: 14,
  }
});
