const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role } = req.body;
    const exists = await db.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const result = await db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email, role`,
      [nom, prenom, email, hash, role || 'utilisateur']
    );
    const user = result.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ message: 'Compte créé avec succès.', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const result = await db.query(
      'SELECT * FROM utilisateurs WHERE email = $1 AND actif = TRUE',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
    const token = generateToken(user.id);
    const { mot_de_passe: _, ...userSafe } = user;
    res.json({ message: 'Connexion réussie.', token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const result = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(ancien_mot_de_passe, result.rows[0].mot_de_passe);
    if (!valid) return res.status(401).json({ error: 'Ancien mot de passe incorrect.' });
    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    await db.query('UPDATE utilisateurs SET mot_de_passe = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
