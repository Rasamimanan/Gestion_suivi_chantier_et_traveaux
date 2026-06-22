import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyEmail, resendCode } = useAuth();

  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!email || !code) {
      Alert.alert('Erreur', 'Veuillez saisir votre email et le code reçu');
      return;
    }

    setLoading(true);

    try {
      const data = await verifyEmail(email, code);
      Alert.alert('Email confirmé', data?.message || 'Votre email a été confirmé');
      router.replace('/(auth)/login');

    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Code invalide';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    setResending(true);

    try {
      const data = await resendCode(email);
      Alert.alert('Code renvoyé', data?.message || 'Un nouveau code a été envoyé');
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Impossible de renvoyer le code";
      Alert.alert('Erreur', message);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#2563eb' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>Confirmation email</Text>
          <Text style={{ color: '#dbeafe', marginTop: 5, textAlign: 'center' }}>
            Saisissez le code à 6 chiffres reçu par email
          </Text>
        </View>

        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>

          <Text style={{ marginBottom: 5, fontWeight: '600' }}>Email</Text>
          <TextInput
            style={input}
            placeholder="exemple@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={{ marginBottom: 5, fontWeight: '600', marginTop: 10 }}>Code de validation</Text>
          <TextInput
            style={[input, { fontSize: 22, letterSpacing: 8, textAlign: 'center' }]}
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={handleVerify}
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
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmer</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>
              {resending ? 'Envoi en cours…' : 'Renvoyer le code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: 'center', color: '#555' }}>Retour à la connexion</Text>
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