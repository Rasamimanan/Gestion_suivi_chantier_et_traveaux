import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getEtapes } from '../../../services/api';

const SC = { non_commence: 'bg-gray-400', en_cours: 'bg-amber-500', termine: 'bg-green-500' };
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé' };

export default function EtapesChantier() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [etapes, setEtapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const r = await getEtapes(id); setEtapes(r.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={etapes}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100" onPress={() => router.push(`/etape/${item.id}`)}>
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-bold text-gray-800 flex-1 mr-2" numberOfLines={1}>{index + 1}. {item.titre}</Text>
              <View className={`px-2 py-1 rounded-full ${SC[item.statut] || 'bg-gray-400'}`}>
                <Text className="text-white text-xs">{SL[item.statut] || item.statut}</Text>
              </View>
            </View>
            {item.description && <Text className="text-gray-500 text-sm" numberOfLines={2}>{item.description}</Text>}
            {item.intervenants?.length > 0 && <Text className="text-gray-400 text-xs mt-1">👤 {item.intervenants.map(i => `${i.nom} ${i.prenom}`).join(', ')}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View className="items-center py-20"><Text className="text-gray-400">Aucune étape</Text></View>}
      />
      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg" onPress={() => router.push(`/etape/create?chantier_id=${id}`)}>
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
