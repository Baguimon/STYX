import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getUserClub } from '../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';

export default function ClubHomeScreen() {
  const navigation = useNavigation();
  const { userInfo, refreshUserInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchClub = async () => {
        setLoading(true);
        try {
          // REFRESH userInfo pour être certain d'avoir la version la plus fraîche (optionnel si déjà fait avant)
          if (typeof refreshUserInfo === "function") {
            await refreshUserInfo();
          }
          const userId = userInfo?.id;
          if (!userId) throw new Error("Utilisateur non identifié");

          const clubData = await getUserClub(userId);
          if (isActive) {
            if (clubData && clubData.id) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'ClubDetail', params: { clubId: clubData.id } }]
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'NoClubScreen' }]
              });
            }
          }
        } catch (e) {
          if (isActive) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'NoClubScreen' }]
            });
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchClub();
      return () => { isActive = false; };
    }, [userInfo?.id]) // <-- dépend de l'id utilisateur à jour
  );

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#00D9FF" />
      </View>
    );
  }

  return null; // Redirige direct, pas de rendu
}
