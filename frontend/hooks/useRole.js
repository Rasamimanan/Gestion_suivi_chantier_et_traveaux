import { useAuth } from '../context/AuthContext';

/**
 * Roles disponibles :
 *  - admin          → accès total
 *  - chef_chantier  → CRUD chantiers + équipes, pas gestion utilisateurs
 *  - utilisateur    → lecture seule
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role || 'utilisateur';

  return {
    role,
    isAdmin:         role === 'admin',
    isChef:          role === 'chef_chantier',
    isUtilisateur:   role === 'utilisateur',

    // Peut créer / modifier / supprimer des chantiers, étapes, intervenants, dépenses
    canEdit:         role === 'admin' || role === 'chef_chantier',

    // Peut gérer les utilisateurs (validation comptes, changement de rôle)
    canManageUsers:  role === 'admin',

    // Accès admin panel
    canAccessAdmin:  role === 'admin',
  };
}