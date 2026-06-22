import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  approveUser,
  changeUserRole,
  deleteUserAdmin,
  getAdminStats,
  getAdminUsers,
  reactivateUser,
  rejectUser,
  suspendUser,
} from '../../services/api';

const ROLE_LABEL = {
  admin: '👑 Admin',
  chef_chantier: '🎯 Chef de chantier',
  utilisateur: '👤 Utilisateur',
};

const ROLES = ['admin', 'chef_chantier', 'utilisateur'];

const STATUT_BADGE = {
  actif: { label: 'Actif', className: 'bg-green-500' },
  en_attente: { label: 'En attente', className: 'bg-amber-500' },
  suspendu: { label: 'Suspendu', className: 'bg-red-500' },
};

export default function AdminUtilisateursScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtre, setFiltre] = useState('en_attente'); // 'en_attente' | 'tous'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);

  const load = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAdminUsers(),
        getAdminStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  // ================= ACCESS GUARD =================
  if (user?.role !== 'admin') {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Text className="text-5xl mb-4">🔒</Text>
        <Text className="text-lg font-bold text-gray-800 mb-2">Accès refusé</Text>
        <Text className="text-gray-500 text-center mb-6">
          Cette section est réservée aux administrateurs.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= ACTIONS =================
  const runAction = async (id, fn, confirmMessage) => {
    const doAction = async () => {
      setBusyId(id);
      try {
        await fn(id);
        await load();
      } catch (err) {
        Alert.alert('Erreur', err?.response?.data?.error || 'Action impossible');
      } finally {
        setBusyId(null);
      }
    };

    if (confirmMessage) {
      Alert.alert('Confirmation', confirmMessage, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'destructive', onPress: doAction },
      ]);
    } else {
      doAction();
    }
  };

  const handleApprove = (id) => runAction(id, approveUser);
  const handleReject = (id) =>
    runAction(id, rejectUser, "Rejeter et supprimer cette demande d'inscription ?");
  const handleSuspend = (id) =>
    runAction(id, suspendUser, "Suspendre ce compte ? L'utilisateur ne pourra plus se connecter.");
  const handleReactivate = (id) => runAction(id, reactivateUser);
  const handleDelete = (id) =>
    runAction(id, deleteUserAdmin, 'Supprimer définitivement ce compte ? Cette action est irréversible.');

  const handleChangeRole = async (id, role) => {
    setRoleModalUser(null);
    setBusyId(id);
    try {
      await changeUserRole(id, role);
      await load();
    } catch (err) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de changer le rôle');
    } finally {
      setBusyId(null);
    }
  };

  // ================= DATA =================
  const data = filtre === 'en_attente'
    ? users.filter((u) => u.statut === 'en_attente')
    : users;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* STATS */}
      {stats && (
        <View className="flex-row flex-wrap px-4 pt-4 pb-2">
          <StatCard label="Total" value={stats.total} color="bg-gray-700" />
          <StatCard label="Actifs" value={stats.actif} color="bg-green-600" />
          <StatCard label="En attente" value={stats.en_attente} color="bg-amber-500" />
          <StatCard label="Suspendus" value={stats.suspendu} color="bg-red-500" />
        </View>
      )}

      {/* FILTRES */}
      <View className="flex-row px-4 pb-2">
        {[['en_attente', `En attente (${stats?.en_attente ?? 0})`], ['tous', 'Tous les utilisateurs']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            className={`mr-2 px-3 py-2 rounded-full border ${filtre === key ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
            onPress={() => setFiltre(key)}
          >
            <Text className={`text-xs font-semibold ${filtre === key ? 'text-white' : 'text-gray-600'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-gray-400 text-base">Aucun utilisateur trouvé</Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = STATUT_BADGE[item.statut] || { label: item.statut, className: 'bg-gray-400' };
          const isSelf = item.id === user.id;
          const isBusy = busyId === item.id;

          return (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">

              {/* HEADER */}
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-base font-bold text-gray-800 flex-1 mr-2">
                  {item.prenom} {item.nom} {isSelf ? '(vous)' : ''}
                </Text>
                <View className={`px-3 py-1 rounded-full ${badge.className}`}>
                  <Text className="text-white text-xs font-semibold">{badge.label}</Text>
                </View>
              </View>

              <Text className="text-gray-500 text-sm mb-1">{item.email}</Text>

              <View className="flex-row items-center flex-wrap mb-3">
                <Text className="text-gray-600 text-xs mr-3">{ROLE_LABEL[item.role] || item.role}</Text>
              </View>

              {isBusy ? (
                <ActivityIndicator color="#3b82f6" />
              ) : (
                <View className="flex-row flex-wrap">

                  {/* EN ATTENTE -> Approuver / Rejeter */}
                  {item.statut === 'en_attente' && (
                    <>
                      <ActionBtn label="✅ Approuver" color="bg-green-600" onPress={() => handleApprove(item.id)} />
                      <ActionBtn label="❌ Rejeter" color="bg-red-500" onPress={() => handleReject(item.id)} />
                    </>
                  )}

                  {/* ACTIF -> Suspendre */}
                  {item.statut === 'actif' && !isSelf && (
                    <ActionBtn label="⏸ Suspendre" color="bg-amber-500" onPress={() => handleSuspend(item.id)} />
                  )}

                  {/* SUSPENDU -> Réactiver */}
                  {item.statut === 'suspendu' && (
                    <ActionBtn label="▶️ Réactiver" color="bg-green-600" onPress={() => handleReactivate(item.id)} />
                  )}

                  {/* CHANGER ROLE -> toujours dispo sauf en_attente */}
                  {item.statut !== 'en_attente' && (
                    <ActionBtn label="🔄 Changer rôle" color="bg-blue-600" onPress={() => setRoleModalUser(item)} />
                  )}

                  {/* SUPPRIMER -> jamais sur soi-même */}
                  {!isSelf && item.statut !== 'en_attente' && (
                    <ActionBtn label="🗑 Supprimer" color="bg-gray-700" onPress={() => handleDelete(item.id)} />
                  )}

                </View>
              )}
            </View>
          );
        }}
      />

      {/* MODAL CHANGER ROLE */}
      <Modal
        visible={!!roleModalUser}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalUser(null)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-8">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-gray-800 mb-1">Changer le rôle</Text>
            <Text className="text-gray-500 text-sm mb-4">
              {roleModalUser?.prenom} {roleModalUser?.nom}
            </Text>

            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                className={`py-3 px-4 rounded-xl mb-2 ${roleModalUser?.role === role ? 'bg-blue-600' : 'bg-gray-100'}`}
                onPress={() => handleChangeRole(roleModalUser.id, role)}
              >
                <Text className={`font-semibold ${roleModalUser?.role === role ? 'text-white' : 'text-gray-700'}`}>
                  {ROLE_LABEL[role]}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity className="py-3 items-center mt-1" onPress={() => setRoleModalUser(null)}>
              <Text className="text-gray-500 font-semibold">Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= COMPONENTS ================= */
function StatCard({ label, value, color }) {
  return (
    <View className={`${color} rounded-xl px-4 py-3 mr-2 mb-2`} style={{ minWidth: 80 }}>
      <Text className="text-white text-xl font-bold">{value ?? 0}</Text>
      <Text className="text-white text-xs">{label}</Text>
    </View>
  );
}

function ActionBtn({ label, color, onPress }) {
  return (
    <TouchableOpacity
      className={`${color} px-3 py-2 rounded-xl mr-2 mb-2`}
      onPress={onPress}
    >
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}