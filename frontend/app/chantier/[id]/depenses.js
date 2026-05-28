import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createDepense, deleteDepense, getDepenses } from '../../../services/api';

const CATS = ['materiel', 'main_oeuvre', 'equipement', 'transport', 'autre'];
const CATS_LABEL = { materiel: '🧱 Matériel', main_oeuvre: '👷 Main d\'œuvre', equipement: '🔧 Équipement', transport: '🚛 Transport', autre: '📦 Autre' };
const BLANK = { titre: '', montant: '', categorie: 'materiel', date_depense: '', description: '' };

export default function DepensesChantier() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState({ depenses: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await getDepenses(id); setData(r.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const handleCreate = async () => {
    if (!form.titre || !form.montant) { Alert.alert('Erreur', 'Titre et montant obligatoires.'); return; }
    setSaving(true);
    try {
      await createDepense({ ...form, chantier_id: id, montant: parseFloat(form.montant) });
      setModal(false); setForm(BLANK); load();
    } catch (err) { Alert.alert('Erreur', err.response?.data?.error || 'Erreur.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (did) => Alert.alert('Supprimer', 'Supprimer cette dépense ?', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteDepense(did); load(); } }
  ]);

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Total */}
      <View className="bg-blue-600 mx-4 mt-4 rounded-2xl p-4 flex-row justify-between items-center">
        <Text className="text-white font-semibold">Total dépenses</Text>
        <Text className="text-white text-xl font-bold">{Number(data.total).toLocaleString('fr-FR')} Ar</Text>
      </View>

      <FlatList
        data={data.depenses}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-1">
              <View className="flex-1 mr-2">
                <Text className="font-bold text-gray-800">{item.titre}</Text>
                <Text className="text-xs text-gray-400 mt-1">{CATS_LABEL[item.categorie]}</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-blue-600">{Number(item.montant).toLocaleString('fr-FR')} Ar</Text>
                <Text className="text-xs text-gray-400">{new Date(item.date_depense).toLocaleDateString('fr-FR')}</Text>
              </View>
            </View>
            {item.description && <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>}
            <TouchableOpacity className="mt-2 items-end" onPress={() => handleDelete(item.id)}>
              <Text className="text-red-400 text-xs">🗑️ Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View className="items-center py-20"><Text className="text-gray-400">Aucune dépense</Text></View>}
      />

      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={() => setModal(true)}>
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Nouvelle dépense</Text>
            {[['Titre *', 'titre', {}], ['Montant (Ar) *', 'montant', { keyboardType: 'numeric' }], ['Date (YYYY-MM-DD)', 'date_depense', {}], ['Description', 'description', {}]].map(([label, field, props]) => (
              <View key={field} className="mb-3">
                <Text className="text-xs font-semibold text-gray-500 mb-1">{label}</Text>
                <TextInput className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50" value={form[field]} onChangeText={v => setForm({ ...form, [field]: v })} {...props} />
              </View>
            ))}
            <Text className="text-xs font-semibold text-gray-500 mb-2">Catégorie</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CATS.map(c => (
                <TouchableOpacity key={c} className={`px-3 py-1 rounded-full border ${form.categorie === c ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`} onPress={() => setForm({ ...form, categorie: c })}>
                  <Text className={`text-xs font-semibold ${form.categorie === c ? 'text-white' : 'text-gray-600'}`}>{CATS_LABEL[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 border border-gray-200 py-3 rounded-xl items-center" onPress={() => setModal(false)}>
                <Text className="text-gray-600 font-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity className={`flex-1 py-3 rounded-xl items-center ${saving ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleCreate} disabled={saving}>
                <Text className="text-white font-bold">{saving ? 'Ajout…' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
