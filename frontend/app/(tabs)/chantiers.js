import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getChantiers } from '../../services/api';

const STATUT_COLOR = { non_commence: 'bg-gray-400', en_cours: 'bg-amber-500', termine: 'bg-green-500', suspendu: 'bg-red-400' };
const STATUT_LABEL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

export default function ChantiersScreen() {
  const router = useRouter();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtre, setFiltre] = useState('tous');

  const load = async () => {
    try {
      const res = await getChantiers();
      setChantiers(res.data);
    } catch {} finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtres = ['tous', 'en_cours', 'non_commence', 'termine', 'suspendu'];
  const data = filtre === 'tous' ? chantiers : chantiers.filter(c => c.statut === filtre);

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Filtres */}
      <View className="flex-row px-4 pt-3 pb-2">
        {filtres.map(f => (
          <TouchableOpacity
            key={f}
            className={`mr-2 px-3 py-1 rounded-full border ${filtre === f ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
            onPress={() => setFiltre(f)}
          >
            <Text className={`text-xs font-semibold ${filtre === f ? 'text-white' : 'text-gray-600'}`}>
              {f === 'tous' ? 'Tous' : STATUT_LABEL[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            onPress={() => router.push(`/chantier/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={2}>{item.nom}</Text>
              <View className={`px-3 py-1 rounded-full ${STATUT_COLOR[item.statut] || 'bg-gray-400'}`}>
                <Text className="text-white text-xs font-semibold">{STATUT_LABEL[item.statut] || item.statut}</Text>
              </View>
            </View>
            {item.adresse && <Text className="text-gray-500 text-sm mb-1">📍 {item.adresse}</Text>}
            {item.budget && <Text className="text-green-600 text-sm font-semibold">💰 {Number(item.budget).toLocaleString('fr-FR')} Ar</Text>}
            {item.date_debut && <Text className="text-gray-400 text-xs mt-1">📅 {new Date(item.date_debut).toLocaleDateString('fr-FR')}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View className="items-center py-20"><Text className="text-gray-400 text-base">Aucun chantier trouvé</Text></View>}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/chantier/create')}
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
