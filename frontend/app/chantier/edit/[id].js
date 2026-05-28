import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getChantier, updateChantier } from '../../../services/api';

const STATUTS = ['non_commence', 'en_cours', 'termine', 'suspendu'];
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

export default function EditChantier() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getChantier(id).then(r => {
      const c = r.data;
      setForm({ nom: c.nom || '', adresse: c.adresse || '', description: c.description || '', statut: c.statut || 'non_commence', budget: c.budget ? String(c.budget) : '', date_debut: fmt(c.date_debut), date_fin_prevue: fmt(c.date_fin_prevue), date_fin_reelle: fmt(c.date_fin_reelle) });
    }).catch(() => Alert.alert('Erreur', 'Chargement échoué.'));
  }, [id]);

  const handleSave = async () => {
    if (!form.nom || !form.adresse) { Alert.alert('Erreur', 'Nom et adresse obligatoires.'); return; }
    setSaving(true);
    try {
      await updateChantier(id, { ...form, budget: form.budget ? parseFloat(form.budget) : null });
      router.back();
    } catch (err) { Alert.alert('Erreur', err.response?.data?.error || 'Erreur.'); }
    finally { setSaving(false); }
  };

  if (!form) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  const F = ({ label, field, ...props }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-600 mb-1">{label}</Text>
      <TextInput className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800" value={form[field]} onChangeText={v => setForm({ ...form, [field]: v })} {...props} />
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <F label="Nom *" field="nom" placeholder="Nom du chantier" />
          <F label="Adresse *" field="adresse" placeholder="Adresse complète" />
          <F label="Description" field="description" placeholder="Description" multiline numberOfLines={3} />
          <F label="Budget (Ar)" field="budget" placeholder="ex: 5000000" keyboardType="numeric" />
          <F label="Date début (YYYY-MM-DD)" field="date_debut" placeholder="2024-01-15" />
          <F label="Date fin prévue (YYYY-MM-DD)" field="date_fin_prevue" placeholder="2024-06-30" />
          <F label="Date fin réelle (YYYY-MM-DD)" field="date_fin_reelle" placeholder="2024-06-28" />

          <Text className="text-sm font-semibold text-gray-600 mb-2">Statut</Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {STATUTS.map(s => (
              <TouchableOpacity key={s} className={`px-4 py-2 rounded-xl border ${form.statut === s ? 'bg-blue-600 border-blue-600' : 'border-gray-200 bg-white'}`} onPress={() => setForm({ ...form, statut: s })}>
                <Text className={`text-xs font-semibold ${form.statut === s ? 'text-white' : 'text-gray-600'}`}>{SL[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity className={`py-4 rounded-xl items-center ${saving ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleSave} disabled={saving}>
            <Text className="text-white font-bold text-base">{saving ? 'Sauvegarde…' : 'Enregistrer'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
