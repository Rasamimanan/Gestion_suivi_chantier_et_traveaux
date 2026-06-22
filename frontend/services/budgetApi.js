import api from './api';
import { getUser } from './storage';

export const getBudgetChantier = (chantierId) =>
  api.get(`/budget/chantier/${chantierId}/budget`).then(r => r.data);

export const getBudgetEtape = (etapeId) =>
  api.get(`/budget/etape/${etapeId}/budget`).then(r => r.data);

export const getDepenses = (filters = {}) =>
  api.get('/budget/depenses', { params: filters }).then(r => r.data);

export const addDepense = (depenseData) =>
  api.post('/budget/depenses', depenseData).then(r => r.data);

export const updateDepense = (depenseId, depenseData) =>
  api.put(`/budget/depenses/${depenseId}`, depenseData).then(r => r.data);

export const deleteDepense = (depenseId) =>
  api.delete(`/budget/depenses/${depenseId}`).then(r => r.data);

export const getRevenus = (filters = {}) =>
  api.get('/budget/revenus', { params: filters }).then(r => r.data);

export const addRevenu = (revenuData) =>
  api.post('/budget/revenus', revenuData).then(r => r.data);

export const deleteRevenu = (revenuId) =>
  api.delete(`/budget/revenus/${revenuId}`).then(r => r.data);

export const getBudgetStatistiques = () =>
  api.get('/budget/statistiques/budget').then(r => r.data);

export async function getUserRole() {
  const user = await getUser();
  return user?.role || 'utilisateur';
}

export async function isAdminOrChef() {
  const role = await getUserRole();
  return ['admin', 'chef_chantier'].includes(role);
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}