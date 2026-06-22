import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { getChantiers } from '../../services/api';
import { getBudgetChantier, getUserRole } from '../../services/budgetApi';

export default function BudgetScreen() {
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('utilisateur');

  const loadData = async () => {
    try {
      setLoading(true);
      const r = await getUserRole();
      setRole(r);

      const chantiersRes = await getChantiers();
      const chantiersData = chantiersRes.data;

      const chantiersWithBudget = await Promise.all(
        chantiersData.map(async (chantier) => {
          try {
            const budget = await getBudgetChantier(chantier.id);
            return { ...chantier, budget };
          } catch (error) {
            return { ...chantier, budget: null };
          }
        })
      );

      setChantiers(chantiersWithBudget);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les budgets');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 px-4 py-6">
        <Text className="text-white text-3xl font-bold">💰 Budget</Text>
        <Text className="text-blue-100 mt-2">Suivi budgétaire par chantier</Text>
      </View>

      <View className="p-4">
        {loading ? (
          <Text className="text-center text-gray-600 py-8">Chargement...</Text>
        ) : chantiers.length === 0 ? (
          <Text className="text-center text-gray-600 py-8">Aucun chantier</Text>
        ) : (
          chantiers.map((chantier) => (
            <Link key={chantier.id} href={`/chantier/${chantier.id}/budget`} asChild>
              <TouchableOpacity className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">{chantier.nom}</Text>

                    {chantier.budget && (
                      <>
                        <View className="mt-3">
                          <View className="flex-row justify-between mb-1">
                            <Text className="text-sm text-gray-600">
                              Dépenses : {(chantier.budget?.budget?.utilise || 0).toLocaleString('fr-FR')} Ar
                            </Text>
                            <Text className="text-sm font-bold text-blue-600">
                              {chantier.budget?.budget?.pourcentage_utilise || 0}%
                            </Text>
                          </View>
                          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <View
                              className="bg-blue-600 h-full"
                              style={{ width: `${Math.min(chantier.budget?.budget?.pourcentage_utilise || 0, 100)}%` }}
                            />
                          </View>
                        </View>

                        <View className="mt-3 flex-row justify-between">
                          <View>
                            <Text className="text-xs text-gray-600">Budget</Text>
                            <Text className="text-sm font-bold text-gray-900">
                              {(chantier.budget?.budget?.alloue || 0).toLocaleString('fr-FR')} Ar
                            </Text>
                          </View>
                          <View>
                            <Text className="text-xs text-gray-600">Revenus</Text>
                            <Text className="text-sm font-bold text-green-600">
                              +{(chantier.budget?.budget?.revenu || 0).toLocaleString('fr-FR')} Ar
                            </Text>
                          </View>
                          <View>
                            <Text className="text-xs text-gray-600">Solde</Text>
                            <Text className={`text-sm font-bold ${(chantier.budget?.budget?.solde || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(chantier.budget?.budget?.solde || 0).toLocaleString('fr-FR')} Ar
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))
        )}
      </View>

      {['admin', 'chef_chantier'].includes(role) && (
        <View className="px-4 pb-8">
          <Link href="/budget/add-depense" asChild>
            <TouchableOpacity className="bg-red-600 rounded-lg py-4 mb-3">
              <Text className="text-white text-center font-bold">➕ Ajouter Dépense</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/budget/add-revenu" asChild>
            <TouchableOpacity className="bg-green-600 rounded-lg py-4">
              <Text className="text-white text-center font-bold">➕ Ajouter Revenu</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      {role === 'utilisateur' && (
        <View className="bg-blue-100 border border-blue-300 rounded-lg p-4 m-4">
          <Text className="text-blue-900 text-center">
            📖 Mode lecture seule - Contactez un administrateur pour modifier le budget.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}