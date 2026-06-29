import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createIntervenant,
  deleteIntervenant,
  getIntervenants,
  updateIntervenant,
} from '../../services/api';

const BLANK = {
  nom: '',
  prenom: '',
  role: '',
  telephone: '',
  email: '',
  entreprise: '',
  specialite: '',
};

const FIELDS = [
  { label: 'Nom *', key: 'nom', keyboard: 'default' },
  { label: 'Prénom *', key: 'prenom', keyboard: 'default' },
  { label: 'Rôle', key: 'role', keyboard: 'default' },
  { label: 'Téléphone', key: 'telephone', keyboard: 'phone-pad' },
  { label: 'Email', key: 'email', keyboard: 'email-address' },
  { label: 'Entreprise', key: 'entreprise', keyboard: 'default' },
  { label: 'Spécialité', key: 'specialite', keyboard: 'default' },
];

const ROLE_COLORS = {
  chef: '#1a3a5c',
  electricien: '#7c3aed',
  plombier: '#0369a1',
  maçon: '#92400e',
  peintre: '#065f46',
};

function getRoleColor(role = '') {
  const r = role.toLowerCase();
  for (const [k, v] of Object.entries(ROLE_COLORS)) {
    if (r.includes(k)) return v;
  }
  return '#1a3a5c';
}

function Avatar({ nom, prenom, role }) {
  const color = getRoleColor(role);
  return (
    <View style={[styles.avatar, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.avatarText, { color }]}>
        {(nom?.[0] || '?').toUpperCase()}{(prenom?.[0] || '').toUpperCase()}
      </Text>
    </View>
  );
}

export default function IntervenantsScreen() {
  const [intervenants, setIntervenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const r = await getIntervenants();
      setIntervenants(r.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openCreate = () => {
    setEditId(null);
    setForm(BLANK);
    setModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      nom: item.nom || '',
      prenom: item.prenom || '',
      role: item.role || '',
      telephone: item.telephone || '',
      email: item.email || '',
      entreprise: item.entreprise || '',
      specialite: item.specialite || '',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      Alert.alert('Champs requis', 'Nom et prénom sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateIntervenant(editId, form);
      } else {
        await createIntervenant(form);
      }
      setModal(false);
      setForm(BLANK);
      setEditId(null);
      load();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Supprimer l\'intervenant',
      `Voulez-vous supprimer ${item.nom} ${item.prenom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIntervenant(item.id);
              load();
            } catch {
              Alert.alert('Erreur', 'Impossible de supprimer cet intervenant.');
            }
          },
        },
      ]
    );
  };

  const filtered = intervenants.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.nom?.toLowerCase().includes(q) ||
      i.prenom?.toLowerCase().includes(q) ||
      i.role?.toLowerCase().includes(q) ||
      i.entreprise?.toLowerCase().includes(q)
    );
  });

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
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Intervenants</Text>
          <Text style={styles.headerCount}>{intervenants.length} membre{intervenants.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un intervenant…"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            colors={['#1a3a5c']}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Avatar nom={item.nom} prenom={item.prenom} role={item.role} />
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.nom} {item.prenom}</Text>
              {item.role ? (
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '18' }]}>
                  <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
                </View>
              ) : null}
              {item.entreprise ? <Text style={styles.cardMeta}>🏢 {item.entreprise}</Text> : null}
              {item.specialite ? <Text style={styles.cardMeta}>🔧 {item.specialite}</Text> : null}
              {item.telephone ? <Text style={styles.cardMeta}>📞 {item.telephone}</Text> : null}
              {item.email ? <Text style={styles.cardMeta}>✉️ {item.email}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👷</Text>
            <Text style={styles.emptyTitle}>
              {search ? 'Aucun résultat' : 'Aucun intervenant'}
            </Text>
            <Text style={styles.emptyDesc}>
              {search ? 'Essayez un autre mot-clé.' : 'Ajoutez votre premier intervenant.'}
            </Text>
          </View>
        }
      />

      {/* MODAL CREATE / EDIT */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editId ? '✏️ Modifier l\'intervenant' : '👷 Nouvel intervenant'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {FIELDS.map(({ label, key, keyboard }) => (
                <View key={key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form[key]}
                    onChangeText={(v) => setForm({ ...form, [key]: v })}
                    keyboardType={keyboard}
                    autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
                    placeholder={label.replace(' *', '')}
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModal(false); setEditId(null); setForm(BLANK); }}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>{editId ? 'Enregistrer' : 'Créer'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },

  // HEADER
  header: {
    backgroundColor: '#1a3a5c',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerCount: { color: '#a8c4e0', fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: '#1a3a5c', fontWeight: '800', fontSize: 13 },

  // SEARCH
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b' },
  searchClear: { color: '#94a3b8', fontSize: 16, paddingLeft: 8 },

  // LIST
  list: { padding: 16, paddingBottom: 100 },

  // CARD
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  cardActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
  editBtn: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 16 },

  // EMPTY
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },

  // MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '92%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a3a5c', marginBottom: 20 },

  // FIELDS
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },

  // FOOTER
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1a3a5c',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#94a3b8' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});