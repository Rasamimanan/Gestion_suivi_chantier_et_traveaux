import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { getChantiers } from '../../services/api';
import { addRevenu } from '../../services/budgetApi';

const SOURCES = ['paiement_client', 'acompte', 'subvention', 'autre'];
const SOURCES_LABEL = { paiement_client: '💳 Paiement client', acompte: '💰 Acompte', subvention: '🏛️ Subvention', autre: '📦 Autre' };

export default function AddRevenuScreen() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState([]);
  const [loadingChantiers, setLoadingChantiers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ chantier_id: null, description: '', montant: '', source: 'paiement_client', date: new Date().toISOString().split('T')[0] });

  const loadChantiers = async () => {
    try {
      const res = await getChantiers();
      setChantiers(res.data);
      if (res.data.length && !form.chantier_id) setForm((f) => ({ ...f, chantier_id: res.data[0].id }));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les chantiers');
    } finally {
      setLoadingChantiers(false);
    }
  };

  useFocusEffect(useCallback(() => { loadChantiers(); }, []));

  const handleSubmit = async () => {
    if (!form.chantier_id) { Alert.alert('Erreur', 'Veuillez choisir un chantier'); return; }
    if (!form.montant || isNaN(parseFloat(form.montant))) { Alert.alert('Erreur', 'Montant invalide'); return; }

    setSaving(true);
    try {
      await addRevenu({ chantier_id: form.chantier_id, description: form.description, montant: parseFloat(form.montant), source: form.source, date: form.date });
      Alert.alert('Succès', 'Revenu ajouté', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  if (loadingChantiers) {
    return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-green-600 rounded-2xl p-5 mb-5">
        <Text className="text-white text-xl font-bold">➕ Nouveau revenu</Text>
      </View>

      <Text className="text-sm font-semibold text-gray-600 mb-2">Chantier</Text>
      <View className="flex-row flex-wrap mb-4">
        {chantiers.map((c) => (
          <TouchableOpacity key={c.id} className={`px-3 py-2 rounded-full border mr-2 mb-2 ${form.chantier_id === c.id ? 'bg-green-600 border-green-600' : 'border-gray-200 bg-white'}`} onPress={() => setForm({ ...form, chantier_id: c.id })}>
            <Text className={`text-xs font-semibold ${form.chantier_id === c.id ? 'text-white' : 'text-gray-600'}`}>{c.nom}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
      <TextInput className="border border-gray-200 rounded-xl px-4 py-3 bg-white mb-4" placeholder="ex: 1er versement client" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />

      <Text className="text-sm font-semibold text-gray-600 mb-1">Montant (Ar)</Text>
      <TextInput className="border border-gray-200 rounded-xl px-4 py-3 bg-white mb-4" placeholder="ex: 2000000" keyboardType="numeric" value={form.montant} onChangeText={(v) => setForm({ ...form, montant: v })} />

      <Text className="text-sm font-semibold text-gray-600 mb-1">Date (AAAA-MM-JJ)</Text>
      <TextInput className="border border-gray-200 rounded-xl px-4 py-3 bg-white mb-4" placeholder="2026-06-19" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} />

      <Text className="text-sm font-semibold text-gray-600 mb-2">Source</Text>
      <View className="flex-row flex-wrap mb-6">
        {SOURCES.map((s) => (
          <TouchableOpacity key={s} className={`px-3 py-2 rounded-full border mr-2 mb-2 ${form.source === s ? 'bg-green-600 border-green-600' : 'border-gray-200 bg-white'}`} onPress={() => setForm({ ...form, source: s })}>
            <Text className={`text-xs font-semibold ${form.source === s ? 'text-white' : 'text-gray-600'}`}>{SOURCES_LABEL[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity className={`py-4 rounded-xl items-center mb-4 ${saving ? 'bg-green-300' : 'bg-green-600'}`} onPress={handleSubmit} disabled={saving}>
        <Text className="text-white font-bold">{saving ? 'Ajout…' : 'Ajouter le revenu'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-3 items-center" onPress={() => router.back()}>
        <Text className="text-gray-500 font-semibold">Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}