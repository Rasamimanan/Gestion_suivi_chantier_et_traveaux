import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirm: '',
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !form.nom ||
      !form.prenom ||
      !form.email ||
      !form.mot_de_passe
    ) {
      Alert.alert('Erreur', 'Remplissez tous les champs obligatoires.');
      return;
    }

    if (form.mot_de_passe !== form.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (form.mot_de_passe.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit faire au moins 6 caractères.'
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email.trim().toLowerCase(),
        mot_de_passe: form.mot_de_passe,
      });
    } catch (err) {
      Alert.alert(
        'Erreur',
        err?.response?.data?.error || 'Erreur réseau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          paddingTop: 60,
        }}
      >
        <TouchableOpacity
          style={{ marginBottom: 24 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#2563eb', fontWeight: '600' }}>
            ← Retour
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 24,
          }}
        >
          Créer un compte
        </Text>

        {/* Nom */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 5 }}>Nom *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
            }}
            placeholder="Rakoto"
            value={form.nom}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, nom: v }))
            }
          />
        </View>

        {/* Prenom */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 5 }}>Prénom *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
            }}
            placeholder="Jean"
            value={form.prenom}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, prenom: v }))
            }
          />
        </View>

        {/* Email */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 5 }}>Email *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
            }}
            placeholder="jean@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) =>
              setForm((prev) => ({ ...prev, email: v }))
            }
          />
        </View>

        {/* Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 5 }}>Mot de passe *</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
            }}
            placeholder="••••••••"
            secureTextEntry
            value={form.mot_de_passe}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                mot_de_passe: v,
              }))
            }
          />
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 5 }}>
            Confirmer le mot de passe *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 12,
            }}
            placeholder="••••••••"
            secureTextEntry
            value={form.confirm}
            onChangeText={(v) =>
              setForm((prev) => ({
                ...prev,
                confirm: v,
              }))
            }
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
          }}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              Créer le compte
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}