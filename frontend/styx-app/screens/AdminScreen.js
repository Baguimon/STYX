import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  Alert, Modal, TextInput, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import RNPickerSelect from 'react-native-picker-select';
import {
  getUsers, getClubs, getGames,
  deleteUser, deleteClub, deleteGame,
  updateUser, updateClub, updateGame,
  getClubMembers, setUserPoste, getGameById, kickMember
} from '../services/api';

const PAGE_SIZE = 20;
const SHOW_LIMIT = 5;

const CLUB_LOGOS = [
  { uri: '/assets/club-imgs/ecusson-1.png', label: 'Logo 1', img: require('../assets/club-imgs/ecusson-1.png') },
  { uri: '/assets/club-imgs/ecusson-2.png', label: 'Logo 2', img: require('../assets/club-imgs/ecusson-2.png') },
  { uri: '/assets/club-imgs/ecusson-3.png', label: 'Logo 3', img: require('../assets/club-imgs/ecusson-3.png') },
];

const POSTES_11 = [
  { key: 'GB', label: 'GB' }, { key: 'DG', label: 'DG' }, { key: 'DC1', label: 'DC1' }, { key: 'DC2', label: 'DC2' }, { key: 'DD', label: 'DD' },
  { key: 'MG', label: 'MG' }, { key: 'MC', label: 'MC' }, { key: 'MD', label: 'MD' }, { key: 'AG', label: 'AG' }, { key: 'BU', label: 'BU' }, { key: 'AD', label: 'AD' }, { key: 'REMPLACANT', label: 'REMPLACANT' },
];

const LEVELS = [
  { label: 'Débutant', value: 'Débutant' },
  { label: 'Intermédiaire', value: 'Intermédiaire' },
  { label: 'Confirmé', value: 'Confirmé' },
  { label: 'Expert', value: 'Expert' },
];
const ROLES = [
  { label: 'Utilisateur', value: 'ROLE_USER' },
  { label: 'Admin', value: 'ROLE_ADMIN' },
];

