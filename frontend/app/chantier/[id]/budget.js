import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRole } from '../../../hooks/useRole';
import {
  deleteDepense,
  deleteRevenu,
  getBudgetChantier,
  getDepenses,
  getRevenus,
} from '../../../services/budgetApi';

const TABS = [
  { key: 'overview',  label: '📊 Vue d\'ensemble' },
  { key: 'depenses',  label: '📉 Dépenses' },
  { key: 'revenus',   label: '📈 Revenus' },
];

export default function ChantierBudgetScreen() {
  const { id }    = useLocalSearchParams();
  const router    = useRouter();
  const { canEdit } = useRole();

  const [budget,     setBudget]     = useState(null);
  const [depenses,   setDepenses]   = useState([]);
  const [revenus,    setRevenus]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState('overview');

  const loadData = async () => {
    try {
      const [budgetData, depensesData, revenusData] = await Promise.all([
        getBudgetChantier(id),
        getDepenses({ chantierId: id }),
        getRevenus({ chantierId: id }),
      ]);
      setBudget(budgetData);
      setDepenses(depensesData);
      setRevenus(revenusData);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [id]));

  const handleDeleteDepense = (depenseId) => {
    Alert.alert('Supprimer', 'Supprimer cette dépense ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await deleteDepense(depenseId); loadData(); }
          catch (err) { Alert.alert('Erreur', err?.response?.data?.error || 'Suppression impossible'); }
        },
      },
    ]);
  };

  const handleDeleteRevenu = (revenuId) => {
    Alert.alert('Supprimer', 'Supprimer ce revenu ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await deleteRevenu(revenuId); loadData(); }
          catch (err) { Alert.alert('Erreur', err?.response?.data?.error || 'Suppression impossible'); }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a5c" />
        <Text style={styles.loadingText}>Chargement du budget…</Text>
      </View>
    );
  }

  const b   = budget?.budget;
  const pct = Math.min(parseFloat(b?.pourcentage_utilise || 0), 100);

  return (
    <View style={styles.root}>
      {/* TABS */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            colors={['#1a3a5c']}
          />
        }
      >
        {/* ====== OVERVIEW ====== */}
        {activeTab === 'overview' && (
          <>
            {/* Barre progression */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Utilisation du budget</Text>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#1a3a5c',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressPct}>{pct.toFixed(1)}% utilisé</Text>
            </View>

            {/* Chiffres clés */}
            <View style={styles.figuresGrid}>
              {[
                { label: 'Budget alloué', val: b?.alloue || 0,  color: '#1a3a5c' },
                { label: 'Dépenses',      val: b?.utilise || 0, color: '#ef4444' },
                { label: 'Revenus',       val: b?.revenu || 0,  color: '#22c55e' },
                { label: 'Solde',         val: b?.solde || 0,   color: parseFloat(b?.solde || 0) >= 0 ? '#22c55e' : '#ef4444' },
                { label: 'Reste budget',  val: b?.reste || 0,   color: parseFloat(b?.reste || 0) >= 0 ? '#1a3a5c' : '#ef4444' },
              ].map((item) => (
                <View key={item.label} style={styles.figureCard}>
                  <Text style={styles.figureLabel}>{item.label}</Text>
                  <Text style={[styles.figureVal, { color: item.color }]}>
                    {parseFloat(item.val).toLocaleString('fr-FR')} Ar
                  </Text>
                </View>
              ))}
            </View>

            {/* Dépenses par catégorie */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dépenses par catégorie</Text>
              {budget?.depenses_par_categorie?.length ? (
                budget.depenses_par_categorie.map((cat, idx) => (
                  <View key={idx} style={styles.listRow}>
                    <Text style={styles.listLabel}>{cat.categorie || 'Autre'}</Text>
                    <View style={styles.listRight}>
                      <Text style={styles.listCount}>{cat.nb_depenses} op.</Text>
                      <Text style={[styles.listVal, { color: '#ef4444' }]}>
                        {parseFloat(cat.total_depenses || 0).toLocaleString('fr-FR')} Ar
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySmall}>Aucune dépense enregistrée</Text>
              )}
            </View>

            {/* Revenus par source */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Revenus par source</Text>
              {budget?.revenus_par_source?.length ? (
                budget.revenus_par_source.map((src, idx) => (
                  <View key={idx} style={styles.listRow}>
                    <Text style={styles.listLabel}>{src.source || 'Autre'}</Text>
                    <View style={styles.listRight}>
                      <Text style={styles.listCount}>{src.nb_revenus} op.</Text>
                      <Text style={[styles.listVal, { color: '#22c55e' }]}>
                        +{parseFloat(src.total_revenus || 0).toLocaleString('fr-FR')} Ar
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySmall}>Aucun revenu enregistré</Text>
              )}
            </View>

            {/* Boutons ajouter */}
            {canEdit && (
              <View style={styles.addRow}>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: '#ef4444' }]}
                  onPress={() => router.push('/budget/add-depense')}
                >
                  <Text style={styles.addBtnText}>➕ Dépense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: '#22c55e' }]}
                  onPress={() => router.push('/budget/add-revenu')}
                >
                  <Text style={styles.addBtnText}>➕ Revenu</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ====== DÉPENSES ====== */}
        {activeTab === 'depenses' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {depenses.length} dépense{depenses.length !== 1 ? 's' : ''}
              </Text>
              {canEdit && (
                <TouchableOpacity
                  style={styles.addBtnSmall}
                  onPress={() => router.push('/budget/add-depense')}
                >
                  <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>

            {depenses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📉</Text>
                <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
              </View>
            ) : (
              depenses.map((dep) => (
                <View key={dep.id} style={styles.itemCard}>
                  <View style={styles.itemTop}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemTitle}>{dep.description || 'Sans description'}</Text>
                      <Text style={styles.itemMeta}>
                        📌 {dep.categorie} • {new Date(dep.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text style={[styles.itemVal, { color: '#ef4444' }]}>
                      {parseFloat(dep.montant).toLocaleString('fr-FR')} Ar
                    </Text>
                  </View>
                  {canEdit && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteDepense(dep.id)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* ====== REVENUS ====== */}
        {activeTab === 'revenus' && (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {revenus.length} revenu{revenus.length !== 1 ? 's' : ''}
              </Text>
              {canEdit && (
                <TouchableOpacity
                  style={[styles.addBtnSmall, { backgroundColor: '#22c55e' }]}
                  onPress={() => router.push('/budget/add-revenu')}
                >
                  <Text style={styles.addBtnSmallText}>+ Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>

            {revenus.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📈</Text>
                <Text style={styles.emptyText}>Aucun revenu enregistré</Text>
              </View>
            ) : (
              revenus.map((rev) => (
                <View key={rev.id} style={styles.itemCard}>
                  <View style={styles.itemTop}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemTitle}>{rev.description || 'Sans description'}</Text>
                      <Text style={styles.itemMeta}>
                        📌 {rev.source} • {new Date(rev.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <Text style={[styles.itemVal, { color: '#22c55e' }]}>
                      +{parseFloat(rev.montant).toLocaleString('fr-FR')} Ar
                    </Text>
                  </View>
                  {canEdit && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteRevenu(rev.id)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#f0f4f8' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText:   { marginTop: 12, color: '#64748b', fontSize: 14 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // TABS
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: '#f59e0b' },
  tabText:       { color: '#a8c4e0', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: '800' },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  // PROGRESS
  progressBg: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressPct:  { fontSize: 13, fontWeight: '700', color: '#475569', textAlign: 'right' },

  // FIGURES GRID
  figuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  figureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  figureLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginBottom: 6 },
  figureVal:   { fontSize: 14, fontWeight: '800' },

  // LIST ROWS (overview)
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  listLabel: { fontSize: 13, color: '#334155', fontWeight: '500', flex: 1 },
  listRight: { alignItems: 'flex-end' },
  listCount: { fontSize: 10, color: '#94a3b8', marginBottom: 2 },
  listVal:   { fontSize: 13, fontWeight: '700' },
  emptySmall: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 8 },

  // ADD ROW
  addRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  addBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // LIST HEADER
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listHeaderText: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  addBtnSmall: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnSmallText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // ITEM CARD
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemLeft: { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  itemMeta:  { fontSize: 11, color: '#94a3b8' },
  itemVal:   { fontSize: 14, fontWeight: '800' },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  deleteBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },

  // EMPTY
  emptyBox:  { alignItems: 'center', paddingTop: 50 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
});