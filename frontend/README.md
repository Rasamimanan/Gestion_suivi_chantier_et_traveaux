# Frontend - Suivi de Chantier (React Native / Expo)

## Installation
```bash
npm install
cp .env.example .env   # Mettre votre IP backend
npx expo start
```

## Configuration `.env`
```
EXPO_PUBLIC_API_URL=http://<IP_DE_VOTRE_PC>:3000/api
```

## Structure
```
app/
├── (auth)/          # Login & Register
├── (tabs)/          # Dashboard, Chantiers, Intervenants, Profil
├── chantier/        # Détail, Créer, Modifier, Liste étapes
└── etape/           # Détail + photos, Créer
context/             # AuthContext (JWT)
services/            # api.js (axios), storage.js (SecureStore)
```

## Fonctionnalités
- ✅ Login / Register sécurisé (JWT + SecureStore)
- ✅ Tableau de bord avec statistiques
- ✅ CRUD complet chantiers (avec budget, dates, filtres)
- ✅ CRUD complet étapes avec barre de progression
- ✅ CRUD complet intervenants
- ✅ Upload et suppression de photos
- ✅ Assignation intervenants ↔ étapes
- ✅ Profil + changement mot de passe
- ✅ Déconnexion sécurisée
