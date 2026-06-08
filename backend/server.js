const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chantiers', require('./routes/chantiers'));
app.use('/api/etapes', require('./routes/etapes'));
app.use('/api/intervenants', require('./routes/intervenants'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/commentaires', require('./routes/commentaires'));
app.use('/api/depenses', require('./routes/depenses'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/recherche', require('./routes/recherche'));
const { authenticateToken } = require('./middleware/roles');

app.use('/api/budget', authenticateToken, require('./routes/budget'));

app.get('/', (req, res) => res.json({ message: '🏗️ API Suivi Chantier v3 ✅', version: '3.0.0' }));
app.use((req, res) => res.status(404).json({ error: 'Route non trouvée.' }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Erreur serveur.' }));

app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));