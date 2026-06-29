import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { deletePhoto, getEtape, getPhotos, updateEtape, uploadPhoto } from '../../services/api';

// ✅ FIX : URL du serveur dérivée de la variable d'environnement
// 'http://10.x.x.x:3000/api' → 'http://10.x.x.x:3000'
// 'http://localhost:3000' ne fonctionne JAMAIS sur un vrai téléphone
import { SERVER_URL } from '../../services/api';
const SERVER_BASE = SERVER_URL;

function getPhotoUrl(urlFromDb) {
  if (!urlFromDb) return null;
  if (urlFromDb.startsWith('http')) return urlFromDb;
  const clean = urlFromDb.startsWith('/') ? urlFromDb : `/${urlFromDb}`;
  return `${SERVER_BASE}${clean}`;
}

const STATUTS = [
  { value: 'non_commence', label: 'Non commencé', color: '#9ca3af', bg: '#f3f4f6' },
  { value: 'en_cours',     label: 'En cours',     color: '#3b82f6', bg: '#eff6ff' },
  { value: 'termine',      label: 'Terminé',       color: '#22c55e', bg: '#f0fdf4' },
];

export default function EtapeDetail() {
  const { id } = useLocalSearchParams();
  const [etape,              setEtape]              = useState(null);
  const [photos,             setPhotos]             = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [statutModal,        setStatutModal]        = useState(false);
  const [photoModal,         setPhotoModal]         = useState(false);
  const [updating,           setUpdating]           = useState(false);
  const [selectedImage,      setSelectedImage]      = useState(null);
  const [photoDescription,   setPhotoDescription]   = useState('');
  const [uploading,          setUploading]          = useState(false);

  useEffect(() => { loadData(); }, [id]);

  /* ─── chargement ─── */
  const loadData = async () => {
    try {
      const [etapeRes, photosRes] = await Promise.all([getEtape(id), getPhotos(id)]);
      setEtape(etapeRes.data);
      setPhotos(photosRes.data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  /* ─── statut ─── */
  const handleChangeStatut = async (newStatut) => {
    setUpdating(true);
    try {
      await updateEtape(id, { ...etape, statut: newStatut });
      setEtape({ ...etape, statut: newStatut });
      setStatutModal(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    } finally {
      setUpdating(false);
    }
  };

  /* ─── galerie ─── */
  const pickImage = async () => {
    try {
      // ✅ permission obligatoire sur Android
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', "L'accès à la galerie est nécessaire.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setPhotoDescription('');
        setPhotoModal(true);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  /* ─── upload ─── */
  const handleUploadPhoto = async () => {
    if (!selectedImage) { Alert.alert('Erreur', 'Aucune image sélectionnée'); return; }

    setUploading(true);
    try {
      // ✅ extension et MIME type réels de l'image
      const ext      = selectedImage.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

      const formData = new FormData();
      formData.append('etape_id',    String(id));
      formData.append('description', photoDescription || '');
      formData.append('photo', { uri: selectedImage, type: mimeType, name: `photo_${Date.now()}.${ext}` });

      const response = await uploadPhoto(formData);
      setPhotos([response.data, ...photos]);
      setPhotoModal(false);
      setSelectedImage(null);
      setPhotoDescription('');
      Alert.alert('Succès', 'Photo ajoutée avec succès');
    } catch (error) {
      Alert.alert('Erreur', error?.response?.data?.error || "Impossible d'ajouter la photo");
    } finally {
      setUploading(false);
    }
  };

  /* ─── suppression ─── */
  const handleDeletePhoto = (photoId) => {
    Alert.alert('Supprimer la photo', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await deletePhoto(photoId);
            setPhotos(photos.filter(p => p.id !== photoId));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer la photo');
          }
        },
      },
    ]);
  };

  /* ─── helpers ─── */
  const getStatut = (val) => STATUTS.find(s => s.value === val) || STATUTS[0];

  /* ─── loading ─── */
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const statut = getStatut(etape?.statut);

  return (
    <View className="flex-1 bg-gray-50">

      {/* ══════════ INFO ÉTAPE ══════════ */}
      <View className="bg-white p-4 border-b border-gray-200">

        <Text className="text-xl font-bold text-gray-800 mb-1">{etape?.titre}</Text>
        {etape?.description ? (
          <Text className="text-gray-500 text-sm mb-3">{etape.description}</Text>
        ) : null}

        {/* Bouton statut */}
        <TouchableOpacity
          onPress={() => setStatutModal(true)}
          style={{ backgroundColor: statut.color }}
          className="px-4 py-2 rounded-full mb-3 flex-row items-center justify-center self-start"
        >
          <Text className="text-white text-sm font-semibold">{statut.label}</Text>
          <Text className="text-white ml-2 text-xs">▼</Text>
        </TouchableOpacity>

        {/* Intervenants */}
        {etape?.intervenants?.length > 0 && (
          <View className="mb-2">
            <Text className="text-xs font-semibold text-gray-600 mb-1">Intervenants :</Text>
            <View className="flex-row flex-wrap" style={{ gap: 6 }}>
              {etape.intervenants.map(i => (
                <View key={i.id} className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 text-xs">👤 {i.nom} {i.prenom}</Text>
                  {i.role ? <Text className="text-blue-500 text-xs">{i.role}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dates */}
        {etape?.date_debut ? (
          <Text className="text-gray-400 text-xs">
            📅 {new Date(etape.date_debut).toLocaleDateString('fr-FR')}
            {etape.date_fin ? ` → ${new Date(etape.date_fin).toLocaleDateString('fr-FR')}` : ''}
          </Text>
        ) : null}
      </View>

      {/* ══════════ PHOTOS ══════════ */}
      <View className="flex-1 p-4">

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-semibold text-gray-700">
            Photos ({photos.length})
          </Text>
          <TouchableOpacity onPress={pickImage} className="bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold text-sm">+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {photos.length > 0 ? (
          <FlatList
            data={photos}
            numColumns={2}
            keyExtractor={item => item.id.toString()}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const photoUrl = getPhotoUrl(item.url);
              return (
                <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', elevation: 1 }}>

                  {/* ✅ style inline pour dimensions fixes — className seul ne marche pas sur Image */}
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={{ width: '100%', height: 150, backgroundColor: '#e5e7eb' }}
                      resizeMode="cover"
                      onError={() => console.warn('Image non chargée :', photoUrl)}
                    />
                  ) : (
                    <View style={{ width: '100%', height: 150, backgroundColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>📷 Indisponible</Text>
                    </View>
                  )}

                  {item.description ? (
                    <View style={{ padding: 6, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                      <Text style={{ color: '#4b5563', fontSize: 11 }} numberOfLines={2}>{item.description}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={() => handleDeletePhoto(item.id)}
                    style={{ padding: 8, borderTopWidth: 1, borderTopColor: '#fee2e2', backgroundColor: '#fff5f5', alignItems: 'center' }}
                  >
                    <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '600' }}>🗑️ Supprimer</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-3">📷</Text>
            <Text className="text-gray-400 font-medium">Aucune photo</Text>
            <Text className="text-gray-300 text-sm mt-1">Appuyez sur + Ajouter pour commencer</Text>
          </View>
        )}
      </View>

      {/* ══════════ MODAL STATUT ══════════ */}
      <Modal animationType="slide" transparent visible={statutModal} onRequestClose={() => setStatutModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>

            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 6 }}>
              Changer le statut
            </Text>
            <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              Statut actuel : <Text style={{ fontWeight: 'bold', color: statut.color }}>{statut.label}</Text>
            </Text>

            {STATUTS.map(s => (
              <TouchableOpacity
                key={s.value}
                onPress={() => handleChangeStatut(s.value)}
                disabled={updating}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  padding: 14, borderRadius: 12, marginBottom: 8,
                  backgroundColor: etape?.statut === s.value ? s.bg : '#f9fafb',
                  borderWidth: 1,
                  borderColor: etape?.statut === s.value ? s.color : '#e5e7eb',
                }}
              >
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: s.color, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#1f2937' }}>{s.label}</Text>
                </View>
                {etape?.statut === s.value && (
                  <Text style={{ color: s.color, fontWeight: 'bold' }}>✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setStatutModal(false)}
              disabled={updating}
              style={{ marginTop: 8, backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#374151', fontWeight: '600' }}>Annuler</Text>
            </TouchableOpacity>

            {updating && (
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                <ActivityIndicator color="#3b82f6" />
                <Text style={{ marginLeft: 8, color: '#6b7280' }}>Mise à jour...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════ MODAL AJOUT PHOTO ══════════ */}
      <Modal animationType="slide" transparent visible={photoModal} onRequestClose={() => setPhotoModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>

            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 }}>
              Ajouter une photo
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>

              {/* Aperçu */}
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{ width: '100%', height: 220, borderRadius: 12, marginBottom: 16, backgroundColor: '#e5e7eb' }}
                  resizeMode="cover"
                />
              ) : null}

              {/* Légende */}
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
                Légende (optionnel)
              </Text>
              <TextInput
                value={photoDescription}
                onChangeText={setPhotoDescription}
                placeholder="Ex: Vue d'ensemble des fondations..."
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
                style={{
                  backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
                  borderRadius: 10, padding: 12, fontSize: 13, color: '#1f2937', minHeight: 80,
                }}
              />
              <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
                {photoDescription.length}/200 caractères
              </Text>
            </ScrollView>

            {/* Boutons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setPhotoModal(false); setSelectedImage(null); setPhotoDescription(''); }}
                disabled={uploading}
                style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 14, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#374151', fontWeight: '600' }}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadPhoto}
                disabled={uploading}
                style={{ flex: 1, backgroundColor: uploading ? '#93c5fd' : '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center' }}
              >
                {uploading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '600' }}>Ajouter</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}