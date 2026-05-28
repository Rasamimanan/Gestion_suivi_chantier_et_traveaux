import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { createCommentaire, deleteCommentaire, getCommentaires } from '../../../services/api';

export default function CommentairesEtape() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [texte, setTexte] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    try { const r = await getCommentaires(id); setCommentaires(r.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const handleSend = async () => {
    if (!texte.trim()) return;
    setSending(true);
    try { await createCommentaire({ etape_id: id, contenu: texte.trim() }); setTexte(''); load(); }
    catch (err) { Alert.alert('Erreur', err.response?.data?.error || 'Erreur.'); }
    finally { setSending(false); }
  };

  const handleDelete = (cid) => Alert.alert('Supprimer', 'Supprimer ce commentaire ?', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteCommentaire(cid); load(); } }
  ]);

  if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={commentaires}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => {
          const isMe = item.utilisateur_id === user?.id;
          return (
            <View className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
              <View className={`rounded-2xl p-4 max-w-xs shadow-sm ${isMe ? 'bg-blue-600 rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'}`}>
                {!isMe && <Text className="text-blue-600 text-xs font-bold mb-1">{item.nom} {item.prenom}</Text>}
                <Text className={isMe ? 'text-white' : 'text-gray-800'}>{item.contenu}</Text>
                <Text className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{new Date(item.created_at).toLocaleString('fr-FR')}</Text>
              </View>
              {isMe && <TouchableOpacity className="mt-1" onPress={() => handleDelete(item.id)}><Text className="text-red-400 text-xs">🗑️ Supprimer</Text></TouchableOpacity>}
            </View>
          );
        }}
        ListEmptyComponent={<View className="items-center py-20"><Text className="text-4xl mb-3">💬</Text><Text className="text-gray-400">Aucun commentaire</Text></View>}
      />
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex-row items-end gap-2">
        <TextInput className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 bg-gray-50 text-gray-800 max-h-24" placeholder="Écrire un commentaire..." value={texte} onChangeText={setTexte} multiline />
        <TouchableOpacity className={`w-10 h-10 rounded-full items-center justify-center ${sending || !texte.trim() ? 'bg-gray-300' : 'bg-blue-600'}`} onPress={handleSend} disabled={sending || !texte.trim()}>
          <Text className="text-white">➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
