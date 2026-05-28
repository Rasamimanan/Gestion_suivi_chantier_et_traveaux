import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createIntervenant, deleteIntervenant, getIntervenants } from '../../services/api';

const BLANK = { nom: '', prenom: '', role: '', telephone: '', email: '', entreprise: '', specialite: '' };

export default function IntervenantsScreen() {
  const [intervenants, setIntervenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const r = await getIntervenants(); setIntervenants(r.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleCreate = async () => {
    if (!form.nom || !form.prenom) { Alert.alert('Erreur', 'Nom et prénom obligatoires.'); return; }
    setSaving(true);
    try { await createIntervenant(form); setModal(false); setForm(BLANK); load(); }
    catch (err) { Alert.alert('Erreur', err.response?.data?.error || 'Erreur.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id, nom) => Alert.alert('Supprimer', `Supprimer ${nom} ?`, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteIntervenant(id); load(); } }
  ]);

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={intervenants}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center">
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 text-lg font-bold">{item.nom?.[0]}{item.prenom?.[0]}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">{item.nom} {item.prenom}</Text>
              {item.role && <Text className="text-blue-600 text-sm">{item.role}</Text>}
              {item.entreprise && <Text className="text-gray-500 text-xs">🏢 {item.entreprise}</Text>}
              {item.telephone && <Text className="text-gray-500 text-xs">📞 {item.telephone}</Text>}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, `${item.nom} ${item.prenom}`)}>
              <Text className="text-red-400 text-xl">🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View className="items-center py-20"><Text className="text-gray-400">Aucun intervenant</Text></View>}
      />
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={() => setModal(true)}>
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">Nouvel intervenant</Text>
            {[['Nom *', 'nom'], ['Prénom *', 'prenom'], ['Rôle', 'role'], ['Téléphone', 'telephone'], ['Email', 'email'], ['Entreprise', 'entreprise'], ['Spécialité', 'specialite']].map(([label, field]) => (
              <View key={field} className="mb-3">
                <Text className="text-xs font-semibold text-gray-500 mb-1">{label}</Text>
                <TextInput
                  className="border border-gray-200 rounded-xl px-3 py-2 text-gray-800 bg-gray-50"
                  value={form[field]}
                  onChangeText={v => setForm({ ...form, [field]: v })}
                  keyboardType={field === 'email' ? 'email-address' : field === 'telephone' ? 'phone-pad' : 'default'}
                />
              </View>
            ))}
            <View className="flex-row gap-3 mt-3">
              <TouchableOpacity className="flex-1 border border-gray-200 py-3 rounded-xl items-center" onPress={() => setModal(false)}>
                <Text className="text-gray-600 font-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity className={`flex-1 py-3 rounded-xl items-center ${saving ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleCreate} disabled={saving}>
                <Text className="text-white font-bold">{saving ? 'Création…' : 'Créer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
