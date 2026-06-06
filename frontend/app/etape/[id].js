import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deletePhoto, getEtape, getPhotos, updateEtape, uploadPhoto } from '../../services/api';

export default function EtapeDetail() {
  const { id } = useLocalSearchParams();
  const [etape, setEtape] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statutModalVisible, setStatutModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoDescription, setPhotoDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // API URL - À adapter selon votre configuration
  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [etapeRes, photosRes] = await Promise.all([
        getEtape(id),
        getPhotos(id)
      ]);
      setEtape(etapeRes.data);
      setPhotos(photosRes.data);
      console.log('Photos chargées:', photosRes.data);
    } catch (error) {
      console.error('Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatut = async (newStatut) => {
    setUpdating(true);
    try {
      const updated = {
        ...etape,
        statut: newStatut
      };
      await updateEtape(id, updated);
      setEtape(updated);
      setStatutModalVisible(false);
    } catch (error) {
      console.error('Erreur statut:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setPhotoDescription('');
        setPhotoModalVisible(true);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Aucune image sélectionnée');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('etape_id', id);
      formData.append('description', photoDescription || '');
      formData.append('photo', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`
      });

      console.log('Upload en cours...');
      const response = await uploadPhoto(formData);
      
      console.log('Response upload:', response.data);
      
      // Ajouter à la liste
      setPhotos([response.data, ...photos]);
      setPhotoModalVisible(false);
      setSelectedImage(null);
      setPhotoDescription('');
      
      Alert.alert('Succès', 'Photo ajoutée avec succès');
    } catch (error) {
      console.error('Erreur upload:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              setPhotos(photos.filter(p => p.id !== photoId));
              Alert.alert('Succès', 'Photo supprimée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la photo');
            }
          }
        }
      ]
    );
  };

  const getPhotoUrl = (urlFromDb) => {
    if (!urlFromDb) return null;
    
    // Si c'est déjà une URL complète
    if (urlFromDb.startsWith('http')) {
      return urlFromDb;
    }
    
    // Si c'est un chemin relatif
    if (urlFromDb.startsWith('/uploads')) {
      return `${API_BASE_URL}${urlFromDb}`;
    }
    
    // Sinon ajouter /uploads/
    return `${API_BASE_URL}/uploads/${urlFromDb}`;
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'non_commence': return 'bg-gray-400';
      case 'en_cours': return 'bg-blue-500';
      case 'termine': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatutText = (statut) => {
    switch (statut) {
      case 'non_commence': return 'Non commencé';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Info de l'étape */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {etape?.titre}
            </Text>
            {etape?.description && (
              <Text className="text-gray-600 text-sm">{etape.description}</Text>
            )}
          </View>
        </View>

        {/* Bouton Statut - Cliquable pour modifier */}
        <TouchableOpacity
          onPress={() => setStatutModalVisible(true)}
          className={`${getStatutColor(etape?.statut)} px-4 py-2 rounded-full mb-3 flex-row items-center justify-center`}
        >
          <Text className="text-white text-sm font-semibold">
            {getStatutText(etape?.statut)}
          </Text>
          <Text className="text-white ml-2">→</Text>
        </TouchableOpacity>

        {/* Intervenants */}
        {etape?.intervenants && etape.intervenants.length > 0 && (
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Intervenants:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {etape.intervenants.map((intervenant) => (
                <View 
                  key={intervenant.id}
                  className="bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <Text className="text-blue-800 text-xs">
                    👤 {intervenant.nom} {intervenant.prenom}
                  </Text>
                  <Text className="text-blue-600 text-xs">
                    {intervenant.role}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dates */}
        {etape?.date_debut && (
          <Text className="text-gray-500 text-xs">
            📅 {new Date(etape.date_debut).toLocaleDateString('fr-FR')}
            {etape.date_fin && 
              ` → ${new Date(etape.date_fin).toLocaleDateString('fr-FR')}`
            }
          </Text>
        )}
      </View>

      {/* Section Photos */}
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-700">
            Photos ({photos.length})
          </Text>
          <TouchableOpacity
            onPress={pickImage}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {photos.length > 0 ? (
          <FlatList
            data={photos}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => {
              const photoUrl = getPhotoUrl(item.url);
              
              return (
                <View className="flex-1 bg-white rounded-lg overflow-hidden shadow-sm">
                  {/* Image avec gestion d'erreur */}
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      className="w-full h-40 bg-gray-200"
                      resizeMode="cover"
                      onError={(e) => {
                        console.log('Erreur chargement image:', photoUrl);
                        console.log('Error details:', e.nativeEvent.error);
                      }}
                      onLoad={() => {
                        console.log('Image chargée:', photoUrl);
                      }}
                    />
                  ) : (
                    <View className="w-full h-40 bg-gray-300 justify-center items-center">
                      <Text className="text-gray-600 text-xs">📷 Pas d'image</Text>
                    </View>
                  )}
                  
                  {/* Légende */}
                  {item.description && (
                    <View className="bg-gray-50 p-2 border-t border-gray-100">
                      <Text className="text-gray-700 text-xs font-semibold mb-1">
                        Légende:
                      </Text>
                      <Text className="text-gray-600 text-xs" numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                  )}

                  {/* Bouton supprimer */}
                  <TouchableOpacity
                    onPress={() => handleDeletePhoto(item.id)}
                    className="bg-red-50 p-2 flex-row items-center justify-center border-t border-gray-100"
                  >
                    <Text className="text-red-600 text-xs font-semibold">
                      🗑️ Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 mb-2">Aucune photo</Text>
            <Text className="text-gray-400 text-sm">
              Appuyez sur + Ajouter pour commencer
            </Text>
          </View>
        )}
      </View>

      {/* Modal Modification Statut */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statutModalVisible}
        onRequestClose={() => setStatutModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Changer le statut
            </Text>

            <Text className="text-sm text-gray-600 mb-4">
              Statut actuel: <Text className="font-bold">{getStatutText(etape?.statut)}</Text>
            </Text>

            <ScrollView className="mb-4">
              {/* Non commencé */}
              <TouchableOpacity
                onPress={() => handleChangeStatut('non_commence')}
                disabled={updating}
                className={`p-4 rounded-lg mb-2 flex-row items-center ${
                  etape?.statut === 'non_commence' 
                    ? 'bg-gray-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <View className="w-4 h-4 rounded-full bg-gray-400 mr-3" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Non commencé</Text>
                  <Text className="text-gray-500 text-xs">L'étape n'a pas commencé</Text>
                </View>
                {etape?.statut === 'non_commence' && (
                  <Text className="text-green-500 font-bold">✓</Text>
                )}
              </TouchableOpacity>

              {/* En cours */}
              <TouchableOpacity
                onPress={() => handleChangeStatut('en_cours')}
                disabled={updating}
                className={`p-4 rounded-lg mb-2 flex-row items-center ${
                  etape?.statut === 'en_cours' 
                    ? 'bg-blue-50' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <View className="w-4 h-4 rounded-full bg-blue-500 mr-3" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">En cours</Text>
                  <Text className="text-gray-500 text-xs">L'étape est en cours de réalisation</Text>
                </View>
                {etape?.statut === 'en_cours' && (
                  <Text className="text-green-500 font-bold">✓</Text>
                )}
              </TouchableOpacity>

              {/* Terminé */}
              <TouchableOpacity
                onPress={() => handleChangeStatut('termine')}
                disabled={updating}
                className={`p-4 rounded-lg mb-2 flex-row items-center ${
                  etape?.statut === 'termine' 
                    ? 'bg-green-50' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <View className="w-4 h-4 rounded-full bg-green-500 mr-3" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Terminé</Text>
                  <Text className="text-gray-500 text-xs">L'étape est terminée</Text>
                </View>
                {etape?.statut === 'termine' && (
                  <Text className="text-green-500 font-bold">✓</Text>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Boutons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setStatutModalVisible(false)}
                disabled={updating}
                className="flex-1 bg-gray-200 p-3 rounded-lg"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Annuler
                </Text>
              </TouchableOpacity>
            </View>

            {updating && (
              <View className="mt-3 flex-row justify-center">
                <ActivityIndicator color="#3b82f6" />
                <Text className="ml-2 text-gray-600">Mise à jour...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Ajouter Photo avec Légende */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Ajouter une photo
            </Text>

            <ScrollView className="mb-4">
              {/* Aperçu de l'image */}
              {selectedImage && (
                <View className="mb-4">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-full h-64 rounded-lg"
                    resizeMode="cover"
                  />
                  <Text className="text-gray-500 text-xs text-center mt-2">
                    Image redimensionnée automatiquement
                  </Text>
                </View>
              )}

              {/* Champ description */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Légende (optionnel)
                </Text>
                <TextInput
                  value={photoDescription}
                  onChangeText={setPhotoDescription}
                  placeholder="Ex: Vue d'ensemble des fondations..."
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                  textAlignVertical="top"
                />
                <Text className="text-gray-400 text-xs mt-1">
                  {photoDescription.length}/200 caractères
                </Text>
              </View>

              {/* Info */}
              <View className="bg-blue-50 p-3 rounded-lg mb-4">
                <Text className="text-blue-800 text-xs">
                  💡 Astuce: Ajoutez une description pour mémoriser les détails de la photo
                </Text>
              </View>
            </ScrollView>

            {/* Boutons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setPhotoModalVisible(false)}
                disabled={uploading}
                className="flex-1 bg-gray-200 p-3 rounded-lg"
              >
                <Text className="text-gray-800 text-center font-semibold">
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadPhoto}
                disabled={uploading}
                className="flex-1 bg-blue-500 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  {uploading ? 'Upload...' : 'Ajouter'}
                </Text>
              </TouchableOpacity>
            </View>

            {uploading && (
              <View className="mt-3 flex-row justify-center">
                <ActivityIndicator color="#3b82f6" />
                <Text className="ml-2 text-gray-600">Upload en cours...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}