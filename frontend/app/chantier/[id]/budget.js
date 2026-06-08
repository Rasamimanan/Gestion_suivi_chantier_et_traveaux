// app/chantier/[id]/budget.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getBudgetChantier, getDepenses, getRevenus } from '../../../services/budgetApi';

export default function ChantierBudgetScreen() {
  const { id } = useLocalSearchParams();
  const [budget, setBudget] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [revenus, setRevenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('utilisateur');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);

      // Charger rôle
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setRole(user.role);
      }

      // Charger budget
      const budgetData = await getBudgetChantier(id);
      setBudget(budgetData);

      // Charger dépenses et revenus
      const [depensesData, revenusData] = await Promise.all([
        getDepenses({ chantierId: id }),
        getRevenus({ chantierId: id })
      ]);

      setDepenses(depensesData);
      setRevenus(revenusData);
    } catch (error) {
      console.error('Erreur chargement budget:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!budget) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Budget non trouvé</Text>
      </View>
    );
  }

  // === VUE D'ENSEMBLE ===
  if (activeTab === 'overview') {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-600 px-4 py-6">
          <Text className="text-white text-2xl font-bold">💰 Budget du Chantier</Text>
        </View>

        {/* Cartes principales */}
        <View className="p-4">
          {/* Gauge budget */}
          <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
            <Text className="text-gray-700 font-bold mb-2">Utilisation du Budget</Text>
            
            <View className="bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
              <View
                className="bg-blue-600 h-full"
                style={{
                  width: `${Math.min(budget.budget?.pourcentage_utilise || 0, 100)}%`
                }}
              />
            </View>
            
            <Text className="text-2xl font-bold text-blue-600">
              {budget.budget?.pourcentage_utilise || 0}%
            </Text>
          </View>

          {/* Cartes KPI */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xs text-gray-600">Budget Alloué</Text>
              <Text className="text-lg font-bold text-gray-900 mt-1">
                {(budget.budget?.alloue || 0).toLocaleString('fr-MG')} FMG
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xs text-gray-600">Dépenses</Text>
              <Text className="text-lg font-bold text-red-600 mt-1">
                {(budget.budget?.utilise || 0).toLocaleString('fr-MG')} FMG
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xs text-gray-600">Revenus</Text>
              <Text className="text-lg font-bold text-green-600 mt-1">
                +{(budget.budget?.revenu || 0).toLocaleString('fr-MG')} FMG
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-lg p-4 shadow-sm">
              <Text className="text-xs text-gray-600">Solde</Text>
              <Text className={`text-lg font-bold mt-1 ${
                budget.budget?.solde >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(budget.budget?.solde || 0).toLocaleString('fr-MG')} FMG
              </Text>
            </View>
          </View>

          {/* Dépenses par catégorie */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="font-bold text-gray-900 mb-3">Dépenses par Catégorie</Text>
            {budget.depenses_par_categorie?.map((cat, idx) => (
              <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-700">{cat.categorie || 'Autre'}</Text>
                <Text className="font-bold text-gray-900">
                  {parseFloat(cat.total_depenses || 0).toLocaleString('fr-MG')} FMG
                </Text>
              </View>
            ))}
          </View>

          {/* Revenus par source */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="font-bold text-gray-900 mb-3">Revenus par Source</Text>
            {budget.revenus_par_source?.map((src, idx) => (
              <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-700">{src.source || 'Autre'}</Text>
                <Text className="font-bold text-green-600">
                  +{parseFloat(src.total_revenus || 0).toLocaleString('fr-MG')} FMG
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View className="px-4 pb-4 flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab('depenses')}
            className="flex-1 bg-white rounded-lg py-3 border border-gray-200"
          >
            <Text className="text-center font-bold text-gray-700">
              Dépenses ({budget.nb_depenses})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('revenus')}
            className="flex-1 bg-white rounded-lg py-3 border border-gray-200"
          >
            <Text className="text-center font-bold text-gray-700">
              Revenus ({budget.nb_revenus})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // === LISTE DÉPENSES ===
  if (activeTab === 'depenses') {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-red-600 px-4 py-4">
          <Text className="text-white text-xl font-bold">📊 Dépenses</Text>
        </View>

        <View className="p-4">
          {depenses.length === 0 ? (
            <Text className="text-center text-gray-600 py-8">Aucune dépense</Text>
          ) : (
            depenses.map((dep, idx) => (
              <View key={idx} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">{dep.description}</Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      📌 {dep.categorie} • {new Date(dep.date).toLocaleDateString('fr-MG')}
                    </Text>
                  </View>
                  <Text className="font-bold text-red-600 text-right">
                    {parseFloat(dep.montant).toLocaleString('fr-MG')} FMG
                  </Text>
                </View>

                {/* Boutons edit/delete pour Admin/Chef */}
                {['admin', 'chef_chantier'].includes(role) && (
                  <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                    <TouchableOpacity className="flex-1 bg-blue-100 rounded py-2">
                      <Text className="text-blue-600 text-center text-sm font-bold">Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-red-100 rounded py-2">
                      <Text className="text-red-600 text-center text-sm font-bold">Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Bouton retour */}
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          className="mx-4 mb-4 bg-blue-600 rounded-lg py-3"
        >
          <Text className="text-white text-center font-bold">← Retour</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // === LISTE REVENUS ===
  if (activeTab === 'revenus') {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-green-600 px-4 py-4">
          <Text className="text-white text-xl font-bold">💚 Revenus</Text>
        </View>

        <View className="p-4">
          {revenus.length === 0 ? (
            <Text className="text-center text-gray-600 py-8">Aucun revenu</Text>
          ) : (
            revenus.map((rev, idx) => (
              <View key={idx} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900">{rev.description}</Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      📌 {rev.source} • {new Date(rev.date).toLocaleDateString('fr-MG')}
                    </Text>
                  </View>
                  <Text className="font-bold text-green-600 text-right">
                    +{parseFloat(rev.montant).toLocaleString('fr-MG')} FMG
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bouton retour */}
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          className="mx-4 mb-4 bg-blue-600 rounded-lg py-3"
        >
          <Text className="text-white text-center font-bold">← Retour</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}