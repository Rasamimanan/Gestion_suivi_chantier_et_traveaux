import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/api';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const ROLE_LABEL = { admin: '👑 Administrateur', chef_chantier: '🎯 Chef de chantier', utilisateur: '👤 Utilisateur' };

  const handlePassword = async () => {
    if (!form.ancien || !form.nouveau || !form.confirm) { Alert.alert('Erreur', 'Remplissez tous les champs.'); return; }
    if (form.nouveau !== form.confirm) { Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.'); return; }
    if (form.nouveau.length < 6) { Alert.alert('Erreur', 'Minimum 6 caractères.'); return; }
    setSaving(true);
    try {
      await changePassword({ ancien_mot_de_passe: form.ancien, nouveau_mot_de_passe: form.nouveau });
      Alert.alert('Succès', 'Mot de passe modifié.');
      setForm({ ancien: '', nouveau: '', confirm: '' });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur.');
    } finally { setSaving(false); }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-blue-600 rounded-2xl p-6 mb-5 items-center">
        <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-3">
          <Text className="text-blue-600 text-3xl font-bold">{user?.nom?.[0]}{user?.prenom?.[0]}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{user?.prenom} {user?.nom}</Text>
        <Text className="text-blue-200 mt-1">{user?.email}</Text>
        <View className="bg-white/20 px-4 py-1 rounded-full mt-2">
          <Text className="text-white text-sm">{ROLE_LABEL[user?.role] || user?.role}</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-800 mb-4">Changer le mot de passe</Text>
        {[['Ancien mot de passe', 'ancien'], ['Nouveau mot de passe', 'nouveau'], ['Confirmer le nouveau', 'confirm']].map(([label, field]) => (
          <View key={field} className="mb-3">
            <Text className="text-sm font-semibold text-gray-600 mb-1">{label}</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800"
              secureTextEntry
              placeholder="••••••••"
              value={form[field]}
              onChangeText={v => setForm({ ...form, [field]: v })}
            />
          </View>
        ))}
        <TouchableOpacity
          className={`py-3 rounded-xl items-center mt-2 ${saving ? 'bg-blue-300' : 'bg-blue-600'}`}
          onPress={handlePassword}
          disabled={saving}
        >
          <Text className="text-white font-bold">{saving ? 'Modification…' : 'Modifier le mot de passe'}</Text>
        </TouchableOpacity>
      </View>

      {user?.role === 'admin' && (
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl p-5 mb-5 flex-row items-center justify-between"
          onPress={() => router.push('/admin/utilisateurs')}
        >
          <View>
            <Text className="text-white font-bold text-base">⚙️ Gestion des utilisateurs</Text>
            <Text className="text-blue-100 text-xs mt-1">Valider, suspendre, changer les rôles</Text>
          </View>
          <Text className="text-white text-xl">›</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="bg-red-500 py-4 rounded-2xl items-center"
        onPress={() => Alert.alert('Déconnexion', 'Confirmer ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Déconnexion', style: 'destructive', onPress: logout },
        ])}
      >
        <Text className="text-white font-bold text-base">Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}