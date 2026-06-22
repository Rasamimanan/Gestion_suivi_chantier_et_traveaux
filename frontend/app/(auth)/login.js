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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      await login(form.email, form.password);
      Alert.alert('Succès', 'Connexion réussie');
      router.replace('/(tabs)');

    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Erreur de connexion';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#2563eb' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Connexion</Text>
          <Text style={{ color: '#dbeafe', marginTop: 5 }}>Suivi Chantier App</Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>

          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Email</Text>
          <TextInput
            style={input}
            placeholder="exemple@email.com"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={{ marginBottom: 5, fontWeight: '600', marginTop: 10 }}>Mot de passe</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[input, { paddingRight: 45 }]}
              placeholder="••••••••"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 10, top: 12 }}
            >
              <Text style={{ color: '#2563eb', fontWeight: '600' }}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#93c5fd' : '#2563eb',
              padding: 15,
              borderRadius: 10,
              marginTop: 20,
              alignItems: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: 'center', color: '#555' }}>
              Pas de compte ?{' '}
              <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>S’inscrire</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: 12 }}>
            <Text style={{ textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 12,
};