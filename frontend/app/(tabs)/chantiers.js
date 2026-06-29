import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRole } from '../../hooks/useRole';
import { getChantiers } from '../../services/api';

const { width } = Dimensions.get('window');

const STATUT = {
  non_commence: { label: 'Non commencé', color: '#64748b', bg: '#f1f5f9', icon: '⏳' },
  en_cours:     { label: 'En cours',     color: '#f59e0b', bg: '#fffbeb', icon: '🔨' },
  termine:      { label: 'Terminé',      color: '#22c55e', bg: '#f0fdf4', icon: '✅' },
  suspendu:     { label: 'Suspendu',     color: '#ef4444', bg: '#fff1f2', icon: '⏸️' },
};

const FILTRES = [
  { key: 'tous',         label: 'Tous',          icon: '🏗️' },
  { key: 'en_cours',     label: 'En cours',      icon: '🔨' },
  { key: 'non_commence', label: 'À démarrer',    icon: '⏳' },
  { key: 'termine',      label: 'Terminés',      icon: '✅' },
  { key: 'suspendu',     label: 'Suspendus',     icon: '⏸️' },
];

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ChantierCard({ item, canEdit, onPress, onEdit, onEtapes }) {
  const s = STATUT[item.statut] || STATUT.non_commence;

  // Calcul progression basique
  const dateDebut = item.date_debut ? new Date(item.date_debut) : null;
  const dateFin   = item.date_fin_prevue ? new Date(item.date_fin_prevue) : null;
  let progression = 0;
  if (dateDebut && dateFin) {
    const total   = dateFin - dateDebut;
    const ecoule  = Date.now() - dateDebut;
    progression   = Math.min(Math.max(Math.round((ecoule / total) * 100), 0), 100);
    if (item.statut === 'termine')   progression = 100;
    if (item.statut === 'non_commence') progression = 0;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Bande colorée gauche */}
      <View style={[styles.cardStripe, { backgroundColor: s.color }]} />

      <View style={styles.cardInner}>
        {/* TOP ROW */}
        <View style={styles.cardTop}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardNom} numberOfLines={1}>{item.nom}</Text>
            {item.lieu ? (
              <Text style={styles.cardLieu} numberOfLines={1}>📍 {item.lieu}</Text>
            ) : null}
          </View>
          <View style={[styles.statutBadge, { backgroundColor: s.bg }]}>
            <Text style={styles.statutIcon}>{s.icon}</Text>
            <Text style={[styles.statutLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* META */}
        <View style={styles.metaRow}>
          {item.client_nom ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>👤 {item.client_nom}</Text>
            </View>
          ) : null}
          {item.date_debut ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                🗓️ {new Date(item.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          ) : null}
          {item.date_fin_prevue ? (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>
                🏁 {new Date(item.date_fin_prevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* PROGRESSION */}
        {(dateDebut && dateFin) ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progression temporelle</Text>
              <Text style={[styles.progressPct, { color: s.color }]}>{progression}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progression}%`, backgroundColor: s.color }]} />
            </View>
          </View>
        ) : null}

        {/* BUDGET */}
        {item.budget_total ? (
          <View style={styles.budgetRow}>
            <Text style={styles.budgetIcon}>💰</Text>
            <Text style={styles.budgetLabel}>Budget alloué</Text>
            <Text style={styles.budgetVal}>
              {Number(item.budget_total).toLocaleString('fr-FR')} Ar
            </Text>
          </View>
        ) : null}

        {/* ACTIONS */}
        {canEdit ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnEdit} onPress={onEdit}>
              <Text style={styles.btnEditText}>✏️ Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnEtapes} onPress={onEtapes}>
              <Text style={styles.btnEtapesText}>📋 Étapes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDetail} onPress={onPress}>
              <Text style={styles.btnDetailText}>→</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnDetailFull} onPress={onPress}>
            <Text style={styles.btnDetailFullText}>Voir les détails →</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChantiersScreen() {
  const router = useRouter();
  const { canEdit, role } = useRole();
  const [chantiers,  setChantiers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre,     setFiltre]     = useState('tous');

  const load = async () => {
    try {
      const res = await getChantiers();
      setChantiers(res.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const data = filtre === 'tous'
    ? chantiers
    : chantiers.filter((c) => c.statut === filtre);

  // Stats
  const stats = {
    total:    chantiers.length,
    en_cours: chantiers.filter(c => c.statut === 'en_cours').length,
    termine:  chantiers.filter(c => c.statut === 'termine').length,
    suspendu: chantiers.filter(c => c.statut === 'suspendu').length,
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a5c" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={['#1a3a5c']}
          />
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Mes Chantiers</Text>
                <Text style={styles.headerSub}>
                  {chantiers.length} projet{chantiers.length !== 1 ? 's' : ''} au total
                </Text>
              </View>
              {canEdit && (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => router.push('/chantier/create')}
                >
                  <Text style={styles.addBtnText}>＋ Nouveau</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
              <StatCard label="Total"     value={stats.total}    color="#1a3a5c" />
              <StatCard label="En cours"  value={stats.en_cours} color="#f59e0b" />
              <StatCard label="Terminés"  value={stats.termine}  color="#22c55e" />
              <StatCard label="Suspendus" value={stats.suspendu} color="#ef4444" />
            </View>

            {/* ROLE BANNER */}
            {role !== 'admin' && (
              <View style={[
                styles.roleBanner,
                { backgroundColor: role === 'chef_chantier' ? '#eff6ff' : '#f0fdf4' }
              ]}>
                <Text style={[
                  styles.roleBannerText,
                  { color: role === 'chef_chantier' ? '#1d4ed8' : '#15803d' }
                ]}>
                  {role === 'chef_chantier'
                    ? '👷 Chef de chantier — gestion complète'
                    : '👁️ Mode consultation — lecture seule'}
                </Text>
              </View>
            )}

            {/* FILTRES */}
            <FlatList
              horizontal
              data={FILTRES}
              keyExtractor={(f) => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtresRow}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[styles.filtrePill, filtre === f.key && styles.filtrePillActive]}
                  onPress={() => setFiltre(f.key)}
                >
                  <Text style={styles.filtreIcon}>{f.icon}</Text>
                  <Text style={[styles.filtreText, filtre === f.key && styles.filtreTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {data.length > 0 && (
              <Text style={styles.resultsCount}>
                {data.length} résultat{data.length !== 1 ? 's' : ''}
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ChantierCard
            item={item}
            canEdit={canEdit}
            onPress={() => router.push(`/chantier/${item.id}`)}
            onEdit={() => router.push(`/chantier/edit/${item.id}`)}
            onEtapes={() => router.push(`/chantier/${item.id}/etapes`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyTitle}>
              {filtre !== 'tous' ? 'Aucun chantier pour ce filtre' : 'Aucun chantier'}
            </Text>
            <Text style={styles.emptyDesc}>
              {filtre !== 'tous'
                ? 'Essayez un autre filtre.'
                : canEdit ? 'Créez votre premier chantier.' : 'Aucun projet disponible.'}
            </Text>
            {canEdit && filtre === 'tous' && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/chantier/create')}
              >
                <Text style={styles.emptyBtnText}>＋ Créer un chantier</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },
  list:   { paddingBottom: 100 },

  // HEADER
  header: {
    backgroundColor: '#1a3a5c',
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  headerSub:   { color: '#a8c4e0', fontSize: 13, marginTop: 3 },
  addBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#f59e0b',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: '#1a3a5c', fontWeight: '900', fontSize: 14 },

  // STATS
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statVal:   { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },

  // ROLE BANNER
  roleBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roleBannerText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // FILTRES
  filtresRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filtrePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  filtrePillActive: { backgroundColor: '#1a3a5c', borderColor: '#1a3a5c' },
  filtreIcon:       { fontSize: 12 },
  filtreText:       { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filtreTextActive: { color: '#fff' },

  resultsCount: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1a3a5c',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardStripe: { width: 6 },
  cardInner:  { flex: 1, padding: 16 },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleWrap: { flex: 1, marginRight: 8 },
  cardNom: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 3,
  },
  cardLieu: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statutIcon:  { fontSize: 11 },
  statutLabel: { fontSize: 10, fontWeight: '800' },

  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },

  // META
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaChipText: { fontSize: 11, color: '#475569', fontWeight: '500' },

  // PROGRESS
  progressWrap:   { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel:  { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  progressPct:    { fontSize: 11, fontWeight: '800' },
  progressBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  // BUDGET
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  budgetIcon:  { fontSize: 14 },
  budgetLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', flex: 1 },
  budgetVal:   { fontSize: 13, color: '#1a3a5c', fontWeight: '800' },

  // ACTIONS
  actionsRow: { flexDirection: 'row', gap: 8 },
  btnEdit: {
    flex: 1,
    backgroundColor: '#1a3a5c',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnEditText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnEtapes: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  btnEtapesText: { color: '#1a3a5c', fontSize: 12, fontWeight: '700' },
  btnDetail: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnDetailText: { color: '#fff', fontSize: 14, fontWeight: '900' },

  btnDetailFull: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  btnDetailFullText: { color: '#1a3a5c', fontSize: 13, fontWeight: '700' },

  // EMPTY
  empty:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#334155', marginBottom: 8, textAlign: 'center' },
  emptyDesc:  { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emptyBtn: {
    backgroundColor: '#1a3a5c',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#1a3a5c',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});