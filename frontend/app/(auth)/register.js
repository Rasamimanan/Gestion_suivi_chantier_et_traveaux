import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (form.password !== form.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      Alert.alert(
        'Succès',
        res?.message || 'Compte créé avec succès'
      );

      router.replace('/(auth)/login');

    } catch (err) {
      Alert.alert(
        'Erreur',
        err?.response?.data?.error || err?.message || 'Erreur serveur'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        Inscription
      </Text>

      {/* NOM */}
      <TextInput
        style={input}
        placeholder="Nom"
        value={form.nom}
        onChangeText={(v) => setForm({ ...form, nom: v })}
      />

      {/* PRENOM */}
      <TextInput
        style={input}
        placeholder="Prénom"
        value={form.prenom}
        onChangeText={(v) => setForm({ ...form, prenom: v })}
      />

      {/* EMAIL */}
      <TextInput
        style={input}
        placeholder="Email"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(v) => setForm({ ...form, email: v })}
      />

      {/* PASSWORD */}
      <TextInput
        style={input}
        placeholder="Mot de passe"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })}
      />

      {/* CONFIRM */}
      <TextInput
        style={input}
        placeholder="Confirmer mot de passe"
        secureTextEntry
        value={form.confirm}
        onChangeText={(v) => setForm({ ...form, confirm: v })}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={button(loading)}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            Créer compte
          </Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

/* ================= STYLE ================= */
const input = {
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
};

const button = (loading) => ({
  backgroundColor: loading ? '#93c5fd' : '#2563eb',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
});