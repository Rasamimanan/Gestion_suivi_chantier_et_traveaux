const db = require('../config/database');

exports.getByChantier = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT d.*, u.nom, u.prenom FROM depenses d
       LEFT JOIN utilisateurs u ON d.createur_id = u.id
       WHERE d.chantier_id = $1 ORDER BY d.date_depense DESC`,
      [req.params.chantierId]
    );
    const total = r.rows.reduce((sum, d) => sum + parseFloat(d.montant), 0);
    res.json({ depenses: r.rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT categorie, SUM(montant) as total, COUNT(*) as count
       FROM depenses WHERE chantier_id = $1 GROUP BY categorie`,
      [req.params.chantierId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { chantier_id, titre, montant, categorie, date_depense, description } = req.body;
    const r = await db.query(
      `INSERT INTO depenses (chantier_id, titre, montant, categorie, date_depense, description, createur_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [chantier_id, titre, montant, categorie || 'autre', date_depense, description, req.user.id]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    await db.query('DELETE FROM depenses WHERE id=$1', [req.params.id]);
    res.json({ message: 'Dépense supprimée.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};