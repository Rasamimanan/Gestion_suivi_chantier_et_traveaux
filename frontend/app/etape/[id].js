import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { deleteEtape, deletePhoto, getEtape, getPhotos, uploadPhoto } from '../../services/api';
import { SERVER_URL } from '../../services/api';

const SC = { non_commence: 'bg-gray-400', en_cours: 'bg-amber-500', termine: 'bg-green-500' };
const SL = { non_commence: 'Non commencé', en_cours: 'En cours', termine: 'Terminé' };

export default function EtapeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [etape, setEtape] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const [e, p] = await Promise.all([getEtape(id), getPhotos(id)]);
      setEtape(e.data); setPhotos(p.data);
    } catch { Alert.alert('Erreur', 'Chargement échoué.'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission refusée'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const fd = new FormData();
      fd.append('photo', { uri: asset.uri, type: 'image/jpeg', name: 'photo.jpg' });
      fd.append('etape_id', id);
      await uploadPhoto(fd);
      const p = await getPhotos(id);
      setPhotos(p.data);
    } catch { Alert.alert('Erreur', "Upload échoué."); }
    finally { setUploading(false); }
  };

  const handleDeletePhoto = (pid) => Alert.alert('Supprimer', 'Supprimer cette photo ?', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => { await deletePhoto(pid); const p = await getPhotos(id); setPhotos(p.data); } }
  ]);

  const handleDeleteEtape = () => Alert.alert('Supprimer', "Supprimer cette étape ?", [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteEtape(id); router.back(); } }
  ]);

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Info étape */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-xl font-bold text-gray-800 flex-1 mr-2">{etape?.titre}</Text>
          <View className={`px-3 py-1 rounded-full ${SC[etape?.statut] || 'bg-gray-400'}`}>
            <Text className="text-white text-xs font-semibold">{SL[etape?.statut] || etape?.statut}</Text>
          </View>
        </View>
        {etape?.description && <Text className="text-gray-600 mb-3">{etape.description}</Text>}
        {etape?.date_debut && <Text className="text-gray-400 text-sm">📅 Début: {new Date(etape.date_debut).toLocaleDateString('fr-FR')}</Text>}
        {etape?.date_fin && <Text className="text-gray-400 text-sm">🏁 Fin: {new Date(etape.date_fin).toLocaleDateString('fr-FR')}</Text>}

        {/* Intervenants */}
        {etape?.intervenants?.length > 0 && (
          <View className="mt-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">👷 Intervenants</Text>
            {etape.intervenants.map(i => (
              <View key={i.id} className="bg-blue-50 px-3 py-2 rounded-lg mb-1 flex-row items-center">
                <Text className="text-blue-800 font-medium">{i.nom} {i.prenom}</Text>
                {i.role && <Text className="text-blue-500 text-xs ml-2">({i.role})</Text>}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity className="mt-4 bg-red-500 py-3 rounded-xl items-center" onPress={handleDeleteEtape}>
          <Text className="text-white font-bold">🗑️ Supprimer l'étape</Text>
        </TouchableOpacity>
      </View>

      {/* Photos */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-700">📸 Photos ({photos.length})</Text>
          <TouchableOpacity className={`px-4 py-2 rounded-xl ${uploading ? 'bg-gray-400' : 'bg-blue-600'}`} onPress={pickImage} disabled={uploading}>
            <Text className="text-white font-semibold text-sm">{uploading ? 'Envoi…' : '+ Photo'}</Text>
          </TouchableOpacity>
        </View>

        {photos.length === 0
          ? <View className="items-center py-8"><Text className="text-gray-400">Aucune photo</Text></View>
          : <View className="flex-row flex-wrap gap-2">
              {photos.map(photo => (
                <TouchableOpacity key={photo.id} className="relative" onLongPress={() => handleDeletePhoto(photo.id)}>
                  <Image source={{ uri: `${SERVER_URL}${photo.url}` }} style={{ width: 100, height: 100, borderRadius: 12 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
        }
        {photos.length > 0 && <Text className="text-gray-400 text-xs mt-3 text-center">Appui long pour supprimer une photo</Text>}
      </View>
    </ScrollView>
  );
}
