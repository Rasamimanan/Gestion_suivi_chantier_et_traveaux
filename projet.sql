-- =====================================
-- CLEAN FULL BACKUP (NEON COMPATIBLE)
-- =====================================

-- =========================
-- DROP ALL TABLES (safe reset)
-- =========================
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS connexions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS commentaires CASCADE;
DROP TABLE IF EXISTS depenses CASCADE;
DROP TABLE IF EXISTS etape_intervenants CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS etapes CASCADE;
DROP TABLE IF EXISTS intervenants CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;
DROP TABLE IF EXISTS chantiers CASCADE;

-- =========================
-- TABLE CHANTIERS
-- =========================
CREATE TABLE chantiers (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    date_debut DATE,
    date_fin_prevue DATE,
    statut VARCHAR(50) DEFAULT 'en_cours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE ETAPES
-- =========================
CREATE TABLE etapes (
    id SERIAL PRIMARY KEY,
    chantier_id INTEGER REFERENCES chantiers(id) ON DELETE CASCADE,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    statut VARCHAR(50) DEFAULT 'non_commence',
    ordre INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE INTERVENANTS
-- =========================
CREATE TABLE intervenants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    role VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE COMMENTAIRES
-- =========================
CREATE TABLE commentaires (
    id SERIAL PRIMARY KEY,
    etape_id INTEGER REFERENCES etapes(id) ON DELETE CASCADE,
    intervenant_id INTEGER REFERENCES intervenants(id) ON DELETE SET NULL,
    texte TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE DEPENSES
-- =========================
CREATE TABLE depenses (
    id SERIAL PRIMARY KEY,
    chantier_id INTEGER REFERENCES chantiers(id) ON DELETE CASCADE,
    etape_id INTEGER REFERENCES etapes(id) ON DELETE SET NULL,
    description VARCHAR(255),
    montant NUMERIC(10,2) NOT NULL,
    categorie VARCHAR(100) DEFAULT 'autre',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE ETAPE_INTERVENANTS
-- =========================
CREATE TABLE etape_intervenants (
    id SERIAL PRIMARY KEY,
    etape_id INTEGER REFERENCES etapes(id) ON DELETE CASCADE,
    intervenant_id INTEGER REFERENCES intervenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(etape_id, intervenant_id)
);

-- =========================
-- TABLE PHOTOS
-- =========================
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    etape_id INTEGER REFERENCES etapes(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE UTILISATEURS
-- =========================
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    role VARCHAR(50) DEFAULT 'utilisateur',
    statut VARCHAR(50) DEFAULT 'en_attente',
    code_validation VARCHAR(6),
    email_verifie BOOLEAN DEFAULT false,
    date_validation DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    type VARCHAR(50),
    titre VARCHAR(255) NOT NULL,
    message TEXT,
    lien VARCHAR(255),
    lue BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE CONNEXIONS
-- =========================
CREATE TABLE connexions (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLE TOKENS
-- =========================
CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expire_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DATA INSERT (CHANTIERS)
-- =========================
INSERT INTO chantiers (nom, adresse, date_debut, date_fin_prevue, statut) VALUES
('Construction Maison Familiale', '123 Rue Principale, Antananarivo', '2024-01-15', NULL, 'en_cours'),
('Rénovation Bureau', '45 Avenue de l''Indépendance', '2024-02-01', NULL, 'en_cours'),
('Extension École', '789 Boulevard Université, Antananarivo', '2023-10-01', NULL, 'termine');

-- =========================
-- DATA INTERVENANTS
-- =========================
INSERT INTO intervenants (nom, prenom, role, telephone, email) VALUES
('Rakoto', 'Jean', 'Maçon', '034 12 345 67', 'jean.rakoto@email.com'),
('Rasoa', 'Marie', 'Électricien', '033 98 765 43', 'marie.rasoa@email.com'),
('Andry', 'Paul', 'Plombier', '032 11 222 33', 'paul.andry@email.com'),
('Ranjohn', 'Sophie', 'Chef de chantier', '034 55 666 77', 'sophie.ranjohn@email.com');

-- =========================
-- DATA ETAPES
-- =========================
INSERT INTO etapes (chantier_id, titre, description, date_debut, date_fin, statut, ordre) VALUES
(1, 'Fondations', 'Coulage des fondations en béton armé', '2024-01-15', '2024-02-15', 'termine', 1),
(1, 'Murs', 'Construction des murs de la maison', '2024-02-16', '2024-04-16', 'en_cours', 2),
(1, 'Électricité', 'Installation électrique complète', '2024-04-17', '2024-05-17', 'non_commence', 3),
(2, 'Démolition', 'Enlèvement des anciennes installations', '2024-02-01', '2024-02-28', 'termine', 1),
(2, 'Rénovation murs', 'Peinture et revêtement des murs', '2024-03-01', '2024-03-31', 'en_cours', 2);

-- =========================
-- DATA COMMENTAIRES
-- =========================
INSERT INTO commentaires (etape_id, intervenant_id, texte) VALUES
(1, 1, 'Fondations coulées sans problème. Prêt pour étape 2.'),
(2, 2, 'Murs montés à 50%. Pas de problème détecté.'),
(4, 3, 'Démolition terminée. Bon travail de l''équipe.');

-- =========================
-- DATA DEPENSES
-- =========================
INSERT INTO depenses (chantier_id, etape_id, description, montant, categorie, date) VALUES
(1, 1, 'Ciment et béton', 5000000, 'Matériaux', '2024-01-20'),
(1, 1, 'Main d''œuvre fondations', 2000000, 'Main-d''œuvre', '2024-02-10'),
(1, 2, 'Briques et mortier', 8000000, 'Matériaux', '2024-03-01'),
(2, 4, 'Évacuation débris', 1500000, 'Autres', '2024-02-15'),
(2, 5, 'Peinture', 2000000, 'Matériaux', '2024-03-05');

-- =========================
-- DATA UTILISATEURS
-- =========================
INSERT INTO utilisateurs (email, password, nom, prenom, role, statut, code_validation, email_verifie) VALUES
('admin@example.com', '$2b$10$fakehash', 'Admin', 'Super', 'admin', 'actif', NULL, true),
('user@example.com', '$2b$10$fakehash', 'User', 'Test', 'utilisateur', 'actif', NULL, true),
('nouveau@example.com', '$2b$10$fakehash', 'Nouveau', 'Utilisateur', 'utilisateur', 'en_attente', '123456', false);

-- =========================
-- INDEX (optional safe)
-- =========================
CREATE INDEX idx_chantiers_statut ON chantiers(statut);
CREATE INDEX idx_etapes_chantier ON etapes(chantier_id);
CREATE INDEX idx_etapes_statut ON etapes(statut);
CREATE INDEX idx_depenses_chantier ON depenses(chantier_id);
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);