export default function AdminScreen() {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [games, setGames] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchClub, setSearchClub] = useState('');
  const [searchGame, setSearchGame] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [clubPage, setClubPage] = useState(1);
  const [gamePage, setGamePage] = useState(1);
  const [modal, setModal] = useState({ type: null, item: null });
  const [editValues, setEditValues] = useState({});
  const [clubMembers, setClubMembers] = useState([]);
  const [captainId, setCaptainId] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);

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

  useEffect(() => {
    if (modal.type === 'club' && editValues?.id) {
      getClubMembers(editValues.id).then(members => {
        setClubMembers(members);
        setCaptainId(editValues.clubCaptain?.id || editValues.clubCaptain);
      }).catch(() => setClubMembers([]));
    }
  }, [modal, editValues]);

  useEffect(() => {
    if (modal.type === 'game' && editValues?.id) {
      getGameById(editValues.id).then(setGameDetails).catch(() => setGameDetails(null));
    }
  }, [modal, editValues]);

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

  const handleSearchUser = text => { setSearchUser(text); setUserPage(1); };
  const handleSearchClub = text => { setSearchClub(text); setClubPage(1); };
  const handleSearchGame = text => { setSearchGame(text); setGamePage(1); };

  const usersFiltered = filterAndPaginate(users, searchUser, userPage, SHOW_LIMIT);
  const clubsFiltered = filterAndPaginate(clubs, searchClub, clubPage, SHOW_LIMIT);
  const gamesFiltered = filterAndPaginate(games, searchGame, gamePage, SHOW_LIMIT);

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

  const openEditModal = (type, item) => { setModal({ type, item }); setEditValues(item); };

  const handleSaveEdit = async () => {
    try {
      if (modal.type === 'user') {
        const payload = { ...editValues };
        if (!payload.newPassword) delete payload.newPassword;
        else payload.password = payload.newPassword;
        delete payload.newPassword;
        if (payload.club && payload.club.id) payload.club = payload.club.id;
        else if (payload.club === null) payload.club = null;
        if (payload.role) delete payload.role;
        const res = await updateUser(editValues.id, payload);
        setUsers(u => u.map(x => x.id === res.id ? res : x));
      }
      else if (modal.type === 'club') {
        const payload = {
          ...editValues,
          clubCaptain: captainId,
          image: editValues.image,
        };
        const res = await updateClub(editValues.id, payload);
        setClubs(c => c.map(x => x.id === res.id ? res : x));
      }
      else if (modal.type === 'game') {
        const payload = { ...editValues };
        if (payload.date && typeof payload.date === "string" && !payload.date.endsWith("Z")) {
          payload.date = new Date(payload.date).toISOString();
        }
        const res = await updateGame(editValues.id, payload);
        setGames(g => g.map(x => x.id === res.id ? res : x));
      }
      setModal({ type: null, item: null });
    } catch {
      Alert.alert("Erreur", "Modification impossible");
    }
  };

  // CLUB: gestion capitaine
  const handleSelectCaptain = (user) => setCaptainId(user.id);

  // CLUB: gestion logo
  const handleSelectLogo = (logoUri) => setEditValues(e => ({ ...e, image: logoUri }));

  // CLUB: virer membre
  const handleKickMember = async (clubId, memberId) => {
    Alert.alert(
      "Exclure ce joueur du club ?",
      "Cette action est irréversible.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Virer',
          style: 'destructive',
          onPress: async () => {
            try {
              await kickMember(clubId, memberId);
              getClubMembers(clubId).then(setClubMembers);
            } catch (e) {
              Alert.alert('Erreur', "Impossible de virer le joueur.");
            }
          }
        }
      ]
    );
  };

  function SectionBlock({ title, searchValue, onChangeSearch, data, renderItem, onSeeMore, hasMore }) {
    return (
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionTitleBar} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
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
                <Text style={styles.cardSub}>
                  {u.club?.name ? `Club : ${u.club.name}` : u.clubName ? `Club : ${u.clubName}` : ''}
                </Text>
                <Text style={styles.cardRole}>
                  {u.poste ? `Poste : ${u.poste}` : 'Aucun poste'}
                </Text>
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
                <Text style={styles.cardRole}>
                  Capitaine : {c.clubCaptain?.username || c.clubCaptain?.email || '-'}
                </Text>
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
              <Text style={styles.cardSub}>Joueurs : {m.playerCount} / {m.maxPlayers}</Text>
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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginTop: 50, marginLeft: 10, marginBottom: 12 }}
      >
        <Text style={{ color: '#00D9FF', fontSize: 18, fontWeight: 'bold' }}>← Retour</Text>
      </TouchableOpacity>

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

      {/* MODAL - EDIT */}
      <Modal visible={!!modal.type} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 600 }}
            >
              <Text style={styles.modalTitle}>
                Modifier {modal.type === 'user' ? "l'utilisateur" : modal.type === 'club' ? 'le club' : 'le match'}
              </Text>
              {/* === USER === */}
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
                    keyboardType="email-address"
                  />
                  <Text style={{ color: "#fff", marginBottom: 3, fontWeight: 'bold' }}>Niveau :</Text>
                  <RNPickerSelect
                    onValueChange={v => setEditValues(e => ({ ...e, level: v }))}
                    items={LEVELS}
                    value={editValues.level || ''}
                    style={{
                      inputIOS: { color: '#fff', backgroundColor: '#222C44', padding: 10, borderRadius: 8, marginBottom: 12 },
                      inputAndroid: { color: '#fff', backgroundColor: '#222C44', padding: 10, borderRadius: 8, marginBottom: 12 },
                      placeholder: { color: '#aaa' }
                    }}
                    placeholder={{ label: 'Choisis un niveau', value: null }}
                  />
                  {/* Poste */}
                  <View style={styles.posteBlock}>
                    <Text style={{ color: "#fff", fontWeight: 'bold', marginBottom: 5 }}>Poste :</Text>
                    <View style={styles.posteBtnsRow}>
                      {POSTES_11.map(p => (
                        <TouchableOpacity
                          key={p.key}
                          style={[
                            styles.posteBtn,
                            editValues.poste === p.key && styles.selectedPosteBtn
                          ]}
                          onPress={() => setEditValues(e => ({ ...e, poste: p.key }))}
                        >
                          <Text
                            style={[
                              styles.posteBtnText,
                              editValues.poste === p.key && styles.selectedPosteBtnText
                            ]}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[
                          styles.posteBtn,
                          !editValues.poste && styles.selectedPosteBtn,
                          { backgroundColor: '#c73030', borderColor: '#c73030' }
                        ]}
                        onPress={() => setEditValues(e => ({ ...e, poste: null }))}
                      >
                        <Text style={styles.posteBtnText}>Aucun</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Roles */}
                  <View style={{ marginBottom: 13 }}>
                    <Text style={{ color: "#fff", fontWeight: 'bold', marginBottom: 3 }}>Rôles :</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {ROLES.map(role => {
                        const hasRole = (editValues.roles || []).includes(role.value);
                        return (
                          <TouchableOpacity
                            key={role.value}
                            onPress={() => {
                              setEditValues(e => {
                                let nextRoles = [...(e.roles || [])];
                                if (hasRole) {
                                  nextRoles = nextRoles.filter(r => r !== role.value);
                                } else {
                                  nextRoles.push(role.value);
                                }
                                return { ...e, roles: nextRoles };
                              });
                            }}
                            style={{
                              backgroundColor: hasRole ? "#00D9FF" : "#23284a",
                              padding: 8,
                              borderRadius: 8,
                              marginRight: 7,
                              marginBottom: 5,
                            }}
                          >
                            <Text style={{ color: hasRole ? "#003249" : "#fff" }}>{role.label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  {/* Club (sélecteur rapide avec logos) */}
                  <View style={{ marginBottom: 11 }}>
                    <Text style={{ color: "#fff", marginBottom: 3, fontWeight: 'bold' }}>Club :</Text>
                    <ScrollView horizontal style={{ flexDirection: 'row', marginBottom: 5 }}>
                      {clubs.map(club => {
                        const clubLogo = CLUB_LOGOS.find(l => l.uri === club.image);
                        return (
                          <TouchableOpacity
                            key={club.id}
                            style={{
                              backgroundColor: editValues.club?.id === club.id ? "#00D9FF" : "#23284a",
                              borderRadius: 9,
                              marginRight: 8,
                              padding: 6,
                              alignItems: 'center'
                            }}
                            onPress={() => setEditValues(e => ({ ...e, club }))}
                          >
                            {clubLogo &&
                              <Image
                                source={clubLogo.img}
                                style={{ width: 36, height: 36, marginBottom: 1, borderRadius: 19, backgroundColor: "#fff" }}
                                resizeMode="contain"
                              />}
                            <Text style={{
                              color: editValues.club?.id === club.id ? "#003249" : "#fff",
                              fontSize: 13,
                              fontWeight: 'bold'
                            }}>
                              {club.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        style={{
                          backgroundColor: !editValues.club ? "#00D9FF" : "#23284a",
                          padding: 6, borderRadius: 9, alignItems: 'center'
                        }}
                        onPress={() => setEditValues(e => ({ ...e, club: null }))}
                      >
                        <Text style={{ color: !editValues.club ? "#003249" : "#fff", fontWeight: 'bold', fontSize: 13 }}>Aucun</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                  {/* Nouveau mot de passe */}
                  <TextInput
                    style={styles.modalInput}
                    value={editValues.newPassword || ''}
                    onChangeText={v => setEditValues(e => ({ ...e, newPassword: v }))}
                    placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                  />
                </>
              )}

              {/* === CLUB === */}
              {modal.type === 'club' && (
                <>
                  <TextInput
                    style={styles.modalInput}
                    value={editValues.name || ''}
                    onChangeText={v => setEditValues(e => ({ ...e, name: v }))}
                    placeholder="Nom du club"
                    placeholderTextColor="#aaa"
                  />
                  {/* Logo club */}
                  <Text style={{ color: "#fff", fontWeight: 'bold', marginBottom: 5 }}>Logo :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 8 }}>
                    {CLUB_LOGOS.map(logo => (
                      <TouchableOpacity
                        key={logo.uri}
                        style={{
                          backgroundColor: editValues.image === logo.uri ? "#00D9FF" : "#23284a",
                          borderRadius: 12, marginRight: 8, padding: 5, alignItems: 'center'
                        }}
                        onPress={() => handleSelectLogo(logo.uri)}
                      >
                        <Image
                          source={logo.img}
                          style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#fff", marginBottom: 2 }}
                          resizeMode="contain"
                        />
                        <Text style={{
                          color: editValues.image === logo.uri ? "#003249" : "#fff",
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>{logo.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {/* Capitaine */}
                  <Text style={{ color: "#fff", fontWeight: 'bold', marginBottom: 4 }}>Capitaine :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 12 }}>
                    {clubMembers.map(member => (
                      <TouchableOpacity
                        key={member.id}
                        style={{
                          backgroundColor: captainId === member.id ? "#00D9FF" : "#23284a",
                          borderRadius: 9,
                          paddingVertical: 8, paddingHorizontal: 10, marginRight: 8,
                          flexDirection: 'row', alignItems: 'center'
                        }}
                        onPress={() => handleSelectCaptain(member)}
                      >
                        <Text style={{ color: captainId === member.id ? "#003249" : "#fff", fontWeight: 'bold', fontSize: 13 }}>
                          {member.username || member.email}
                        </Text>
                        {captainId === member.id && <Text style={{ marginLeft: 4, fontSize: 16 }}>⭐</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {/* Membres du club (avec bouton virer) */}
                  <Text style={{ color: "#fff", fontWeight: 'bold', marginBottom: 4 }}>Membres :</Text>
                  {clubMembers.length === 0 ? (
                    <Text style={{ color: '#aaa', marginBottom: 5 }}>Aucun membre.</Text>
                  ) : (
                    clubMembers.map(member => (
                      <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ color: '#fff', flex: 1 }}>
                          {member.username || member.email}
                          {captainId === member.id && " (Capitaine)"}
                        </Text>
                        <TouchableOpacity
                          style={{ backgroundColor: '#E33232', paddingVertical: 5, paddingHorizontal: 11, borderRadius: 8, marginLeft: 9 }}
                          onPress={() => handleKickMember(editValues.id, member.id)}
                          disabled={captainId === member.id}
                        >
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            Virer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </>
              )}

              {/* === MATCH (GAME) === */}
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
                    value={editValues.locationDetails || ''}
                    onChangeText={v => setEditValues(e => ({ ...e, locationDetails: v }))}
                    placeholder="Détails du lieu (optionnel)"
                    placeholderTextColor="#aaa"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editValues.status || ''}
                    onChangeText={v => setEditValues(e => ({ ...e, status: v }))}
                    placeholder="Statut (ex: ouvert, fermé, annulé)"
                    placeholderTextColor="#aaa"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editValues.maxPlayers ? String(editValues.maxPlayers) : ''}
                    onChangeText={v => setEditValues(e => ({ ...e, maxPlayers: parseInt(v) || 0 }))}
                    placeholder="Max joueurs"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editValues.date || ''}
                    onChangeText={v => setEditValues(e => ({ ...e, date: v }))}
                    placeholder="Date et heure (ex: 2025-08-19T18:30)"
                    placeholderTextColor="#aaa"
                  />
                  {/* Liste joueurs inscrits */}
                  <View style={{ marginTop: 11, marginBottom: 4 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>
                      Joueurs inscrits :
                    </Text>
                    {Array.isArray(gameDetails?.gamePlayers) && gameDetails.gamePlayers.length > 0 ? (
                      gameDetails.gamePlayers.map(gp => (
                        <View key={gp.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                          <Text style={{ color: "#fff" }}>
                            {gp.user?.username || gp.user?.email || 'Utilisateur inconnu'}
                            {gp.team != null && `  (équipe ${gp.team})`}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: "#aaa" }}>Aucun joueur inscrit.</Text>
                    )}
                  </View>
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
            </ScrollView>
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
    maxWidth: 370,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 5,
    maxHeight: '87%',
    width: '98%',
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
  // === Styles pour le bloc de postes (sélecteur boutons) ===
  posteBlock: {
    marginBottom: 11,
    width: '100%',
  },
  posteBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 3,
  },
  posteBtn: {
    backgroundColor: '#23284a',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 4,
    marginBottom: 6,
  },
  selectedPosteBtn: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  posteBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  selectedPosteBtnText: {
    color: '#181818'
  },
});
