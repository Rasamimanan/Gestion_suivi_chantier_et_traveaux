// app/(tabs)/budget.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getBudgetChantier, getChantiers } from '../../services/api';

export default function BudgetScreen() {
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('utilisateur');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Charger utilisateur
      const userJson = await AsyncStorage.getItem('user');

      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          setRole(user?.role || 'utilisateur');
        } catch (e) {
          console.log('Erreur parsing user:', e);
          setRole('utilisateur');
        }
      } else {
        setRole('utilisateur');
      }

      // Charger les chantiers
      const chantiersData = await getChantiers();

      // Charger le budget de chaque chantier
      const chantiersWithBudget = await Promise.all(
        chantiersData.map(async (chantier) => {
          try {
            const budget = await getBudgetChantier(chantier.id);

            return {
              ...chantier,
              budget,
            };
          } catch (error) {
            console.log(
              `Erreur budget chantier ${chantier.id}:`,
              error.message
            );

            return {
              ...chantier,
              budget: null,
            };
          }
        })
      );

      setChantiers(chantiersWithBudget);
    } catch (error) {
      console.error('Erreur chargement budget:', error);
      Alert.alert('Erreur', 'Impossible de charger les budgets');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6">
        <Text className="text-white text-3xl font-bold">
          💰 Budget
        </Text>
        <Text className="text-blue-100 mt-2">
          Suivi budgétaire par chantier
        </Text>
      </View>

      {/* Contenu */}
      <View className="p-4">
        {loading ? (
          <Text className="text-center text-gray-600 py-8">
            Chargement...
          </Text>
        ) : chantiers.length === 0 ? (
          <Text className="text-center text-gray-600 py-8">
            Aucun chantier
          </Text>
        ) : (
          chantiers.map((chantier) => (
            <Link
              key={chantier.id}
              href={`/chantier/${chantier.id}/budget`}
              asChild
            >
              <TouchableOpacity className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900">
                      {chantier.nom}
                    </Text>

                    {chantier.budget && (
                      <>
                        <View className="mt-3">
                          <View className="flex-row justify-between mb-1">
                            <Text className="text-sm text-gray-600">
                              Dépenses :{' '}
                              {(
                                chantier.budget.depenses_par_categorie?.reduce(
                                  (sum, cat) =>
                                    sum +
                                    parseFloat(
                                      cat.total_depenses || 0
                                    ),
                                  0
                                ) || 0
                              ).toLocaleString('fr-MG')}{' '}
                              FMG
                            </Text>

                            <Text className="text-sm font-bold text-blue-600">
                              {chantier.budget
                                .pourcentage_utilise || 0}
                              %
                            </Text>
                          </View>

                          {/* Progress bar */}
                          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <View
                              className="bg-blue-600 h-full"
                              style={{
                                width: `${Math.min(
                                  chantier.budget
                                    ?.pourcentage_utilise || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </View>
                        </View>

                        {/* Statistiques */}
                        <View className="mt-3 flex-row justify-between">
                          <View>
                            <Text className="text-xs text-gray-600">
                              Budget
                            </Text>
                            <Text className="text-sm font-bold text-gray-900">
                              {(
                                chantier.budget?.budget?.alloue || 0
                              ).toLocaleString('fr-MG')}{' '}
                              FMG
                            </Text>
                          </View>

                          <View>
                            <Text className="text-xs text-gray-600">
                              Revenus
                            </Text>
                            <Text className="text-sm font-bold text-green-600">
                              +
                              {(
                                chantier.budget?.budget?.revenu || 0
                              ).toLocaleString('fr-MG')}{' '}
                              FMG
                            </Text>
                          </View>

                          <View>
                            <Text className="text-xs text-gray-600">
                              Solde
                            </Text>
                            <Text
                              className={`text-sm font-bold ${
                                (chantier.budget?.budget?.solde || 0) >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {(
                                chantier.budget?.budget?.solde || 0
                              ).toLocaleString('fr-MG')}{' '}
                              FMG
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

      {/* Boutons admin */}
      {['admin', 'chef_chantier'].includes(role) && (
        <View className="px-4 pb-8">
          <Link href="/budget/add-depense" asChild>
            <TouchableOpacity className="bg-red-600 rounded-lg py-4 mb-3">
              <Text className="text-white text-center font-bold">
                ➕ Ajouter Dépense
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/budget/add-revenu" asChild>
            <TouchableOpacity className="bg-green-600 rounded-lg py-4">
              <Text className="text-white text-center font-bold">
                ➕ Ajouter Revenu
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      {/* Lecture seule */}
      {role === 'utilisateur' && (
        <View className="bg-blue-100 border border-blue-300 rounded-lg p-4 m-4">
          <Text className="text-blue-900 text-center">
            📖 Mode lecture seule - Contactez un administrateur
            pour modifier le budget.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}