const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_dev';

// ========== CONTRÔLE D'ACCÈS PAR RÔLE ==========

/**
 * Vérifier l'authentification et charger les données utilisateur
 */
async function authenticateToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Charger utilisateur complet
    const result = await pool.query(
      'SELECT id, email, role, statut FROM utilisateurs WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0 || result.rows[0].statut !== 'actif') {
      return res.status(401).json({ error: 'Utilisateur non actif' });
    }

    req.utilisateur = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
}

/**
 * ADMIN ONLY - Accès complet
 */
function requireAdmin(req, res, next) {
  if (!req.utilisateur || req.utilisateur.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Accès réservé aux administrateurs',
      votre_role: req.utilisateur?.role 
    });
  }
  next();
}

/**
 * ADMIN OU CHEF DE CHANTIER
 */
function requireAdminOrChef(req, res, next) {
  const roles_autorises = ['admin', 'chef_chantier'];
  
  if (!req.utilisateur || !roles_autorises.includes(req.utilisateur.role)) {
    return res.status(403).json({ 
      error: 'Accès réservé à l\'admin et chef de chantier',
      votre_role: req.utilisateur?.role 
    });
  }
  next();
}

/**
 * UTILISATEUR STANDARD - LECTURE SEULE
 */
function requireUtilisateur(req, res, next) {
  if (!req.utilisateur || req.utilisateur.role !== 'utilisateur') {
    return res.status(403).json({ 
      error: 'Accès réservé aux utilisateurs standard',
      votre_role: req.utilisateur?.role 
    });
  }
  next();
}

/**
 * Vérifier si utilisateur a accès à la ressource
 */
async function checkResourceAccess(req, res, next) {
  try {
    const { chantierId } = req.params;
    
    if (!chantierId) {
      return next();
    }

    // Admin a accès à tout
    if (req.utilisateur.role === 'admin') {
      return next();
    }

    // Chef de chantier a accès au chantier assigné
    if (req.utilisateur.role === 'chef_chantier') {
      const result = await pool.query(
        'SELECT id FROM chantiers WHERE id = $1',
        [chantierId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Chantier non trouvé' });
      }
      return next();
    }

    // Utilisateur standard: accès lecture seule
    if (req.utilisateur.role === 'utilisateur') {
      return next();
    }

    res.status(403).json({ error: 'Accès refusé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrChef,
  requireUtilisateur,
  checkResourceAccess
};