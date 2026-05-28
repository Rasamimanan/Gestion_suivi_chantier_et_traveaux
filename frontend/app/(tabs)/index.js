import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDashboard } from '../../services/api';

const StatCard = ({ emoji, label, value, color }) => (
  <View className={`flex-1 ${color} rounded-2xl p-4 mx-1 items-center`}>
    <Text className="text-2xl">{emoji}</Text>
    <Text className="text-2xl font-bold text-white mt-1">{value}</Text>
    <Text className="text-white text-xs opacity-80 text-center">{label}</Text>
  </View>
);

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getDashboard();
      setStats(res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Bienvenue */}
      <View className="bg-blue-600 rounded-2xl p-5 mb-5">
        <Text className="text-white text-lg font-semibold">Bonjour, {user?.prenom} 👋</Text>
        <Text className="text-blue-200 text-sm mt-1">{user?.role?.replace('_', ' ')}</Text>
      </View>

      {/* Chantiers stats */}
      {stats && (
        <>
          <Text className="text-lg font-bold text-gray-700 mb-3">Chantiers</Text>
          <View className="flex-row mb-3">
            <StatCard emoji="🏗️" label="Total" value={stats.chantiers.total} color="bg-blue-500" />
            <StatCard emoji="🟡" label="En cours" value={stats.chantiers.en_cours} color="bg-amber-500" />
            <StatCard emoji="✅" label="Terminés" value={stats.chantiers.termine} color="bg-green-500" />
          </View>

          <Text className="text-lg font-bold text-gray-700 mb-3 mt-2">Étapes</Text>
          <View className="flex-row mb-5">
            <StatCard emoji="📋" label="Total" value={stats.etapes.total} color="bg-purple-500" />
            <StatCard emoji="⚙️" label="En cours" value={stats.etapes.en_cours} color="bg-orange-500" />
            <StatCard emoji="✅" label="Terminées" value={stats.etapes.termine} color="bg-teal-500" />
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-100">
            <Text className="text-3xl mr-3">👷</Text>
            <View>
              <Text className="text-2xl font-bold text-gray-800">{stats.intervenants}</Text>
              <Text className="text-gray-500 text-sm">Intervenants actifs</Text>
            </View>
          </View>
        </>
      )}

      {/* Actions rapides */}
      <Text className="text-lg font-bold text-gray-700 mb-3">Actions rapides</Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 bg-blue-600 py-4 rounded-xl items-center"
          onPress={() => router.push('/chantier/create')}
        >
          <Text className="text-white font-bold">+ Chantier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-green-600 py-4 rounded-xl items-center"
          onPress={() => router.push('/(tabs)/chantiers')}
        >
          <Text className="text-white font-bold">Voir tout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
