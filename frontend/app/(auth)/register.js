import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.mot_de_passe) {
      Alert.alert('Erreur', 'Remplissez tous les champs obligatoires.');
      return;
    }
    if (form.mot_de_passe !== form.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.mot_de_passe.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await register({ nom: form.nom, prenom: form.prenom, email: form.email.trim().toLowerCase(), mot_de_passe: form.mot_de_passe });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, ...props }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-600 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
        value={form[field]}
        onChangeText={(v) => setForm({ ...form, [field]: v })}
        {...props}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 60 }}>
        <TouchableOpacity className="mb-6" onPress={() => router.back()}>
          <Text className="text-blue-600 font-semibold">← Retour</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800 mb-6">Créer un compte</Text>

        <Field label="Nom *" field="nom" placeholder="Rakoto" />
        <Field label="Prénom *" field="prenom" placeholder="Jean" />
        <Field label="Email *" field="email" placeholder="jean@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Mot de passe *" field="mot_de_passe" placeholder="••••••••" secureTextEntry />
        <Field label="Confirmer le mot de passe *" field="confirm" placeholder="••••••••" secureTextEntry />

        <TouchableOpacity
          className={`py-4 rounded-xl items-center mt-2 ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Créer le compte</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
