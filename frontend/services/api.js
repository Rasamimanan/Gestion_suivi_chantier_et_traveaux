import axios from 'axios';
import { getToken, removeToken, removeUser } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.43.220:3000/api';
console.log("BASE_URL =", BASE_URL);
const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Injecter le token JWT automatiquement
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer expiration token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      await removeUser();
    }
    return Promise.reject(error);
  }
);

// AUTH
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.put('/auth/password', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const confirmForgotPassword = (id) => api.post('/auth/forgot-password/confirm', { id });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ADMIN - GESTION UTILISATEURS
export const getAdminUsers = () => api.get('/admin/utilisateurs');
export const getAdminPendingUsers = () => api.get('/admin/utilisateurs-en-attente');
export const getAdminStats = () => api.get('/admin/stats');
export const approveUser = (id) => api.post(`/admin/approuver/${id}`);
export const rejectUser = (id) => api.post(`/admin/rejeter/${id}`);
export const changeUserRole = (id, role) => api.put(`/admin/role/${id}`, { role });
export const suspendUser = (id) => api.put(`/admin/suspendre/${id}`);
export const reactivateUser = (id) => api.put(`/admin/reactiver/${id}`);
export const deleteUserAdmin = (id) => api.delete(`/admin/utilisateurs/${id}`);
// DASHBOARD
export const getDashboard = () => api.get('/dashboard');

// CHANTIERS
export const getChantiers = () => api.get('/chantiers');
export const getChantier = (id) => api.get(`/chantiers/${id}`);
export const getChantierStats = (id) => api.get(`/chantiers/${id}/stats`);
export const createChantier = (data) => api.post('/chantiers', data);
export const updateChantier = (id, data) => api.put(`/chantiers/${id}`, data);
export const deleteChantier = (id) => api.delete(`/chantiers/${id}`);

// ETAPES
export const getEtapes = (chantierId) => api.get(`/etapes/chantier/${chantierId}`);
export const getEtape = (id) => api.get(`/etapes/${id}`);
export const createEtape = (data) => api.post('/etapes', data);
export const updateEtape = (id, data) => api.put(`/etapes/${id}`, data);
export const deleteEtape = (id) => api.delete(`/etapes/${id}`);
export const assignerIntervenant = (etapeId, iId) => api.post(`/etapes/${etapeId}/intervenants/${iId}`);
export const retirerIntervenant = (etapeId, iId) => api.delete(`/etapes/${etapeId}/intervenants/${iId}`);

// INTERVENANTS
export const getIntervenants = () => api.get('/intervenants');
export const getIntervenant = (id) => api.get(`/intervenants/${id}`);
export const createIntervenant = (data) => api.post('/intervenants', data);
export const updateIntervenant = (id, data) => api.put(`/intervenants/${id}`, data);
export const deleteIntervenant = (id) => api.delete(`/intervenants/${id}`);

// PHOTOS
export const getPhotos = (etapeId) => api.get(`/photos/etape/${etapeId}`);
export const uploadPhoto = (formData) => api.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePhoto = (id) => api.delete(`/photos/${id}`);

export const SERVER_URL = BASE_URL.replace('/api', '');
export default api;

// COMMENTAIRES
export const getCommentaires = (etapeId) => api.get(`/commentaires/etape/${etapeId}`);
export const createCommentaire = (data) => api.post('/commentaires', data);
export const deleteCommentaire = (id) => api.delete(`/commentaires/${id}`);

// DEPENSES
export const getDepenses = (chantierId) => api.get(`/depenses/chantier/${chantierId}`);
export const getDepensesStats = (chantierId) => api.get(`/depenses/chantier/${chantierId}/stats`);
export const createDepense = (data) => api.post('/depenses', data);
export const deleteDepense = (id) => api.delete(`/depenses/${id}`);

// NOTIFICATIONS
export const getNotifications = () => api.get('/notifications');
export const marquerLu = (id) => api.put(`/notifications/${id}/lu`);
export const marquerTousLus = () => api.put('/notifications/tous/lus');

// RECHERCHE
export const rechercher = (q) => api.get(`/recherche?q=${encodeURIComponent(q)}`);