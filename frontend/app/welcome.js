import { useRouter } from 'expo-router';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: '🏗️',
    titre: 'Gestion des chantiers',
    desc: 'Créez et suivez tous vos chantiers en temps réel depuis votre téléphone.',
  },
  {
    icon: '📋',
    titre: 'Étapes & Planification',
    desc: 'Organisez les étapes, assignez des intervenants et suivez l\'avancement.',
  },
  {
    icon: '👷',
    titre: 'Équipe & Intervenants',
    desc: 'Gérez vos équipes, sous-traitants et leurs spécialités en un seul endroit.',
  },
  {
    icon: '💰',
    titre: 'Suivi Budgétaire',
    desc: 'Contrôlez dépenses et revenus, visualisez l\'état financier de chaque chantier.',
  },
  {
    icon: '📸',
    titre: 'Photos & Rapports',
    desc: 'Documentez l\'avancement avec des photos directement depuis le terrain.',
  },
  {
    icon: '🔔',
    titre: 'Notifications',
    desc: 'Restez informé des mises à jour importantes sur vos projets en cours.',
  },
];

const STATS = [
  { valeur: '100%', label: 'Mobile' },
  { valeur: '∞', label: 'Chantiers' },
  { valeur: '24/7', label: 'Accès' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3a5c" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HERO */}
        <View style={styles.hero}>
          {/* BOUTONS EN HAUT */}
          <View style={styles.topButtons}>
            <TouchableOpacity
              style={styles.topBtnSecondary}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Text style={styles.topBtnSecondaryText}>S'inscrire</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topBtnPrimary}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.topBtnPrimaryText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>🏆 Gestion de chantier</Text>
          </View>
          <Text style={styles.heroTitle}>Pilotez vos{'\n'}chantiers{'\n'}
            <Text style={styles.heroAccent}>depuis le terrain</Text>
          </Text>
          <Text style={styles.heroSub}>
            L'application tout-en-un pour les chefs de chantier, maîtres d'œuvre et équipes terrain.
          </Text>

          {/* STATS */}
          <View style={styles.statsRow}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statVal}>{s.valeur}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FEATURES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tout ce dont vous avez besoin</Text>
          <Text style={styles.sectionSub}>Conçu pour les professionnels du BTP</Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <View key={f.titre} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureTitle}>{f.titre}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* PUBLICATIONS CHANTIER */}
        <View style={styles.pubSection}>
          <Text style={styles.sectionTitle}>Restez connecté au terrain</Text>
          <Text style={styles.sectionSub}>Toutes les mises à jour de vos projets</Text>

          {[
            {
              type: '🏗️ Avancement',
              titre: 'Fondations du Bloc A terminées',
              desc: 'Les travaux de fondation sont achevés avec 2 jours d\'avance sur le planning prévu.',
              date: 'Aujourd\'hui',
              color: '#e8f5e9',
              accent: '#2e7d32',
            },
            {
              type: '📸 Photo',
              titre: 'Documentation étape toiture',
              desc: 'Nouvelles photos ajoutées pour le suivi de la pose de la charpente métallique.',
              date: 'Hier',
              color: '#e3f2fd',
              accent: '#1565c0',
            },
            {
              type: '⚠️ Alerte',
              titre: 'Budget dépassé sur Lot Électricité',
              desc: 'Le lot électricité dépasse de 8% le budget initial. Une révision est recommandée.',
              date: 'Il y a 2j',
              color: '#fff8e1',
              accent: '#f57f17',
            },
          ].map((pub) => (
            <View key={pub.titre} style={[styles.pubCard, { backgroundColor: pub.color }]}>
              <View style={styles.pubHeader}>
                <View style={[styles.pubTypeBadge, { borderColor: pub.accent }]}>
                  <Text style={[styles.pubType, { color: pub.accent }]}>{pub.type}</Text>
                </View>
                <Text style={styles.pubDate}>{pub.date}</Text>
              </View>
              <Text style={styles.pubTitre}>{pub.titre}</Text>
              <Text style={styles.pubDesc}>{pub.desc}</Text>
            </View>
          ))}
        </View>

        {/* CTA AMBANY */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
          <Text style={styles.ctaSub}>Rejoignez votre équipe maintenant</Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Se connecter →</Text>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>
            Votre compte sera activé par l'administrateur après inscription.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll: { paddingBottom: 40 },

  // TOP BUTTONS
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 24,
    paddingTop: 8,
  },
  topBtnPrimary: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  topBtnPrimaryText: { color: '#1a3a5c', fontWeight: '800', fontSize: 13 },
  topBtnSecondary: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  topBtnSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  // HERO
  hero: {
    backgroundColor: '#1a3a5c',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroAccent: { color: '#f59e0b' },
  heroSub: {
    color: '#a8c4e0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 26, fontWeight: '900', color: '#f59e0b' },
  statLabel: { fontSize: 11, color: '#a8c4e0', marginTop: 2, fontWeight: '600' },

  // SECTION
  section: { padding: 24 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a3a5c',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },

  // FEATURES GRID
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 4,
  },
  featureDesc: { fontSize: 11, color: '#64748b', lineHeight: 16 },

  // PUBLICATIONS
  pubSection: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  pubCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  pubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pubTypeBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pubType: { fontSize: 11, fontWeight: '700' },
  pubDate: { fontSize: 11, color: '#94a3b8' },
  pubTitre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  pubDesc: { fontSize: 12, color: '#475569', lineHeight: 18 },

  // CTA
  ctaSection: {
    margin: 24,
    backgroundColor: '#1a3a5c',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  ctaSub: { color: '#a8c4e0', fontSize: 13, marginBottom: 24 },
  btnPrimary: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#1a3a5c',
    fontWeight: '800',
    fontSize: 16,
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  btnSecondaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ctaNote: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});