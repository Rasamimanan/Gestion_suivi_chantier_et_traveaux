import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { assignerIntervenant, createEtape, getIntervenants } from '../../services/api';

const STATUTS = ['non_commence', 'en_cours', 'termine'];
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé' };

export default function CreateEtape() {
  const { chantier_id } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({ titre: '', description: '', statut: 'non_commence', ordre: '1', date_debut: '', date_fin: '' });
  const [intervenants, setIntervenants] = useState([]);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getIntervenants().then(r => setIntervenants(r.data)).catch(() => {}); }, []);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleSave = async () => {
    if (!form.titre) { Alert.alert('Erreur', 'Le titre est obligatoire.'); return; }
    setSaving(true);
    try {
      const res = await createEtape({ ...form, chantier_id, ordre: parseInt(form.ordre) || 1 });
      const etapeId = res.data.id;
      await Promise.all(selected.map(iid => assignerIntervenant(etapeId, iid)));
      router.back();
    } catch (err) { Alert.alert('Erreur', err.response?.data?.error || 'Erreur.'); }
    finally { setSaving(false); }
  };

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
          <F label="Titre *" field="titre" placeholder="Titre de l'étape" />
          <F label="Description" field="description" placeholder="Description (optionnel)" multiline numberOfLines={3} />
          <F label="Ordre" field="ordre" placeholder="1" keyboardType="numeric" />
          <F label="Date début (YYYY-MM-DD)" field="date_debut" placeholder="2024-01-15" />
          <F label="Date fin (YYYY-MM-DD)" field="date_fin" placeholder="2024-02-15" />

          <Text className="text-sm font-semibold text-gray-600 mb-2">Statut</Text>
          <View className="flex-row gap-2 mb-5">
            {STATUTS.map(s => (
              <TouchableOpacity key={s} className={`flex-1 py-2 rounded-xl border items-center ${form.statut === s ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`} onPress={() => setForm({ ...form, statut: s })}>
                <Text className={`text-xs font-semibold ${form.statut === s ? 'text-white' : 'text-gray-600'}`}>{SL[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {intervenants.length > 0 && (
            <>
              <Text className="text-sm font-semibold text-gray-600 mb-2">Intervenants</Text>
              {intervenants.map(i => (
                <TouchableOpacity key={i.id} className={`flex-row items-center p-3 rounded-xl mb-2 border ${selected.includes(i.id) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`} onPress={() => toggle(i.id)}>
                  <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${selected.includes(i.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selected.includes(i.id) && <Text className="text-white text-xs">✓</Text>}
                  </View>
                  <Text className="text-gray-800 font-medium">{i.nom} {i.prenom}</Text>
                  {i.role && <Text className="text-gray-400 text-xs ml-2">({i.role})</Text>}
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity className={`mt-4 py-4 rounded-xl items-center ${saving ? 'bg-blue-300' : 'bg-blue-600'}`} onPress={handleSave} disabled={saving}>
            <Text className="text-white font-bold text-base">{saving ? 'Création…' : "Créer l'étape"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
