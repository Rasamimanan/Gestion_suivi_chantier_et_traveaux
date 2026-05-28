import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getNotifications, marquerLu, marquerTousLus } from '../../services/api';

const TYPE_COLOR = { info: 'bg-blue-500', succes: 'bg-green-500', alerte: 'bg-amber-500', erreur: 'bg-red-500' };
const TYPE_EMOJI = { info: 'ℹ️', succes: '✅', alerte: '⚠️', erreur: '❌' };

export default function NotificationsScreen() {
  const router = useRouter();
  const [data, setData] = useState({ notifications: [], nonLues: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const r = await getNotifications(); setData(r.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleLu = async (id, lien) => {
    await marquerLu(id).catch(() => {});
    load();
    if (lien) router.push(lien);
  };

  const handleTousLus = async () => {
    await marquerTousLus().catch(() => {});
    load();
  };

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      {data.nonLues > 0 && (
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <Text className="text-gray-600">{data.nonLues} non lue{data.nonLues > 1 ? 's' : ''}</Text>
          <TouchableOpacity onPress={handleTousLus}>
            <Text className="text-blue-600 font-semibold">Tout marquer lu</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={data.notifications}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border ${!item.lu ? 'border-blue-200' : 'border-gray-100'}`}
            onPress={() => handleLu(item.id, item.lien)}
          >
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">{TYPE_EMOJI[item.type] || 'ℹ️'}</Text>
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className={`font-bold ${!item.lu ? 'text-gray-900' : 'text-gray-600'}`}>{item.titre}</Text>
                  {!item.lu && <View className="w-2 h-2 rounded-full bg-blue-500" />}
                </View>
                <Text className="text-gray-500 text-sm">{item.message}</Text>
                <Text className="text-gray-300 text-xs mt-1">
                  {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-4xl mb-3">🔔</Text>
            <Text className="text-gray-400">Aucune notification</Text>
          </View>
        }
      />
    </View>
  );
}
