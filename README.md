# 🏗️ Suivi de Chantier - Projet Complet

## Structure
```
project/
├── backend/    → API Node.js/Express + PostgreSQL
└── frontend/   → Application Mobile React Native / Expo
```

## Démarrage rapide

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env          # Configurer DB + JWT_SECRET
psql -U postgres -c "CREATE DATABASE suivi_chantier;"
psql -U postgres -d suivi_chantier -f database/init.sql
npm run dev                   # → http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
npm install
# Éditer .env → mettre l'IP de votre machine
npx expo start
```

## Compte admin par défaut
- Email : `admin@chantier.mg`
- Mot de passe : `password`
> ⚠️ Changer le mot de passe après la première connexion !
