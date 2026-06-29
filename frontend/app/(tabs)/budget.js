import { useFocusEffect, useRouter } from 'expo-router';
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

import { useRole } from '../../hooks/useRole';
import { getChantiers } from '../../services/api';
import { getBudgetChantier } from '../../services/budgetApi';

const STATUT_COLOR = {
  non_commence: '#94a3b8',
  en_cours:     '#f59e0b',
  termine:      '#22c55e',
  suspendu:     '#ef4444',
};

export default function BudgetScreen() {
  const router = useRouter();
  const { canEdit } = useRole();
  const [chantiers, setChantiers]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [totalDepenses, setTotalDepenses] = useState(0);
  const [totalRevenus, setTotalRevenus]   = useState(0);

  const loadData = async () => {
    try {
      const chantiersRes  = await getChantiers();
      const chantiersData = chantiersRes.data || [];

      let sumDep = 0;
      let sumRev = 0;

      const chantiersWithBudget = await Promise.all(
        chantiersData.map(async (chantier) => {
          try {
            const budget = await getBudgetChantier(chantier.id);
            sumDep += parseFloat(budget?.budget?.utilise || 0);
            sumRev += parseFloat(budget?.budget?.revenu  || 0);
            return { ...chantier, budget };
          } catch {
            return { ...chantier, budget: null };
          }
        })
      );

      setChantiers(chantiersWithBudget);
      setTotalDepenses(sumDep);
      setTotalRevenus(sumRev);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a5c" />
        <Text style={styles.loadingText}>Chargement des budgets…</Text>
      </View>
    );
  }

  const soldeGlobal = totalRevenus - totalDepenses;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); loadData(); }}
          colors={['#1a3a5c']}
        />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Budget</Text>
        <Text style={styles.headerSub}>Suivi budgétaire par chantier</Text>
      </View>

      {/* RÉSUMÉ GLOBAL */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: '#ef4444' }]}>
          <Text style={styles.summaryLabel}>Total dépenses</Text>
          <Text style={[styles.summaryVal, { color: '#ef4444' }]}>
            {totalDepenses.toLocaleString('fr-FR')} Ar
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#22c55e' }]}>
          <Text style={styles.summaryLabel}>Total revenus</Text>
          <Text style={[styles.summaryVal, { color: '#22c55e' }]}>
            {totalRevenus.toLocaleString('fr-FR')} Ar
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: soldeGlobal >= 0 ? '#22c55e' : '#ef4444' }]}>
          <Text style={styles.summaryLabel}>Solde global</Text>
          <Text style={[styles.summaryVal, { color: soldeGlobal >= 0 ? '#22c55e' : '#ef4444' }]}>
            {soldeGlobal.toLocaleString('fr-FR')} Ar
          </Text>
        </View>
      </View>

      {/* BOUTONS AJOUTER */}
      {canEdit && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => router.push('/budget/add-depense')}
          >
            <Text style={styles.actionBtnText}>➕ Dépense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}
            onPress={() => router.push('/budget/add-revenu')}
          >
            <Text style={styles.actionBtnText}>➕ Revenu</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTE CHANTIERS */}
      <Text style={styles.sectionTitle}>Par chantier</Text>

      {chantiers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏗️</Text>
          <Text style={styles.emptyText}>Aucun chantier</Text>
        </View>
      ) : (
        chantiers.map((chantier) => {
          const b     = chantier.budget?.budget;
          const pct   = Math.min(parseFloat(b?.pourcentage_utilise || 0), 100);
          const solde = parseFloat(b?.solde || 0);
          const statutColor = STATUT_COLOR[chantier.statut] || '#94a3b8';

          return (
            <TouchableOpacity
              key={chantier.id}
              style={styles.card}
              onPress={() => router.push(`/chantier/${chantier.id}/budget`)}
              activeOpacity={0.85}
            >
              {/* Bande statut */}
              <View style={[styles.cardStripe, { backgroundColor: statutColor }]} />

              <View style={styles.cardBody}>
                <Text style={styles.cardNom}>{chantier.nom}</Text>

                {b ? (
                  <>
                    {/* Barre progression */}
                    <View style={styles.progressRow}>
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
                      <Text style={styles.progressPct}>{pct.toFixed(0)}%</Text>
                    </View>

                    {/* Chiffres */}
                    <View style={styles.figuresRow}>
                      <View style={styles.figureBox}>
                        <Text style={styles.figureLabel}>Budget</Text>
                        <Text style={styles.figureVal}>
                          {parseFloat(b.alloue || 0).toLocaleString('fr-FR')} Ar
                        </Text>
                      </View>
                      <View style={styles.figureBox}>
                        <Text style={styles.figureLabel}>Dépenses</Text>
                        <Text style={[styles.figureVal, { color: '#ef4444' }]}>
                          {parseFloat(b.utilise || 0).toLocaleString('fr-FR')} Ar
                        </Text>
                      </View>
                      <View style={styles.figureBox}>
                        <Text style={styles.figureLabel}>Solde</Text>
                        <Text style={[styles.figureVal, { color: solde >= 0 ? '#22c55e' : '#ef4444' }]}>
                          {solde.toLocaleString('fr-FR')} Ar
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noBudget}>Aucune donnée budgétaire</Text>
                )}

                <Text style={styles.cardCta}>Voir le détail →</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Note utilisateur simple */}
      {!canEdit && (
        <View style={styles.readonlyNote}>
          <Text style={styles.readonlyText}>
            📖 Mode lecture seule — Contactez un administrateur pour modifier le budget.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f0f4f8' },
  scroll:      { paddingBottom: 100 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },

  // HEADER
  header: {
    backgroundColor: '#1a3a5c',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerSub:   { color: '#a8c4e0', fontSize: 13, marginTop: 4 },

  // RÉSUMÉ
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
  summaryVal:   { fontSize: 13, fontWeight: '800' },

  // ACTIONS
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // SECTION
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardStripe: { width: 5 },
  cardBody:   { flex: 1, padding: 14 },
  cardNom:    { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },

  // PROGRESS
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill:  { height: '100%', borderRadius: 4 },
  progressPct:   { fontSize: 12, fontWeight: '700', color: '#1a3a5c', width: 36, textAlign: 'right' },

  // FIGURES
  figuresRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  figureBox:   {},
  figureLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  figureVal:   { fontSize: 12, fontWeight: '700', color: '#1e293b' },

  noBudget: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 8 },
  cardCta:  { fontSize: 11, color: '#1a3a5c', fontWeight: '700', textAlign: 'right' },

  // EMPTY
  empty:     { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8' },

  // READONLY
  readonlyNote: {
    margin: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  readonlyText: { color: '#1d4ed8', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});