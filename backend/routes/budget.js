const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdminOrChef, checkResourceAccess } = require('../middleware/roles');

// ========== GESTION BUDGÉTAIRE COMPLÈTE ==========

/**
 * GET - Vue d'ensemble budgétaire d'un chantier
 */
router.get('/chantier/:chantierId/budget', authenticateToken, checkResourceAccess, async (req, res) => {
  try {
    const { chantierId } = req.params;

    // Total dépenses
    const depensesResult = await pool.query(`
      SELECT 
        COUNT(*) as nb_depenses,
        COALESCE(SUM(montant), 0) as total_depenses,
        COALESCE(MAX(montant), 0) as max_depense,
        categorie
      FROM depenses
      WHERE chantier_id = $1
      GROUP BY categorie
    `, [chantierId]);

    // Total revenus
    const revenosResult = await pool.query(`
      SELECT 
        COUNT(*) as nb_revenus,
        COALESCE(SUM(montant), 0) as total_revenus,
        COALESCE(MAX(montant), 0) as max_revenu,
        source
      FROM revenus
      WHERE chantier_id = $1
      GROUP BY source
    `, [chantierId]);

    // Budget alloué
    const budgetResult = await pool.query(`
      SELECT budget_alloue FROM chantiers WHERE id = $1
    `, [chantierId]);

    const budget_alloue = budgetResult.rows[0]?.budget_alloue || 0;
    const total_depenses = depensesResult.rows.reduce((sum, row) => sum + parseFloat(row.total_depenses || 0), 0);
    const total_revenus = revenosResult.rows.reduce((sum, row) => sum + parseFloat(row.total_revenus || 0), 0);
    const solde = total_revenus - total_depenses;
    const pourcentage_utilise = budget_alloue > 0 ? ((total_depenses / budget_alloue) * 100).toFixed(2) : 0;

    res.json({
      chantier_id: chantierId,
      budget: {
        alloue: budget_alloue,
        utilise: total_depenses,
        revenu: total_revenus,
        solde: solde,
        pourcentage_utilise: pourcentage_utilise,
        reste: budget_alloue - total_depenses
      },
      depenses_par_categorie: depensesResult.rows,
      revenus_par_source: revenosResult.rows,
      nb_depenses: depensesResult.rows.reduce((sum, r) => sum + parseInt(r.nb_depenses || 0), 0),
      nb_revenus: revenosResult.rows.reduce((sum, r) => sum + parseInt(r.nb_revenus || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET - Détail budget par étape
 */
router.get('/etape/:etapeId/budget', authenticateToken, async (req, res) => {
  try {
    const { etapeId } = req.params;

    const result = await pool.query(`
      SELECT 
        e.id,
        e.titre as etape,
        c.nom as chantier,
        COALESCE(SUM(CASE WHEN d.id IS NOT NULL THEN d.montant ELSE 0 END), 0) as total_depenses,
        COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.montant ELSE 0 END), 0) as total_revenus,
        COUNT(DISTINCT d.id) as nb_depenses,
        COUNT(DISTINCT r.id) as nb_revenus
      FROM etapes e
      LEFT JOIN chantiers c ON e.chantier_id = c.id
      LEFT JOIN depenses d ON d.etape_id = e.id
      LEFT JOIN revenus r ON r.etape_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, e.titre, c.nom
    `, [etapeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Étape non trouvée' });
    }

    const budget = result.rows[0];
    res.json({
      ...budget,
      solde: parseFloat(budget.total_revenus) - parseFloat(budget.total_depenses)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET - Liste des dépenses avec filtre
 */
router.get('/depenses', authenticateToken, async (req, res) => {
  try {
    const { chantierId, etapeId, categorie } = req.query;
    
    let query = `
      SELECT 
        d.*,
        c.nom as chantier,
        e.titre as etape
      FROM depenses d
      LEFT JOIN chantiers c ON d.chantier_id = c.id
      LEFT JOIN etapes e ON d.etape_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (chantierId) {
      params.push(chantierId);
      query += ` AND d.chantier_id = $${params.length}`;
    }
    if (etapeId) {
      params.push(etapeId);
      query += ` AND d.etape_id = $${params.length}`;
    }
    if (categorie) {
      params.push(categorie);
      query += ` AND d.categorie = $${params.length}`;
    }

    query += ` ORDER BY d.date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST - Ajouter dépense (Admin/Chef seulement)
 */
router.post('/depenses', authenticateToken, requireAdminOrChef, async (req, res) => {
  try {
    const { chantier_id, etape_id, description, montant, categorie, date } = req.body;

    if (!chantier_id || !montant || !categorie) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = await pool.query(`
      INSERT INTO depenses (chantier_id, etape_id, description, montant, categorie, date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [chantier_id, etape_id || null, description || '', montant, categorie, date || new Date().toISOString().split('T')[0]]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET - Liste des revenus avec filtre
 */
router.get('/revenus', authenticateToken, async (req, res) => {
  try {
    const { chantierId, source } = req.query;
    
    let query = `
      SELECT 
        r.*,
        c.nom as chantier,
        e.titre as etape
      FROM revenus r
      LEFT JOIN chantiers c ON r.chantier_id = c.id
      LEFT JOIN etapes e ON r.etape_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (chantierId) {
      params.push(chantierId);
      query += ` AND r.chantier_id = $${params.length}`;
    }
    if (source) {
      params.push(source);
      query += ` AND r.source = $${params.length}`;
    }

    query += ` ORDER BY r.date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST - Ajouter revenu (Admin/Chef seulement)
 */
router.post('/revenus', authenticateToken, requireAdminOrChef, async (req, res) => {
  try {
    const { chantier_id, etape_id, description, montant, source, date } = req.body;

    if (!chantier_id || !montant || !source) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const result = await pool.query(`
      INSERT INTO revenus (chantier_id, etape_id, description, montant, source, date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [chantier_id, etape_id || null, description || '', montant, source, date || new Date().toISOString().split('T')[0]]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT - Modifier dépense (Admin/Chef seulement)
 */
router.put('/depenses/:id', authenticateToken, requireAdminOrChef, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, montant, categorie, date } = req.body;

    const result = await pool.query(`
      UPDATE depenses
      SET description = COALESCE($1, description),
          montant = COALESCE($2, montant),
          categorie = COALESCE($3, categorie),
          date = COALESCE($4, date)
      WHERE id = $5
      RETURNING *
    `, [description, montant, categorie, date, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE - Supprimer dépense (Admin seulement)
 */
router.delete('/depenses/:id', authenticateToken, requireAdminOrChef, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM depenses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dépense non trouvée' });
    }

    res.json({ message: 'Dépense supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET - Statistiques budgétaires complètes
 */
router.get('/statistiques/budget', authenticateToken, requireAdminOrChef, async (req, res) => {
  try {
    // Dépenses par catégorie
    const depensesCat = await pool.query(`
      SELECT categorie, SUM(montant) as total, COUNT(*) as nb
      FROM depenses
      GROUP BY categorie
      ORDER BY total DESC
    `);

    // Revenus par source
    const revenusSrc = await pool.query(`
      SELECT source, SUM(montant) as total, COUNT(*) as nb
      FROM revenus
      GROUP BY source
      ORDER BY total DESC
    `);

    // Top 5 dépenses
    const topDepenses = await pool.query(`
      SELECT d.*, c.nom as chantier
      FROM depenses d
      LEFT JOIN chantiers c ON d.chantier_id = c.id
      ORDER BY d.montant DESC
      LIMIT 5
    `);

    // Top 5 revenus
    const topRevenus = await pool.query(`
      SELECT r.*, c.nom as chantier
      FROM revenus r
      LEFT JOIN chantiers c ON r.chantier_id = c.id
      ORDER BY r.montant DESC
      LIMIT 5
    `);

    // Tendance mensuelle
    const tendance = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date)::date as mois,
        SUM(CASE WHEN categorie IS NOT NULL THEN montant ELSE 0 END) as depenses,
        SUM(CASE WHEN source IS NOT NULL THEN montant ELSE 0 END) as revenus
      FROM (
        SELECT date, montant, categorie, NULL as source FROM depenses
        UNION ALL
        SELECT date, montant, NULL as categorie, source FROM revenus
      ) combined
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY mois DESC
      LIMIT 12
    `);

    res.json({
      depenses_par_categorie: depensesCat.rows,
      revenus_par_source: revenusSrc.rows,
      top_5_depenses: topDepenses.rows,
      top_5_revenus: topRevenus.rows,
      tendance_mensuelle: tendance.rows,
      total_depenses: depensesCat.rows.reduce((sum, r) => sum + parseFloat(r.total || 0), 0),
      total_revenus: revenusSrc.rows.reduce((sum, r) => sum + parseFloat(r.total || 0), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;