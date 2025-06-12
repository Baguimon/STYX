  import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
  import { useFocusEffect, useNavigation } from '@react-navigation/native';
  import {
    View, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView,
    Alert, Share, RefreshControl, TextInput, KeyboardAvoidingView, Platform
  } from 'react-native';
  import {
    getClub, getClubMembers, setUserPoste, leaveClub,
    getClubMessages, sendClubMessage, deleteClubMessage
  } from '../services/api';
  import { AuthContext } from '../contexts/AuthContext';
  import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

  const defaultClubImage = require('../assets/club-default.png');
  const defaultPlayerImage = require('../assets/player-default.png');
  const FIELD_IMAGE = require('../assets/field-club.jpg');

  const CLUB_LOGO_CHOICES = [
    { uri: '/assets/club-imgs/ecusson-1.png', img: require('../assets/club-imgs/ecusson-1.png') },
    { uri: '/assets/club-imgs/ecusson-2.png', img: require('../assets/club-imgs/ecusson-2.png') },
    { uri: '/assets/club-imgs/ecusson-3.png', img: require('../assets/club-imgs/ecusson-3.png') },
  ];
  function getClubLogoSource(image) {
    const found = CLUB_LOGO_CHOICES.find(c => c.uri === image);
    return found ? found.img : defaultClubImage;
  }

  const Y_OFFSET = -0.1;
  const POSTES_11 = [
    { key: 'GB', label: 'GB', x: 0.5, y: 0.94 + Y_OFFSET },
    { key: 'DG', label: 'DG', x: 0.15, y: 0.75 + Y_OFFSET },
    { key: 'DC1', label: 'DC', x: 0.32, y: 0.82 + Y_OFFSET },
    { key: 'DC2', label: 'DC', x: 0.68, y: 0.82 + Y_OFFSET },
    { key: 'DD', label: 'DD', x: 0.85, y: 0.75 + Y_OFFSET },
    { key: 'MG', label: 'MG', x: 0.21, y: 0.52 + Y_OFFSET },
    { key: 'MC', label: 'MC', x: 0.5, y: 0.64 + Y_OFFSET },
    { key: 'MD', label: 'MD', x: 0.79, y: 0.52 + Y_OFFSET },
    { key: 'AG', label: 'AG', x: 0.3, y: 0.25 + Y_OFFSET },
    { key: 'BU', label: 'BU', x: 0.5, y: 0.17 + Y_OFFSET },
    { key: 'AD', label: 'AD', x: 0.7, y: 0.25 + Y_OFFSET },
  ];

  export default function ClubDetailScreen({ route }) {
    const clubId = route?.params?.clubId;
    const [loading, setLoading] = useState(true);
    const [club, setClub] = useState(null);
    const [members, setMembers] = useState([]);
    const { userInfo } = useContext(AuthContext);
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    // Onglet sélectionné
    const [selectedTab, setSelectedTab] = useState('compo');

    // Chat club connecté à l'API
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const chatScrollRef = useRef();

    // States pour scroll-to-bottom button
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollDown, setShowScrollDown] = useState(false);

    // RESET STATE quand user change (pour corriger le bug de club “collant”)
    useEffect(() => {
      setClub(null);
      setMembers([]);
      setSelectedTab('compo');
      setChatMessages([]);
      setChatLoading(false);
      setChatInput('');
      setIsAtBottom(true);
      setShowScrollDown(false);
    }, [userInfo?.id]);

    // Récupère les messages du chat
    const fetchChat = useCallback(async () => {
      try {
        const msgs = await getClubMessages(clubId);
        setChatMessages(msgs);
      } catch {
        setChatMessages([]);
      }
    }, [clubId]);

    // Récupération automatique toutes les 2s quand l’onglet chat est affiché
    useEffect(() => {
      if (selectedTab === 'chat') {
        fetchChat();
        const interval = setInterval(fetchChat, 2000); // ← 2s
        return () => clearInterval(interval);
      }
    }, [selectedTab, fetchChat]);

    // Gère le scroll automatique UNIQUEMENT si l'utilisateur est déjà en bas
    useEffect(() => {
      if (selectedTab === 'chat' && isAtBottom && chatScrollRef.current) {
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollToEnd({ animated: true });
          }
        }, 200);
      }
    }, [chatMessages, selectedTab, isAtBottom]);

    // Si pas de club => NoClubScreen (évite bug du club “fantôme”)
    useEffect(() => {
      if (!loading && !club) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'NoClubScreen' }]
        });
      }
    }, [loading, club, navigation]);

    const handleSendMessage = async () => {
      if (chatInput.trim() === '') return;
      try {
        await sendClubMessage(clubId, { userId: userInfo.id, text: chatInput.trim() });
        setChatInput('');
        fetchChat();
      } catch {
        Alert.alert('Erreur', "Impossible d'envoyer le message");
      }
    };

    const handleDeleteMessage = async (msgId) => {
      Alert.alert(
        "Supprimer",
        "Voulez-vous supprimer ce message ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer", style: "destructive", onPress: async () => {
              try {
                await deleteClubMessage(clubId, msgId, userInfo.id);
                fetchChat();
              } catch {
                Alert.alert("Erreur", "Impossible de supprimer le message");
              }
            }
          }
        ]
      );
    };

    // Chargement club/membres
    const fetchClub = useCallback(async () => {
      setLoading(true);
      try {
        const [clubData, memberList] = await Promise.all([
          getClub(clubId),
          getClubMembers(clubId)
        ]);
        setClub(clubData);
        setMembers(memberList);
      } catch (err) {
        setClub(null);
        setMembers([]);
      }
      setLoading(false);
    }, [clubId]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await fetchClub();
      setRefreshing(false);
    }, [fetchClub]);

    useEffect(() => { fetchClub(); }, [fetchClub]);
    useFocusEffect(
      useCallback(() => {
        fetchClub();
      }, [fetchClub])
    );

    const captainId = club?.clubCaptain?.id || club?.clubCaptain;
    const sortedMembers = [...members].sort((a, b) => {
      if (a.id === captainId) return -1;
      if (b.id === captainId) return 1;
      return 0;
    });

    const getPlayerForPoste = (posteKey) =>
      members.find(u => u.poste === posteKey);

    const fieldMemberIds = POSTES_11.map(pos => getPlayerForPoste(pos.key)?.id).filter(Boolean);
    const remplacants = members.filter(m => m.poste === 'REMPLACANT');

    const handleSelectPoste = async (posteKey) => {
      if (!userInfo?.id) return;
      try {
        await setUserPoste(clubId, userInfo.id, posteKey);
        setMembers(prev =>
          prev.map(m =>
            m.id === userInfo.id
              ? { ...m, poste: posteKey }
              : (posteKey && posteKey !== 'REMPLACANT' && m.poste === posteKey ? { ...m, poste: null } : m)
          )
        );
      } catch (e) {
        if (e?.response?.data?.error === 'Poste déjà pris') {
          await setUserPoste(clubId, userInfo.id, 'REMPLACANT');
          setMembers(prev =>
            prev.map(m =>
              m.id === userInfo.id
                ? { ...m, poste: 'REMPLACANT' }
                : m
            )
          );
          Alert.alert("Poste occupé", "Ce poste est déjà pris. Tu as été placé en remplaçant.");
        } else {
          Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de prendre ce poste');
        }
      }
    };

    const inviteLocal = `exp://172.29.193.238:8081?clubId=${club?.id}`;
    const inviteTunnel = `exp://6vrrl3c-anonymous-8081.exp.direct?clubId=${club?.id}`;

    const handleShareInvite = async () => {
      try {
        await Share.share({
          message: `🚀 Rejoins mon club sur Styx !\n
    • Si tu es sur le même wifi que moi, ouvre ce lien :
    ${inviteLocal}

    • Sinon, utilise ce lien universel (tunnel) : 
    ${inviteTunnel}

    Ouvre-le avec Expo Go sur ton téléphone !
    (ou scanne le QR code de l’app, ou copie le lien)`,
        });
      } catch (error) {
        Alert.alert('Erreur', "Impossible d’ouvrir la fenêtre de partage");
      }
    };

    const handleLeave = async () => {
      Alert.alert(
        'Confirmation',
        'Es-tu sûr de vouloir quitter le club ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Oui, quitter',
            style: 'destructive',
            onPress: async () => {
              try {
                const userId = userInfo?.id;
                await leaveClub(userId);
                Alert.alert('Tu as quitté le club');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'NoClubScreen' }]
                });
              } catch (e) {
                Alert.alert('Erreur', "Impossible de quitter le club");
              }
            }
          },
        ],
        { cancelable: true }
      );
    };

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }}>
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      );
    }

    if (!club) {
      // Évite le “flicker” quand on n’a pas de club
      return null;
    }

    const isUserOnField = fieldMemberIds.includes(userInfo?.id);
    const isUserRemplacant = members.find(m => m.id === userInfo.id && m.poste === 'REMPLACANT');

    return (
      <View style={{ backgroundColor: '#111', flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.statsBlock}>
            <Text style={styles.statsLabel}>V-N-D</Text>
            <Text style={styles.statsValue}>
              {club.stats?.win ?? '-'}-{club.stats?.draw ?? '-'}-{club.stats?.lose ?? '-'}
            </Text>
          </View>
          <View style={styles.clubLogoWrapper}>
            <Image
              source={getClubLogoSource(club.image)}
              style={styles.clubImageZoomed}
              resizeMode="contain"
            />
          </View>
          <View style={styles.statsBlock}>
            <Text style={styles.statsLabel}>Joueurs</Text>
            <Text style={styles.statsValue}>{members.length || '-'}</Text>
          </View>
        </View>
        <Text style={styles.clubName}>{club.name}</Text>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={{ flex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00D9FF']}
                tintColor="#00D9FF"
              />
            }
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ padding: 16 }}>
              {/* Onglets */}
              <View style={styles.tabHeaderRow}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    selectedTab === 'compo' && styles.tabBtnActive,
                  ]}
                  onPress={() => setSelectedTab('compo')}
                >
                  <Text style={[
                    styles.tabBtnText,
                    selectedTab === 'compo' && styles.tabBtnTextActive
                  ]}>Composition</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    selectedTab === 'chat' && styles.tabBtnActive,
                  ]}
                  onPress={() => setSelectedTab('chat')}
                >
                  <Text style={[
                    styles.tabBtnText,
                    selectedTab === 'chat' && styles.tabBtnTextActive
                  ]}>Chat</Text>
                </TouchableOpacity>
              </View>

              {selectedTab === 'compo' ? (
                <>
                  {/* Composition terrain */}
                  <View style={styles.compoContainer}>
                    <Image
                      source={FIELD_IMAGE}
                      style={styles.terrainBackground}
                      resizeMode="cover"
                    />
                    <View style={styles.terrainOverlay} />
                    {POSTES_11.map(slot => {
                      const player = getPlayerForPoste(slot.key);
                      const isLibre = !player;
                      const isUser = player && player.id === userInfo?.id;
                      return (
                        <TouchableOpacity
                          key={slot.key}
                          style={[
                            styles.playerOnField,
                            {
                              left: `${slot.x * 100}%`,
                              top: `${slot.y * 100}%`,
                              marginLeft: -AVATAR_SIZE / 2,
                              marginTop: -AVATAR_SIZE / 2,
                              borderColor: isUser ? '#00D9FF' : 'transparent',
                              borderWidth: isUser ? 2 : 0,
                              zIndex: 2,
                            }
                          ]}
                          disabled={!isLibre && !isUser}
                          onPress={() => {
                            if (isLibre) {
                              handleSelectPoste(slot.key);
                            } else if (isUser) {
                              handleSelectPoste(null);
                            }
                          }}
                        >
                          <View style={{ position: 'relative' }}>
                            <Image
                              source={player?.image ? { uri: player.image } : defaultPlayerImage}
                              style={styles.playerAvatar}
                            />
                            {player && captainId && player.id === captainId && (
                              <FontAwesome5 name="crown" size={20} color="#FFD700" style={styles.captainCrownField} />
                            )}
                          </View>
                          <Text style={styles.playerOnFieldText}>{slot.label}</Text>
                          <View style={styles.playerNameTag}>
                            <Text
                              style={[
                                styles.playerNameOnField,
                                { color: isLibre ? '#fff' : '#00D9FF' }
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {isLibre ? 'Libre' : (player.username || player.nom)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Remplaçants */}
                  <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Remplaçants :</Text>
                  <View style={styles.remplacantsRow}>
                    <TouchableOpacity
                      style={[
                        styles.remplacantEmpty,
                        isUserRemplacant && { borderColor: '#00D9FF', borderWidth: 2 }
                      ]}
                      onPress={async () => {
                        try {
                          await setUserPoste(clubId, userInfo.id, isUserRemplacant ? null : 'REMPLACANT');
                          setMembers(prev =>
                            prev.map(m =>
                              m.id === userInfo.id
                                ? { ...m, poste: isUserRemplacant ? null : 'REMPLACANT' }
                                : m
                            )
                          );
                        } catch (e) {
                          Alert.alert('Erreur', "Vous êtes êtes déjà remplaçant");
                        }
                      }}
                    >
                      {isUserRemplacant ? (
                        <Text style={{ color: '#00D9FF', fontWeight: 'bold', fontSize: 20 }}>X</Text>
                      ) : (
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>+</Text>
                      )}
                    </TouchableOpacity>
                    {isUserRemplacant && (
                      <View style={[styles.remplacantEmpty, { borderColor: '#00D9FF', borderWidth: 2 }]}>
                        <Image
                          source={userInfo.image ? { uri: userInfo.image } : defaultPlayerImage}
                          style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#222' }}
                        />
                      </View>
                    )}
                    {remplacants
                      .filter(r => r.id !== userInfo?.id)
                      .map(r => (
                        <View key={r.id} style={styles.remplacantEmpty}>
                          <Image
                            source={r.image ? { uri: r.image } : defaultPlayerImage}
                            style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#222' }}
                          />
                        </View>
                      ))}
                  </View>
                </>
              ) : (
                // Onglet Chat CLUB connecté à l’API (avec scroll down, couleurs “moi” en noir)
                <View style={styles.chatContainer}>
                  <View style={{ flex: 1 }}>
                    <ScrollView
                      ref={chatScrollRef}
                      style={styles.chatMessages}
                      contentContainerStyle={{ paddingBottom: 12 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      onScroll={e => {
                        const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                        // Distance from bottom (en px)
                        const paddingToBottom = 10;
                        const isBottom =
                          layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

                        setIsAtBottom(isBottom);
                        setShowScrollDown(!isBottom);
                      }}
                      scrollEventThrottle={16}
                      onContentSizeChange={() => {
                        if (isAtBottom && chatScrollRef.current) {
                          chatScrollRef.current.scrollToEnd({ animated: true });
                        }
                      }}
                    >
                      {chatLoading ? (
                        <ActivityIndicator color="#00D9FF" />
                      ) : chatMessages.length === 0 ? (
                        <Text style={{ color: "#aaa", marginBottom: 14 }}>Aucun message pour l’instant…</Text>
                      ) : (
                        chatMessages.map(msg => {
                          const isMine = msg.user.id === userInfo.id;
                          const isCaptain = userInfo.id === captainId;
                          return (
                            <View
                              key={msg.id}
                              style={[
                                styles.chatMsgBubble,
                                isMine ? styles.myChatMsg : styles.otherChatMsg,
                              ]}
                            >
                              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                                <Text style={[
                                  styles.chatMsgUser,
                                  isMine && { color: '#111' } // Pseudo noir pour toi
                                ]}>
                                  {msg.user.username} :
                                </Text>
                                <Text style={{
                                  color: isMine ? "#111" : "#aaa", // Date noire pour toi
                                  marginLeft: 6,
                                  fontSize: 11,
                                }}>
                                  {msg.createdAt.slice(11, 16)}
                                </Text>
                                {(isMine || isCaptain) && (
                                  <TouchableOpacity
                                    style={{ marginLeft: 12 }}
                                    onPress={() => handleDeleteMessage(msg.id)}
                                  >
                                    <Ionicons name="trash" size={16} color="#E33232" />
                                  </TouchableOpacity>
                                )}
                              </View>
                              <Text style={styles.chatMsgText}>{msg.text}</Text>
                            </View>
                          );
                        })
                      )}
                    </ScrollView>
                    {showScrollDown && (
                      <TouchableOpacity
                        style={styles.scrollToBottomBtn}
                        onPress={() => {
                          if (chatScrollRef.current) {
                            chatScrollRef.current.scrollToEnd({ animated: true });
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="arrow-down" size={22} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.chatInputRow}>
                    <TextInput
                      style={styles.chatInput}
                      value={chatInput}
                      onChangeText={setChatInput}
                      placeholder="Écris un message…"
                      placeholderTextColor="#aaa"
                      onSubmitEditing={handleSendMessage}
                      returnKeyType="send"
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity
                      style={styles.chatSendBtn}
                      onPress={handleSendMessage}
                      disabled={chatInput.trim() === ''}
                    >
                      <Text style={styles.chatSendBtnText}>Envoyer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* LISTE JOUEURS : visible uniquement en compo */}
              {selectedTab === 'compo' && (
                <>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionTitleBar} />
                    <Text style={styles.sectionTitle}>Joueurs</Text>
                    <TouchableOpacity
                      style={styles.inviteBtn}
                      onPress={handleShareInvite}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="person-add" size={18} color="#00D9FF" style={{ marginRight: 5 }} />
                      <Text style={styles.inviteBtnText}>Inviter</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    {sortedMembers.map(item => (
                      <View key={item.id} style={styles.playerCard}>
                        <View style={{ position: 'relative', width: 45, height: 45, marginRight: 16 }}>
                          <Image
                            source={item.image ? { uri: item.image } : defaultPlayerImage}
                            style={styles.playerListAvatar}
                          />
                          {item.id === captainId && (
                            <FontAwesome5 name="crown" size={18} color="#FFD700" style={styles.captainCrownList} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.playerName}>{item.username || item.nom}</Text>
                          <Text style={styles.playerPosteList}>
                            Poste : {item.poste ? item.poste : 'Aucun'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.profileBtn}
                          onPress={() => navigation.navigate('PlayerProfile', { playerId: item.id })}
                        >
                          <Text style={styles.profileBtnText}>Profil</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={styles.actionBar}>
                    {userInfo.id === captainId && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('ClubManageScreen', { club, members })}
                      >
                        <Text style={styles.actionBtnText}>Gérer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                    <Text style={styles.leaveBtnText}>Quitter le club</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }


  const AVATAR_SIZE = 50;
  const styles = StyleSheet.create({
    header: {
      backgroundColor: '#181818',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 40,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    clubLogoWrapper: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: '#fff',
      backgroundColor: '#333',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    clubImageZoomed: {
      width: 120,
      height: 120,
    },
    statsBlock: {
      alignItems: 'center',
    },
    statsLabel: {
      color: '#82E482',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 3,
    },
    statsValue: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 20,
      letterSpacing: 1,
    },
    clubName: {
      textAlign: 'center',
      color: '#fff',
      fontSize: 28,
      fontWeight: 'bold',
      marginVertical: 10,
      letterSpacing: 1,
    },
    sectionTitle: {
      color: '#00D9FF',
      fontWeight: '700',
      fontSize: 19,
      marginVertical: 10,
      letterSpacing: 1,
      textAlign: 'left',
    },
    compoContainer: {
      width: '100%',
      aspectRatio: 0.8,
      borderRadius: 20,
      overflow: 'hidden',
      alignSelf: 'center',
      marginVertical: 16,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111',
    },
    terrainBackground: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.85,
    },
    terrainOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.38)',
      zIndex: 1,
    },
    playerOnField: {
      position: 'absolute',
      alignItems: 'center',
      width: AVATAR_SIZE,
      height: AVATAR_SIZE + 36,
      justifyContent: 'flex-start',
      backgroundColor: 'transparent',
      zIndex: 2,
    },
    playerAvatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: '#fff',
      backgroundColor: 'transparent',
      marginBottom: 2,
    },
    // COURONNE CAPITAINE terrain
    captainCrownField: {
      position: 'absolute',
      top: -7,
      right: -2,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
    // COURONNE CAPITAINE liste
    captainCrownList: {
      position: 'absolute',
      bottom: -5,
      right: -7,
      zIndex: 10,
      backgroundColor: 'transparent',
    },
    playerOnFieldText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 12,
      textAlign: 'center',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      letterSpacing: 0.7,
      backgroundColor: 'rgba(0,0,0,0.38)',
      borderRadius: 5,
      overflow: 'hidden',
      paddingHorizontal: 4,
      paddingVertical: 0.5,
      minWidth: 22,
      alignSelf: 'center',
      marginBottom: 1,
      maxWidth: AVATAR_SIZE * 1.3,
    },
    playerNameTag: {
      backgroundColor: 'rgba(0,0,0,0.63)',
      borderRadius: 6,
      paddingVertical: 1.5,
      paddingHorizontal: 5,
      marginTop: 2,
      alignSelf: 'center',
      maxWidth: AVATAR_SIZE * 1.4,
      minWidth: 30,
    },
    playerNameOnField: {
      fontSize: 12.5,
      fontWeight: 'bold',
      textAlign: 'center',
      textShadowColor: '#000',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      letterSpacing: 0.1,
      flexShrink: 1,
      includeFontPadding: false,
      numberOfLines: 1,
    },
    remplacantsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      marginTop: 5,
      gap: 5,
      justifyContent: 'flex-start',
    },
    remplacantEmpty: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#fff',
      marginRight: 5,
      backgroundColor: '#444',
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerCard: {
      width: '96%',
      backgroundColor: '#242640',
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 10,
      shadowColor: '#111',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 2,
    },
    playerListAvatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      marginRight: 16,
      borderWidth: 1.5,
      borderColor: '#00D9FF',
      backgroundColor: '#222',
    },
    playerName: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    playerPosteList: {
      color: '#A9A9A9',
      fontSize: 13,
      fontWeight: '500',
    },
    profileBtn: {
      backgroundColor: '#00D9FF',
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 18,
      marginLeft: 10,
    },
    profileBtnText: {
      color: '#050A23',
      fontWeight: '700',
      fontSize: 13,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 14,
      marginBottom: 6,
    },
    inviteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
      backgroundColor: 'rgba(0,217,255,0.13)',
      paddingHorizontal: 13,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#00D9FF',
    },
    inviteBtnText: {
      color: '#00D9FF',
      fontWeight: 'bold',
      fontSize: 14.7,
      letterSpacing: 0.4,
    },
    sectionTitleBar: {
      width: 7,
      height: 28,
      backgroundColor: '#00D9FF',
      borderRadius: 3,
      marginRight: 12,
    },
    sectionTitle: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 23,
      letterSpacing: 1,
      textShadowColor: '#232346',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      marginTop: 18,
      marginBottom: 6,
    },
    actionBtn: {
      backgroundColor: '#00D9FF',
      borderRadius: 18,
      paddingVertical: 13,
      paddingHorizontal: 30,
      alignItems: 'center',
      marginHorizontal: 4,
      minWidth: 100,
    },
    actionBtnText: {
      color: '#050A23',
      fontWeight: 'bold',
      fontSize: 16.5,
      letterSpacing: 0.5,
    },
    leaveBtn: {
      marginTop: 6,
      marginBottom: 24,
      backgroundColor: '#E33232',
      borderRadius: 18,
      paddingVertical: 13,
      paddingHorizontal: 38,
      alignItems: 'center',
      alignSelf: 'center',
      shadowColor: '#E33232',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
    },
    leaveBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16.5,
      letterSpacing: 0.7,
    },
      tabHeaderRow: {
      flexDirection: 'row',
      alignSelf: 'center',
      backgroundColor: '#23284a',
      borderRadius: 15,
      marginBottom: 13,
      marginTop: 6,
      overflow: 'hidden',
    },
    tabBtn: {
      paddingVertical: 8,
      paddingHorizontal: 28,
      backgroundColor: '#23284a',
    },
    tabBtnActive: {
      backgroundColor: '#00D9FF',
    },
    tabBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    tabBtnTextActive: {
      color: '#003249',
    },
    chatContainer: {
      backgroundColor: '#1B2232',
      borderRadius: 18,
      padding: 16,
      alignItems: 'stretch',
      marginHorizontal: 4,
      minHeight: 450,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOpacity: 0.13,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 10,
      elevation: 3,
    },
    chatMessages: {
      minHeight: 90,
      maxHeight: 430,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: '#202849',
      padding: 10,
    },
    chatMsgBubble: {
      paddingVertical: 11,
      paddingHorizontal: 17,
      borderRadius: 18,
      marginBottom: 10,
      maxWidth: '84%',
      alignSelf: 'flex-start',
      backgroundColor: '#23284a',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    myChatMsg: {
      backgroundColor: '#00D9FFCC',
      alignSelf: 'flex-end',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 26,
      borderTopLeftRadius: 22,
      borderBottomLeftRadius: 22,
    },
    otherChatMsg: {
      backgroundColor: '#222842',
      alignSelf: 'flex-start',
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 26,
      borderTopRightRadius: 22,
      borderBottomRightRadius: 22,
    },
    chatMsgUser: {
      color: '#00D9FF',
      fontWeight: '700',
      marginBottom: 2,
      fontSize: 13,
      opacity: 0.92,
    },
    chatMsgText: {
      color: '#fff',
      fontSize: 16.3,
      letterSpacing: 0.1,
      fontWeight: '500',
      lineHeight: 21,
    },
    chatInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 5,
    },
    chatInput: {
      flex: 1,
      color: '#fff',
      backgroundColor: '#23284a',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 16,
      borderWidth: 1.5,
      borderColor: '#00D9FF55',
      marginRight: 8,
      shadowColor: '#00D9FF',
      shadowOpacity: 0.10,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 3,
      elevation: 1,
    },
    chatSendBtn: {
      backgroundColor: '#00D9FF',
      paddingVertical: 11,
      paddingHorizontal: 21,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 80,
      shadowColor: '#00D9FF',
      shadowOpacity: 0.20,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 4,
      elevation: 2,
      transition: '0.13s',
    },
    chatSendBtnText: {
      color: '#003249',
      fontWeight: 'bold',
      fontSize: 16.2,
      letterSpacing: 0.18,
    },
      scrollToBottomBtn: {
      position: 'absolute',
      right: 14,
      bottom: 90, // adapte selon la hauteur de ta barre d'input
      backgroundColor: '#000',
      borderRadius: 22,
      padding: 9,
      elevation: 3,
      zIndex: 10,
      shadowColor: '#00D9FF',
      shadowOpacity: 0.23,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
  });
