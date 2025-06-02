import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Retour</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Politique de Confidentialité – Application STYX</Text>
        <Text style={styles.date}>Dernière mise à jour : 2 juin 2025</Text>

        <Section title="1. Introduction">
          Bienvenue sur l’application mobile STYX.  
          Cette politique de confidentialité informe les utilisateurs sur la collecte, l’utilisation, la conservation et la protection de leurs données personnelles, conformément au RGPD.
        </Section>

        <Section title="2. Qui est responsable du traitement de vos données ?">
          Le responsable du traitement est le développeur de STYX dans le cadre d’un projet scolaire à <Text style={styles.bold}>Webtech Institute, Groupe Next-u</Text>.  
          Aucune structure commerciale n’est associée à l’application.  
          Contact : <Text style={styles.bold}>[ton email étudiant]</Text>
        </Section>

        <Section title="3. Quelles données sont collectées ?">
          <Bullet>Nom d’utilisateur, adresse e-mail, mot de passe (chiffré)</Bullet>
          <Bullet>Niveau, rôle, club, poste</Bullet>
          <Bullet>Matchs créés/rejoints, équipe choisie, scores</Bullet>
          <Bullet>Date de création du compte et des matchs</Bullet>
          <Bullet>Ville du match (pas de géolocalisation temps réel)</Bullet>
          <Bullet>Logs de connexion, identifiant utilisateur interne</Bullet>
        </Section>

        <Section title="4. Sur quelle base légale ?">
          Les données sont traitées pour exécuter le service demandé (création de compte, gestion des matchs) et sur votre consentement lors de l’inscription et l’utilisation.
        </Section>

        <Section title="5. Consentement">
          En utilisant STYX et en créant un compte, vous consentez explicitement à la collecte et au traitement de vos données personnelles comme décrit ici.  
          Vous pouvez retirer votre consentement à tout moment en demandant la suppression de votre compte.
        </Section>

        <Section title="6. Pourquoi ces données sont-elles collectées ?">
          <Bullet>Permettre la création, la gestion et la participation à des matchs</Bullet>
          <Bullet>Gérer les comptes utilisateurs et profils</Bullet>
          <Bullet>Garantir le bon fonctionnement de l’application</Bullet>
          <Bullet>Assurer la sécurité et prévenir la fraude</Bullet>
          <Bullet>Aucune donnée n’est utilisée à des fins commerciales/publicitaires</Bullet>
        </Section>

        <Section title="7. Où sont stockées vos données ?">
          <Bullet>Application et API hébergées sur Platform.sh (France/UE)</Bullet>
          <Bullet>Base de données hébergée sur Aiven.io (UE, conforme RGPD)</Bullet>
          <Bullet>Aiven.io respecte la législation européenne</Bullet>
        </Section>

        <Section title="8. Combien de temps vos données sont-elles conservées ?">
          Vos données sont conservées pendant la durée du projet scolaire ou jusqu’à la suppression de votre compte, à votre demande.
        </Section>

        <Section title="9. Qui a accès à vos données ?">
          Seul le développeur et éventuellement les encadrants du projet y ont accès à des fins techniques ou pédagogiques.  
          Aucune donnée n’est communiquée à des tiers sauf obligation légale.
        </Section>

        <Section title="10. Vos droits sur vos données">
          <Bullet>Accès : demande d’accès à vos données</Bullet>
          <Bullet>Rectification : correction de données inexactes</Bullet>
          <Bullet>Suppression : suppression du compte/données à tout moment</Bullet>
          <Bullet>Portabilité : recevoir vos données dans un format lisible</Bullet>
          <Bullet>Limitation et opposition au traitement</Bullet>
          Contact : <Text style={styles.bold}>[ton email étudiant]</Text>
        </Section>

        <Section title="11. Droit de réclamation">
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez contacter la CNIL (www.cnil.fr).
        </Section>

        <Section title="12. Sécurité">
          <Bullet>Mots de passe chiffrés</Bullet>
          <Bullet>Accès à la base de données restreint et sécurisé</Bullet>
          <Bullet>Serveurs protégés contre les accès non autorisés</Bullet>
          <Bullet>Sauvegardes régulières</Bullet>
        </Section>

        <Section title="13. Cookies et suivi">
          Aucun cookie publicitaire ou traceur n’est utilisé sur l’application mobile.
        </Section>

        <Section title="14. Modification de la politique">
          Cette politique pourra être modifiée. Les utilisateurs seront informés en cas de changement important.
          <Text>{"\n"}</Text>
          Pour toute question ou exercice de vos droits : <Text style={styles.bold}>[ton email étudiant]</Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

function Bullet({ children }) {
  return (
    <Text style={styles.text}>
      <Text style={styles.bullet}>• </Text>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  backBtn: { padding: 16, paddingTop: 40, marginBottom: -10 },
  backBtnText: { color: "#46B3D0", fontWeight: "bold", fontSize: 16 },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    color: "#00D9FF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  date: { color: "#ccc", fontSize: 13, marginBottom: 24, textAlign: "center" },
  sectionTitle: { color: "#00D9FF", fontSize: 17, fontWeight: "600", marginBottom: 7 },
  text: { color: "#fff", fontSize: 15, lineHeight: 23 },
  bullet: { color: "#00D9FF", fontSize: 15 },
  bold: { color: "#fff", fontWeight: "bold" },
});
