import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { deleteChantier, getChantierStats } from '../../services/api';

const SC = { non_commence: 'bg-gray-400', en_cours: 'bg-amber-500', termine: 'bg-green-500', suspendu: 'bg-red-400' };
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

export default function ChantierDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getChantierStats(id)
      .then(r => setData(r.data))
      .catch(() => Alert.alert('Erreur', 'Chargement échoué.'))
      .finally(() => setLoading(false));
  }, [id]));

  const handleDelete = () => Alert.alert('Supprimer', 'Supprimer ce chantier ?', [
    { text: 'Annuler', style: 'cancel' },
    {
      text: 'Supprimer', style: 'destructive', onPress: async () => {
        await deleteChantier(id);
        router.back();
      }
    }
  ]);

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  const { chantier, stats } = data || {};

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">{chantier?.nom}</Text>
          <View className={`px-3 py-1 rounded-full ${SC[chantier?.statut] || 'bg-gray-400'}`}>
            <Text className="text-white text-xs font-semibold">
              {SL[chantier?.statut] || chantier?.statut}
            </Text>
          </View>
        </View>
        {chantier?.adresse && <Text className="text-gray-500 mb-1">📍 {chantier.adresse}</Text>}
        {chantier?.description && <Text className="text-gray-600 mb-2">{chantier.description}</Text>}
        {chantier?.budget && (
          <Text className="text-green-600 font-semibold">
            💰 Budget: {Number(chantier.budget).toLocaleString('fr-FR')} Ar
          </Text>
        )}
        {chantier?.date_debut && (
          <Text className="text-gray-400 text-sm mt-1">
            📅 Début: {new Date(chantier.date_debut).toLocaleDateString('fr-FR')}
          </Text>
        )}
        {chantier?.date_fin_prevue && (
          <Text className="text-gray-400 text-sm">
            🏁 Fin prévue: {new Date(chantier.date_fin_prevue).toLocaleDateString('fr-FR')}
          </Text>
        )}
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
            onPress={() => router.push(`/chantier/edit/${id}`)}
          >
            <Text className="text-white font-bold">✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-500 py-3 rounded-xl items-center"
            onPress={handleDelete}
          >
            <Text className="text-white font-bold">🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progression */}
      {stats && (
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <Text className="font-bold text-gray-700 mb-3">Progression des étapes</Text>
          <View className="flex-row items-center mb-2">
            <View className="flex-1 bg-gray-200 rounded-full h-3">
              <View
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${stats.progression}%` }}
              />
            </View>
            <Text className="ml-3 font-bold text-green-600">{stats.progression}%</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500 text-sm">📋 Total: {stats.total}</Text>
            <Text className="text-amber-500 text-sm">⚙️ En cours: {stats.en_cours}</Text>
            <Text className="text-green-500 text-sm">✅ Terminées: {stats.termine}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View className="gap-3">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-2xl items-center"
          onPress={() => router.push(`/chantier/${id}/etapes`)}
        >
          <Text className="text-white font-bold">📋 Voir les étapes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-600 py-4 rounded-2xl items-center"
          onPress={() => router.push(`/chantier/${id}/budget`)}
        >
          <Text className="text-white font-bold">💰 Suivi du budget</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white py-4 rounded-2xl items-center border border-blue-200"
          onPress={() => router.push(`/etape/create?chantier_id=${id}`)}
        >
          <Text className="text-blue-600 font-bold">+ Ajouter une étape</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}