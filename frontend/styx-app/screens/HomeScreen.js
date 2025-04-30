import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUsers } from '../services/api';

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('UserDetails', { user: item })}>
      <View style={styles.item}>
        <Text style={styles.username}>{item.username}</Text>
        <Text>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
