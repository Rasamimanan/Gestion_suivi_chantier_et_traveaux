const BACKEND_URL = 'https://mobilback-1.onrender.com';

/**
 * Corriger l'URL d'une image :
 * - Si déjà https → retourner tel quel
 * - Si chemin relatif (/uploads/...) → ajouter le BACKEND_URL
 * - Si URL locale (192.168.x.x ou localhost) → remplacer par BACKEND_URL
 */
export function getImageUrl(url) {
  if (!url) return null;

  // Déjà une URL complète et correcte
  if (url.startsWith('https://mobilback-1.onrender.com')) return url;

  // Chemin relatif : /uploads/fichier.jpg
  if (url.startsWith('/uploads/')) return `${BACKEND_URL}${url}`;

  // URL locale Metro ou localhost → remplacer
  if (url.includes('192.168.') || url.includes('localhost') || url.includes('127.0.0.1')) {
    const path = url.replace(/https?:\/\/[^/]+/, '');
    return `${BACKEND_URL}${path}`;
  }

  // Nom de fichier seul
  if (!url.startsWith('http')) return `${BACKEND_URL}/uploads/${url}`;

  return url;
}