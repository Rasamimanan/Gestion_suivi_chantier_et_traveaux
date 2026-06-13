const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/roles');

const router = express.Router();

// ================= CONFIG =================
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ⚠️ sécurité : empêcher serveur de tourner sans secret JWT
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant dans .env');
}

// ================= TOKEN =================
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const emailClean = email.toLowerCase().trim();

    // vérifier email existant
    const exist = await pool.query(
      'SELECT id FROM utilisateurs WHERE email = $1',
      [emailClean]
    );

    if (exist.rows.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // hash password
    const hash = await bcryptjs.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO utilisateurs
       (email, password, nom, prenom, role, statut)
       VALUES ($1,$2,$3,$4,$5,'actif')
       RETURNING id, email, nom, prenom, role, statut`,
      [emailClean, hash, nom || '', prenom || '', role || 'utilisateur']
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      utilisateur: user
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const emailClean = email.toLowerCase().trim();

    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [emailClean]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // check password
    const isValid = await bcryptjs.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // check statut
    if (user.statut !== 'actif') {
      return res.status(403).json({
        error: `Compte ${user.statut}`
      });
    }

    const token = generateToken(user);

    // enlever password
    const { password: _, ...userSafe } = user;

    return res.json({
      message: 'Connexion réussie',
      token,
      utilisateur: userSafe
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ================= ME =================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, nom, prenom, role, statut, created_at
       FROM utilisateurs
       WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ================= LOGOUT =================
router.post('/logout', authenticateToken, (req, res) => {
  // JWT = stateless => logout côté client
  return res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;