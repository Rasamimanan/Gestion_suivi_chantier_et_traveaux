import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import { getChantiers } from '../../services/api';

const STATUT_COLOR = {
  non_commence: '#94a3b8',
  en_cours:     '#f59e0b',
  termine:      '#22c55e',
  suspendu:     '#ef4444',
};
const STATUT_LABEL = {
  non_commence: 'Non commencé',
  en_cours:     'En cours',
  termine:      'Terminé',
  suspendu:     'Suspendu',
};
const FILTRES = ['tous', 'en_cours', 'non_commence', 'termine', 'suspendu'];

function RoleBanner({ role }) {
  if (role === 'admin') return null;
  const config = {
    chef_chantier: { icon: '👷', text: 'Chef de chantier — gestion complète', bg: '#eff6ff', color: '#1d4ed8' },
    utilisateur:   { icon: '👁️', text: 'Mode consultation — lecture seule', bg: '#f0fdf4', color: '#15803d' },
  };
  const c = config[role];
  if (!c) return null;
  return (
    <View style={[styles.banner, { backgroundColor: c.bg }]}>
      <Text style={[styles.bannerText, { color: c.color }]}>{c.icon} {c.text}</Text>
    </View>
  );
}

export default function ChantiersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { canEdit, role } = useRole();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre, setFiltre]        = useState('tous');

  const load = async () => {
    try {
      const res = await getChantiers();
      setChantiers(res.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const data = filtre === 'tous'
    ? chantiers
    : chantiers.filter((c) => c.statut === filtre);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a5c" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chantiers</Text>
          <Text style={styles.headerSub}>{chantiers.length} projet{chantiers.length !== 1 ? 's' : ''}</Text>
        </View>
        {/* Bouton créer — admin + chef uniquement */}
        {canEdit && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/chantier/create')}
          >
            <Text style={styles.addBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* BANNIÈRE RÔLE */}
      <RoleBanner role={role} />

      {/* FILTRES */}
      <FlatList
        horizontal
        data={FILTRES}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresRow}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filtrePill, filtre === f && styles.filtrePillActive]}
            onPress={() => setFiltre(f)}
          >
            <Text style={[styles.filtreText, filtre === f && styles.filtreTextActive]}>
              {f === 'tous' ? 'Tous' : STATUT_LABEL[f]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* LISTE */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={['#1a3a5c']}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/chantier/${item.id}`)}
            activeOpacity={0.85}
          >
            {/* Statut indicator */}
            <View style={[styles.statutDot, { backgroundColor: STATUT_COLOR[item.statut] }]} />

            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.cardNom} numberOfLines={2}>{item.nom}</Text>
                <View style={[styles.statutBadge, { backgroundColor: STATUT_COLOR[item.statut] + '20' }]}>
                  <Text style={[styles.statutText, { color: STATUT_COLOR[item.statut] }]}>
                    {STATUT_LABEL[item.statut] || item.statut}
                  </Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}

              <View style={styles.cardMeta}>
                {item.client_nom ? (
                  <Text style={styles.metaItem}>👤 {item.client_nom}</Text>
                ) : null}
                {item.lieu ? (
                  <Text style={styles.metaItem}>📍 {item.lieu}</Text>
                ) : null}
                {item.date_debut ? (
                  <Text style={styles.metaItem}>
                    📅 {new Date(item.date_debut).toLocaleDateString('fr-FR')}
                  </Text>
                ) : null}
              </View>

              {/* Budget */}
              {item.budget_total ? (
                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Budget</Text>
                  <Text style={styles.budgetVal}>
                    {Number(item.budget_total).toLocaleString('fr-FR')} Ar
                  </Text>
                </View>
              ) : null}

              {/* Actions — admin + chef uniquement */}
              {canEdit && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.push(`/chantier/edit/${item.id}`)}
                  >
                    <Text style={styles.actionBtnText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => router.push(`/chantier/${item.id}/etapes`)}
                  >
                    <Text style={styles.actionBtnOutlineText}>📋 Étapes</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyTitle}>
              {filtre !== 'tous' ? 'Aucun chantier pour ce filtre' : 'Aucun chantier'}
            </Text>
            {canEdit && filtre === 'tous' && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/chantier/create')}
              >
                <Text style={styles.emptyBtnText}>Créer un chantier</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  header: {
    backgroundColor: '#1a3a5c',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSub:   { color: '#a8c4e0', fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#1a3a5c', fontWeight: '800', fontSize: 13 },

  // BANNER
  banner: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  bannerText: { fontSize: 12, fontWeight: '600' },

  // FILTRES
  filtresRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtrePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filtrePillActive: { backgroundColor: '#1a3a5c', borderColor: '#1a3a5c' },
  filtreText:       { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filtreTextActive: { color: '#fff' },

  // LIST
  list: { padding: 16, paddingBottom: 100 },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statutDot: { width: 5, minHeight: '100%' },
  cardContent: { flex: 1, padding: 14 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardNom: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  statutBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statutText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 17, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  metaItem: { fontSize: 11, color: '#64748b' },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  budgetLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  budgetVal:   { fontSize: 12, color: '#1a3a5c', fontWeight: '700' },

  // ACTIONS (chef + admin)
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    backgroundColor: '#1a3a5c',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtnOutline: {
    borderWidth: 1.5,
    borderColor: '#1a3a5c',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  actionBtnOutlineText: { color: '#1a3a5c', fontSize: 12, fontWeight: '700' },

  // EMPTY
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:  { fontSize: 15, fontWeight: '700', color: '#475569', marginBottom: 16 },
  emptyBtn: {
    backgroundColor: '#1a3a5c',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
});