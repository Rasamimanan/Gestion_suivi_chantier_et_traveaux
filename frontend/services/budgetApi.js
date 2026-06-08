// services/budgetApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// ========== BUDGET API ==========

/**
 * Obtenir JWT token du storage
 */
async function getToken() {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Erreur lecture token:', error);
    return null;
  }
}

/**
 * Vue d'ensemble budget d'un chantier
 */
export async function getBudgetChantier(chantierId) {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${API_BASE_URL}/budget/chantier/${chantierId}/budget`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur budget chantier:', error);
    throw error;
  }
}

/**
 * Budget par étape
 */
export async function getBudgetEtape(etapeId) {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${API_BASE_URL}/budget/etape/${etapeId}/budget`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur budget étape:', error);
    throw error;
  }
}

/**
 * Lister les dépenses
 */
export async function getDepenses(filters = {}) {
  try {
    const token = await getToken();
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/budget/depenses${params ? '?' + params : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur dépenses:', error);
    throw error;
  }
}

/**
 * Ajouter dépense (Admin/Chef seulement)
 */
export async function addDepense(depenseData) {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${API_BASE_URL}/budget/depenses`,
      depenseData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur ajout dépense:', error);
    throw error;
  }
}

/**
 * Modifier dépense (Admin/Chef seulement)
 */
export async function updateDepense(depenseId, depenseData) {
  try {
    const token = await getToken();
    const response = await axios.put(
      `${API_BASE_URL}/budget/depenses/${depenseId}`,
      depenseData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur modification dépense:', error);
    throw error;
  }
}

/**
 * Supprimer dépense (Admin/Chef seulement)
 */
export async function deleteDepense(depenseId) {
  try {
    const token = await getToken();
    const response = await axios.delete(
      `${API_BASE_URL}/budget/depenses/${depenseId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur suppression dépense:', error);
    throw error;
  }
}

/**
 * Lister les revenus
 */
export async function getRevenus(filters = {}) {
  try {
    const token = await getToken();
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_BASE_URL}/budget/revenus${params ? '?' + params : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur revenus:', error);
    throw error;
  }
}

/**
 * Ajouter revenu (Admin/Chef seulement)
 */
export async function addRevenu(revenuData) {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${API_BASE_URL}/budget/revenus`,
      revenuData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur ajout revenu:', error);
    throw error;
  }
}

/**
 * Statistiques budget (Admin/Chef seulement)
 */
export async function getBudgetStatistiques() {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${API_BASE_URL}/budget/statistiques/budget`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur statistiques:', error);
    throw error;
  }
}

/**
 * Obtenir rôle utilisateur
 */
export async function getUserRole() {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.role || 'utilisateur';
    }
    return 'utilisateur';
  } catch (error) {
    console.error('Erreur lecture rôle:', error);
    return 'utilisateur';
  }
}

/**
 * Vérifier si utilisateur est Admin ou Chef
 */
export async function isAdminOrChef() {
  const role = await getUserRole();
  return ['admin', 'chef_chantier'].includes(role);
}

/**
 * Vérifier si utilisateur est Admin
 */
export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}