import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { assignerIntervenant, createEtape, getIntervenants } from '../../services/api';

const STATUTS = [
  { value: 'non_commence', label: 'Non commencé' },
  { value: 'en_cours',     label: 'En cours'     },
  { value: 'termine',      label: 'Terminé'       },
];

export default function CreateEtape() {
  const { chantier_id } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    titre:       '',
    description: '',
    statut:      'non_commence',
    ordre:       '1',
    date_debut:  '',
    date_fin:    '',
  });

  const [intervenants, setIntervenants] = useState([]);
  const [selected,     setSelected]     = useState([]);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    getIntervenants()
      .then(r => setIntervenants(r.data))
      .catch(() => {});
  }, []);

  const toggleIntervenant = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleSave = async () => {
    if (!form.titre.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire.');
      return;
    }

    if (!chantier_id) {
      Alert.alert('Erreur', 'Chantier introuvable.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        chantier_id,
        titre:       form.titre.trim(),
        description: form.description.trim(),
        statut:      form.statut,
        ordre:       parseInt(form.ordre, 10) || 1,
        // ✅ colonnes réelles de la table etapes : date_debut et date_fin
        date_debut:  form.date_debut || null,
        date_fin:    form.date_fin   || null,
      };

      const res    = await createEtape(payload);
      const etapeId = res.data.id;

      // Associer les intervenants sélectionnés
      if (selected.length > 0) {
        await Promise.all(selected.map(iid => assignerIntervenant(etapeId, iid)));
      }

      router.back();

    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de créer l\'étape.');
    } finally {
      setSaving(false);
    }
  };

  // Composant champ de saisie réutilisable
  const Field = ({ label, field, ...props }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-600 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
        value={form[field]}
        onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
        placeholderTextColor="#9ca3af"
        {...props}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

          {/* ─── Champs texte ─── */}
          <Field
            label="Titre *"
            field="titre"
            placeholder="Titre de l'étape"
            autoFocus
          />

          <Field
            label="Description"
            field="description"
            placeholder="Description (optionnel)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 70 }}
          />

          <Field
            label="Ordre d'affichage"
            field="ordre"
            placeholder="1"
            keyboardType="numeric"
          />

          {/* ─── Dates ─── */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Date début</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
                placeholder="AAAA-MM-JJ"
                placeholderTextColor="#9ca3af"
                value={form.date_debut}
                onChangeText={v => setForm(f => ({ ...f, date_debut: v }))}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-600 mb-1">Date fin</Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
                placeholder="AAAA-MM-JJ"
                placeholderTextColor="#9ca3af"
                value={form.date_fin}
                onChangeText={v => setForm(f => ({ ...f, date_fin: v }))}
              />
            </View>
          </View>

          {/* ─── Statut ─── */}
          <Text className="text-sm font-semibold text-gray-600 mb-2">Statut initial</Text>
          <View className="flex-row gap-2 mb-5">
            {STATUTS.map(s => (
              <TouchableOpacity
                key={s.value}
                onPress={() => setForm(f => ({ ...f, statut: s.value }))}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  form.statut === s.value
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-xs font-semibold ${form.statut === s.value ? 'text-white' : 'text-gray-600'}`}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── Intervenants ─── */}
          {intervenants.length > 0 && (
            <>
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Intervenants
              </Text>
              {intervenants.map(i => (
                <TouchableOpacity
                  key={i.id}
                  onPress={() => toggleIntervenant(i.id)}
                  className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                    selected.includes(i.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Checkbox */}
                  <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${
                    selected.includes(i.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {selected.includes(i.id) && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>

                  {/* Nom */}
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">
                      {i.nom} {i.prenom || ''}
                    </Text>
                    {i.role ? (
                      <Text className="text-gray-400 text-xs">{i.role}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ─── Bouton sauvegarder ─── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`mt-4 py-4 rounded-xl items-center flex-row justify-center ${
              saving ? 'bg-blue-300' : 'bg-blue-600'
            }`}
          >
            {saving && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text className="text-white font-bold text-base">
              {saving ? 'Création…' : "Créer l'étape"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}