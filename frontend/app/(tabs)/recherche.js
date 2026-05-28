import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { rechercher } from '../../services/api';

const SC = { non_commence: 'bg-gray-400', en_cours: 'bg-amber-500', termine: 'bg-green-500', suspendu: 'bg-red-400' };
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu' };

export default function RechercheScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await rechercher(text);
      setResults(res.data);
    } catch {} finally { setLoading(false); }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Barre de recherche */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
          <TextInput
            className="flex-1 text-gray-800"
            placeholder="Rechercher un chantier, étape, intervenant..."
            value={query}
            onChangeText={search}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults(null); }}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && <ActivityIndicator size="small" color="#3b82f6" className="mt-4" />}

      {results && (
        <FlatList
          data={[
            ...(results.chantiers.length ? [{ type: 'header', label: `🏗️ Chantiers (${results.chantiers.length})` }] : []),
            ...results.chantiers.map(c => ({ type: 'chantier', ...c })),
            ...(results.etapes.length ? [{ type: 'header', label: `📋 Étapes (${results.etapes.length})` }] : []),
            ...results.etapes.map(e => ({ type: 'etape', ...e })),
            ...(results.intervenants.length ? [{ type: 'header', label: `👷 Intervenants (${results.intervenants.length})` }] : []),
            ...results.intervenants.map(i => ({ type: 'intervenant', ...i })),
          ]}
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-400 text-4xl mb-3">🔍</Text>
              <Text className="text-gray-400">Aucun résultat pour "{query}"</Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'header') return (
              <Text className="text-sm font-bold text-gray-500 mt-4 mb-2 uppercase tracking-wide">{item.label}</Text>
            );
            if (item.type === 'chantier') return (
              <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => router.push(`/chantier/${item.id}`)}
              >
                <Text className="text-2xl mr-3">🏗️</Text>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800" numberOfLines={1}>{item.nom}</Text>
                  <Text className="text-gray-500 text-sm" numberOfLines={1}>📍 {item.adresse}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${SC[item.statut] || 'bg-gray-400'}`}>
                  <Text className="text-white text-xs">{SL[item.statut] || item.statut}</Text>
                </View>
              </TouchableOpacity>
            );
            if (item.type === 'etape') return (
              <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100 flex-row items-center"
                onPress={() => router.push(`/etape/${item.id}`)}
              >
                <Text className="text-2xl mr-3">📋</Text>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800" numberOfLines={1}>{item.titre}</Text>
                  <Text className="text-blue-500 text-sm">{item.chantier_nom}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${SC[item.statut] || 'bg-gray-400'}`}>
                  <Text className="text-white text-xs">{SL[item.statut] || item.statut}</Text>
                </View>
              </TouchableOpacity>
            );
            if (item.type === 'intervenant') return (
              <View className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100 flex-row items-center">
                <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold">{item.nom?.[0]}{item.prenom?.[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{item.nom} {item.prenom}</Text>
                  {item.role && <Text className="text-blue-600 text-sm">{item.role}</Text>}
                  {item.entreprise && <Text className="text-gray-500 text-xs">{item.entreprise}</Text>}
                </View>
              </View>
            );
            return null;
          }}
        />
      )}

      {!results && !loading && (
        <View className="items-center justify-center flex-1">
          <Text className="text-5xl mb-4">🔍</Text>
          <Text className="text-gray-400 text-base">Tapez au moins 2 caractères</Text>
        </View>
      )}
    </View>
  );
}
