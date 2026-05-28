import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', mot_de_passe: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.mot_de_passe) {
      Alert.alert('Erreur', 'Remplissez tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.mot_de_passe);
    } catch (err) {
      Alert.alert('Échec de connexion', err.response?.data?.error || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1 bg-blue-600" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="flex-1 justify-center items-center px-6 pt-20 pb-8">
          <Text className="text-6xl mb-4">🏗️</Text>
          <Text className="text-3xl font-bold text-white mb-2">Suivi Chantier</Text>
          <Text className="text-blue-200 text-base">Gestion professionnelle de chantiers</Text>
        </View>

        {/* Formulaire */}
        <View className="bg-white rounded-t-3xl px-6 pt-8 pb-12">
          <Text className="text-2xl font-bold text-gray-800 mb-6">Connexion</Text>

          <Text className="text-sm font-semibold text-gray-600 mb-1">Email</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-800 bg-gray-50"
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />

          <Text className="text-sm font-semibold text-gray-600 mb-1">Mot de passe</Text>
          <View className="flex-row border border-gray-200 rounded-xl mb-6 bg-gray-50">
            <TextInput
              className="flex-1 px-4 py-3 text-gray-800"
              placeholder="••••••••"
              secureTextEntry={!showPass}
              value={form.mot_de_passe}
              onChangeText={(v) => setForm({ ...form, mot_de_passe: v })}
            />
            <TouchableOpacity className="px-4 justify-center" onPress={() => setShowPass(!showPass)}>
              <Text className="text-gray-400">{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`py-4 rounded-xl items-center mb-4 ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold text-base">Se connecter</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push('/(auth)/register')}>
            <Text className="text-gray-500">
              Pas encore de compte ? <Text className="text-blue-600 font-semibold">Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
