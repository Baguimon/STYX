import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Modal, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import {
  getUsers, getClubs, getGames,
  deleteUser, deleteClub, deleteGame,
  updateUser, updateClub, updateGame
} from '../services/api';

const PAGE_SIZE = 20;
const SHOW_LIMIT = 5;

export default function AdminScreen() {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  // Onglet actif
  const [activeTab, setActiveTab] = useState('users');
  // Data
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [games, setGames] = useState([]);
  // Recherche & pagination
  const [searchUser, setSearchUser] = useState('');
  const [searchClub, setSearchClub] = useState('');
  const [searchGame, setSearchGame] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [clubPage, setClubPage] = useState(1);
  const [gamePage, setGamePage] = useState(1);
  // Modal édition
  const [modal, setModal] = useState({ type: null, item: null });
  const [editValues, setEditValues] = useState({});

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUsers().catch(() => []),
      getClubs().catch(() => []),
      getGames().catch(() => []),
    ]).then(([u, c, g]) => {
      setUsers(u);
      setClubs(c);
      setGames(g);
    }).finally(() => setLoading(false));
  }, []);

  // Filtrage & pagination
  function filterAndPaginate(data, search, page, showLimit = null) {
    const filtered = data.filter(obj => {
      if (!search) return true;
      const s = search.toLowerCase();
      return Object.values(obj).some(val =>
        val && val.toString().toLowerCase().includes(s)
      );
    });
    let limit = page * PAGE_SIZE;
    if (showLimit && page === 1) limit = showLimit;
    const hasMore = filtered.length > limit;
    return { data: filtered.slice(0, limit), hasMore };
  }

  // Reset page à chaque recherche
  const handleSearchUser = text => { setSearchUser(text); setUserPage(1); };
  const handleSearchClub = text => { setSearchClub(text); setClubPage(1); };
  const handleSearchGame = text => { setSearchGame(text); setGamePage(1); };

  const usersFiltered = filterAndPaginate(users, searchUser, userPage, SHOW_LIMIT);
  const clubsFiltered = filterAndPaginate(clubs, searchClub, clubPage, SHOW_LIMIT);
  const gamesFiltered = filterAndPaginate(games, searchGame, gamePage, SHOW_LIMIT);

  // Suppression
  const handleDelete = async (type, id) => {
    Alert.alert("Confirmation", `Supprimer ce ${type} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer", style: "destructive", onPress: async () => {
          try {
            if (type === 'utilisateur') setUsers(u => u.filter(x => x.id !== id)) && await deleteUser(id);
            if (type === 'club') setClubs(c => c.filter(x => x.id !== id)) && await deleteClub(id);
            if (type === 'match') setGames(g => g.filter(x => x.id !== id)) && await deleteGame(id);
            setModal({ type: null, item: null });
          } catch {
            Alert.alert("Erreur", "Suppression impossible");
          }
        }
      }
    ]);
  };

  // Edition
  const openEditModal = (type, item) => { setModal({ type, item }); setEditValues(item); };
  const handleSaveEdit = async () => {
    try {
      if (modal.type === 'user') {
        const res = await updateUser(editValues.id, editValues);
        setUsers(u => u.map(x => x.id === res.id ? res : x));
      }
      if (modal.type === 'club') {
        const res = await updateClub(editValues.id, editValues);
        setClubs(c => c.map(x => x.id === res.id ? res : c));
      }
      if (modal.type === 'game') {
        const res = await updateGame(editValues.id, editValues);
        setGames(g => g.map(x => x.id === res.id ? res : g));
      }
      setModal({ type: null, item: null });
    } catch {
      Alert.alert("Erreur", "Modification impossible");
    }
  };

  // Bloc section réutilisable
  function SectionBlock({ title, searchValue, onChangeSearch, data, renderItem, onSeeMore, hasMore }) {
    return (
        <View style={styles.sectionWrapper}>
        <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {/* SEARCHBAR placée ici, EN DEHORS de la liste */}
        <TextInput
            style={styles.searchBar}
            placeholder="Rechercher..."
            placeholderTextColor="#ccc"
            value={searchValue}
            onChangeText={onChangeSearch}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
        />
        {/* LISTE FILTRÉE */}
        {data.length === 0 ? (
            <Text style={styles.emptyTxt}>Aucune donnée.</Text>
        ) : (
            data.map(renderItem)
        )}
        {hasMore && (
            <TouchableOpacity style={styles.seeMoreBtn} onPress={onSeeMore}>
            <Text style={styles.seeMoreText}>Voir plus</Text>
            </TouchableOpacity>
        )}
        </View>
    );
}



  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  // --- Onglets ---
  function renderTab() {
    if (activeTab === 'users') {
      return (
        <SectionBlock
          title="Utilisateurs"
          searchValue={searchUser}
          onChangeSearch={handleSearchUser}
          data={usersFiltered.data}
          hasMore={usersFiltered.hasMore}
          onSeeMore={() => setUserPage(p => p + 1)}
          renderItem={u => (
            <TouchableOpacity
              key={u.id}
              style={styles.card}
              onPress={() => openEditModal('user', u)}
              disabled={u.id === userInfo.id}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{u.username || u.email}</Text>
                <Text style={styles.cardSub}>{u.email}</Text>
                <Text style={styles.cardRole}>{u.role || (u.roles ? u.roles.join(', ') : '')}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete('utilisateur', u.id)}
                disabled={u.id === userInfo.id}
              >
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      );
    }
    if (activeTab === 'clubs') {
      return (
        <SectionBlock
          title="Clubs"
          searchValue={searchClub}
          onChangeSearch={handleSearchClub}
          data={clubsFiltered.data}
          hasMore={clubsFiltered.hasMore}
          onSeeMore={() => setClubPage(p => p + 1)}
          renderItem={c => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => openEditModal('club', c)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{c.name}</Text>
                <Text style={styles.cardSub}>{c.createdAt ? `Créé le ${c.createdAt.slice(0, 10)}` : ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete('club', c.id)}
              >
                <Text style={styles.deleteBtnText}>Supprimer</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      );
    }
    return (
      <SectionBlock
        title="Matchs"
        searchValue={searchGame}
        onChangeSearch={handleSearchGame}
        data={gamesFiltered.data}
        hasMore={gamesFiltered.hasMore}
        onSeeMore={() => setGamePage(p => p + 1)}
        renderItem={m => (
          <TouchableOpacity
            key={m.id}
            style={styles.card}
            onPress={() => openEditModal('game', m)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{m.location || 'Lieu inconnu'}</Text>
              <Text style={styles.cardSub}>{m.date ? m.date.slice(0, 16).replace('T', ' ') : ''}</Text>
              <Text style={styles.cardRole}>Statut : {m.status || '-'}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete('match', m.id)}
            >
              <Text style={styles.deleteBtnText}>Supprimer</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      {/* Bouton retour */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginTop: 50, marginLeft: 10, marginBottom: 12 }}
      >
        <Text style={{ color: '#00D9FF', fontSize: 18, fontWeight: 'bold' }}>← Retour</Text>
      </TouchableOpacity>

      {/* Onglets */}
      <View style={styles.tabRow}>
        {[
          { key: 'users', label: 'Utilisateurs' },
          { key: 'clubs', label: 'Clubs' },
          { key: 'games', label: 'Matchs' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 44 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Espace Administrateur</Text>
        {renderTab()}
      </ScrollView>

      {/* Modal édition */}
      <Modal visible={!!modal.type} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Modifier {modal.type === 'user' ? "l'utilisateur" : modal.type === 'club' ? 'le club' : 'le match'}
            </Text>
            {modal.type === 'user' && (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={editValues.username || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, username: v }))}
                  placeholder="Pseudo"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.modalInput}
                  value={editValues.email || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, email: v }))}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.modalInput}
                  value={editValues.role || (editValues.roles ? editValues.roles.join(',') : '')}
                  onChangeText={v => setEditValues(e => ({
                    ...e,
                    role: v,
                    roles: v.split(',').map(str => str.trim())
                  }))}
                  placeholder="Roles (ex: ROLE_USER, ROLE_ADMIN)"
                  placeholderTextColor="#aaa"
                />
              </>
            )}
            {modal.type === 'club' && (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={editValues.name || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, name: v }))}
                  placeholder="Nom du club"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.modalInput}
                  value={editValues.description || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, description: v }))}
                  placeholder="Description"
                  placeholderTextColor="#aaa"
                />
              </>
            )}
            {modal.type === 'game' && (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={editValues.location || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, location: v }))}
                  placeholder="Lieu"
                  placeholderTextColor="#aaa"
                />
                <TextInput
                  style={styles.modalInput}
                  value={editValues.status || ''}
                  onChangeText={v => setEditValues(e => ({ ...e, status: v }))}
                  placeholder="Statut (ex: ouvert, fermé, annulé)"
                  placeholderTextColor="#aaa"
                />
              </>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModal({ type: null, item: null })}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ marginTop: 18, alignSelf: 'center' }}
              onPress={() => handleDelete(
                modal.type === 'user' ? 'utilisateur' : modal.type === 'club' ? 'club' : 'match',
                editValues.id
              )}
            >
              <Text style={{ color: '#E33232', fontWeight: 'bold', fontSize: 16 }}>Supprimer définitivement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    letterSpacing: 1.1,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 3,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161825',
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 3,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#00D9FF',
  },
  tabBtnText: {
    color: '#bbb',
    fontWeight: 'bold',
    fontSize: 17,
  },
  tabBtnTextActive: {
    color: '#003249',
  },
  sectionWrapper: {
    backgroundColor: '#191B2B',
    borderRadius: 18,
    marginBottom: 22,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 9,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 3,
  },
  sectionTitleBar: {
    width: 7,
    height: 28,
    backgroundColor: '#00D9FF',
    borderRadius: 3,
    marginRight: 13,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1,
    textShadowColor: '#232346',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchBar: {
    backgroundColor: '#23284a',
    color: '#fff',
    borderRadius: 9,
    fontSize: 15,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginBottom: 8,
    marginTop: 2,
  },
  emptyTxt: {
    color: '#999',
    fontSize: 15,
    marginVertical: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23284a',
    borderRadius: 15,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17.5,
    marginBottom: 2,
    letterSpacing: 0.6,
  },
  cardSub: {
    color: '#bbb',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 1,
  },
  cardRole: {
    color: '#13D76F',
    fontSize: 14.5,
    fontWeight: '700',
    marginTop: 1,
    marginBottom: 1,
  },
  deleteBtn: {
    backgroundColor: '#E33232',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginLeft: 17,
    alignItems: 'center',
    alignSelf: 'flex-end',
    elevation: 2,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14.7,
    letterSpacing: 0.5,
  },
  seeMoreBtn: {
    alignSelf: 'center',
    marginTop: 7,
    marginBottom: 3,
    backgroundColor: '#00D9FF',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 28,
  },
  seeMoreText: {
    color: '#003249',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#242640',
    borderRadius: 18,
    padding: 24,
    minWidth: 285,
    maxWidth: 350,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#222C44',
    color: '#fff',
    fontSize: 15,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#00D9FF44',
  },
  modalSaveBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 90,
  },
  modalSaveText: {
    color: '#003249',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelBtn: {
    backgroundColor: '#bbb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 90,
  },
  modalCancelText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
