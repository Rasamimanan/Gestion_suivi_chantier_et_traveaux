import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { assignerIntervenant, createEtape, getIntervenants } from '../../services/api';

const STATUTS = [
  { value: 'non_commence', label: '⏳ Non commencé' },
  { value: 'en_cours',     label: '⚡ En cours'     },
  { value: 'termine',      label: '✅ Terminé'       },
];

// Validation du format de date (AAAA-MM-JJ)
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Composant de champ personnalisé avec gestion des styles natifs
const Field = ({ label, value, onChangeText, error, isRequired, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label} {isRequired && <Text style={{ color: '#ef4444' }}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9ca3af"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>
          ⚠️ {error}
        </Text>
      )}
    </View>
  );
};

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

  const [errors, setErrors] = useState({});
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

  // Contrôle et validation des champs
  const validateField = (field, value) => {
    let errorMsg = '';

    if (field === 'titre' && !value.trim()) {
      errorMsg = 'Le titre est obligatoire.';
    }

    if (field === 'ordre' && value && isNaN(Number(value))) {
      errorMsg = 'Veuillez saisir un nombre valide.';
    }

    if ((field === 'date_debut' || field === 'date_fin') && value.trim()) {
      if (!DATE_REGEX.test(value)) {
        errorMsg = 'Format invalide (attendu: AAAA-MM-JJ).';
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
    return !errorMsg;
  };

  const updateForm = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    validateField(field, value);
  };

  const handleSave = async () => {
    const isTitreValid = validateField('titre', form.titre);
    const isOrdreValid = validateField('ordre', form.ordre);
    const isDebutValid = validateField('date_debut', form.date_debut);
    const isFinValid = validateField('date_fin', form.date_fin);

    if (!isTitreValid || !isOrdreValid || !isDebutValid || !isFinValid) {
      Alert.alert('Attention', 'Veuillez corriger les erreurs dans le formulaire.');
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
        date_debut:  form.date_debut || null,
        date_fin:    form.date_fin   || null,
      };

      const res    = await createEtape(payload);
      const etapeId = res.data.id;

      if (selected.length > 0) {
        await Promise.all(selected.map(iid => assignerIntervenant(etapeId, iid)));
      }

      router.back();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || "Impossible de créer l'étape.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Nouvelle Étape</Text>

        <View style={styles.card}>
          
          <Field
            label="Titre"
            value={form.titre}
            onChangeText={v => updateForm('titre', v)}
            placeholder="Titre de l'étape"
            error={errors.titre}
            isRequired
            autoFocus
          />

          <Field
            label="Description"
            value={form.description}
            onChangeText={v => updateForm('description', v)}
            placeholder="Ajouter des détails..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[styles.input, { minHeight: 80 }]}
          />

          <Field
            label="Ordre d'affichage"
            value={form.ordre}
            onChangeText={v => updateForm('ordre', v)}
            placeholder="1"
            keyboardType="numeric"
            error={errors.ordre}
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Date début"
                placeholder="2026-06-29"
                value={form.date_debut}
                onChangeText={v => updateForm('date_debut', v)}
                error={errors.date_debut}
                maxLength={10}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Date fin"
                placeholder="2026-07-15"
                value={form.date_fin}
                onChangeText={v => updateForm('date_fin', v)}
                error={errors.date_fin}
                maxLength={10}
              />
            </View>
          </View>

          {/* Section Statut */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionLabel}>Statut initial</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {STATUTS.map(s => {
                const isSelected = form.statut === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => updateForm('statut', s.value)}
                    activeOpacity={0.7}
                    style={[
                      styles.statutButton,
                      isSelected ? styles.statutButtonSelected : styles.statutButtonUnselected
                    ]}
                  >
                    <Text style={[styles.statutText, isSelected ? { color: '#fff' } : { color: '#4b5563' }]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section Intervenants */}
          {intervenants.length > 0 && (
            <View style={styles.intervenantSection}>
              <Text style={styles.sectionLabel}>Intervenants assignés</Text>
              {intervenants.map(i => {
                const isChecked = selected.includes(i.id);
                return (
                  <TouchableOpacity
                    key={i.id}
                    onPress={() => toggleIntervenant(i.id)}
                    activeOpacity={0.8}
                    style={[styles.intervenantItem, isChecked && styles.intervenantItemChecked]}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Text style={styles.checkboxCheckmark}>✓</Text>}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 14 }}>
                        {i.nom} {i.prenom || ''}
                      </Text>
                      {i.role && (
                        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{i.role}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Bouton de sauvegarde */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
            style={[styles.saveButton, saving ? { backgroundColor: '#93c5fd' } : { backgroundColor: '#2563eb' }]}
          >
            {saving && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.saveButtonText}>
              {saving ? 'Création en cours…' : "Créer l'étape"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Feuille de style native isolée
const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#1f2937',
    fontSize: 14,
  },
  inputFocused: {
    borderColor: '#2563eb',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ef4444',
    marginTop: 4,
    paddingLeft: 4,
  },
  statutButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statutButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statutButtonUnselected: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  statutText: {
    fontSize: 12,
    fontWeight: '700',
  },
  intervenantSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  intervenantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  intervenantItemChecked: {
    backgroundColor: 'rgba(37, 99, 235, 0.03)',
    borderColor: '#bfdbfe',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxCheckmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});