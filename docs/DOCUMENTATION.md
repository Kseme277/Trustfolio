# TrustFolio - Documentation du Projet

## Vue d'ensemble

TrustFolio est une plateforme de livres personnalisés développée avec Next.js 14, utilisant Drizzle ORM pour la gestion de base de données et intégrant WhatsApp pour les notifications.

## Architecture du Projet

### Structure des Dossiers

```
Trustfolio/
├── src/
│   ├── app/                    # Pages et routes Next.js 14 (App Router)
│   │   ├── api/                # Routes API
│   │   ├── (pages)/            # Pages de l'application
│   │   └── globals.css         # Styles globaux
│   ├── components/             # Composants React réutilisables
│   ├── db/                     # Configuration et schéma Drizzle
│   │   ├── index.ts           # Configuration de la base de données
│   │   ├── schema.ts          # Schémas des tables
│   │   └── seed.ts            # Données de test
│   ├── lib/                   # Utilitaires et configurations
│   ├── store/                 # État global (Zustand)
│   ├── types/                 # Types TypeScript
│   └── i18n/                  # Internationalisation
├── drizzle/                   # Migrations Drizzle
├── public/                    # Assets statiques
├── scripts/                   # Scripts utilitaires
└── lib/                       # Bibliothèques externes
```

## Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Zustand** - Gestion d'état global
- **React Hook Form** - Gestion des formulaires

### Backend
- **Next.js API Routes** - API REST
- **Drizzle ORM** - ORM TypeScript-first
- **PostgreSQL** - Base de données relationnelle
- **NextAuth.js** - Authentification

### Intégrations
- **WhatsApp Business API** - Notifications
- **PDF Generation** - Génération de livres personnalisés
- **Upload de fichiers** - Gestion des images

## Configuration de la Base de Données

### Drizzle ORM

Le projet utilise Drizzle ORM pour la gestion de la base de données. La configuration se trouve dans :

- `drizzle.config.ts` - Configuration Drizzle
- `src/db/schema.ts` - Définition des schémas
- `src/db/index.ts` - Connexion à la base de données

### Schémas Principaux

1. **Users** - Gestion des utilisateurs
2. **Books** - Catalogue de livres
3. **PersonalizedOrders** - Commandes personnalisées
4. **CartOrders** - Panier d'achat
5. **ContactMessages** - Messages de contact

### Migrations

Les migrations sont gérées automatiquement par Drizzle et stockées dans le dossier `drizzle/`.

```bash
# Générer une migration
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Réinitialiser la base de données
npm run db:push
```

## API Routes

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-code` - Vérification de code

### Livres
- `GET /api/books` - Liste des livres
- `GET /api/books/[id]` - Détails d'un livre
- `POST /api/generate-book-content` - Génération de contenu

### Commandes
- `GET /api/cart-orders` - Commandes du panier
- `POST /api/checkout` - Processus de commande
- `GET /api/orders` - Historique des commandes

### Autres
- `POST /api/contact` - Messages de contact
- `POST /api/upload` - Upload de fichiers
- `POST /api/update-read-progress` - Progression de lecture

## Composants Principaux

### Authentification
- `AuthProvider` - Contexte d'authentification
- `LoginForm` - Formulaire de connexion
- `RegisterForm` - Formulaire d'inscription

### Interface Utilisateur
- `Header` - En-tête avec navigation
- `Footer` - Pied de page
- `BookGrid` - Grille de livres
- `BookModal` - Modal de détails de livre

### Panier et Commandes
- `SideCart` - Panier latéral
- `CartItem` - Élément du panier
- `PaymentModal` - Modal de paiement

## Configuration de l'Environnement

### Variables d'Environnement Requises

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# WhatsApp
WHATSAPP_SESSION_PATH="./.wwebjs_auth"

# Upload
UPLOAD_DIR="./public/uploads"
```

## Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting
npm run lint

# Base de données
npm run db:generate    # Générer les migrations
npm run db:migrate     # Appliquer les migrations
npm run db:push        # Push du schéma
npm run db:seed        # Peupler la base de données

# WhatsApp
npm run start:whatsapp # Démarrer le service WhatsApp
```

## Déploiement

### Prérequis
1. Base de données PostgreSQL
2. Variables d'environnement configurées
3. Node.js 18+

### Étapes de Déploiement

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration de la base de données**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. **Build de l'application**
   ```bash
   npm run build
   ```

4. **Démarrage**
   ```bash
   npm start
   ```

## Fonctionnalités Principales

### 1. Personnalisation de Livres
- Sélection de livres du catalogue
- Upload d'images personnalisées
- Génération automatique de contenu
- Prévisualisation PDF

### 2. Système de Panier
- Ajout/suppression d'articles
- Gestion des quantités
- Persistance entre sessions

### 3. Processus de Commande
- Informations de livraison
- Méthodes de paiement
- Confirmation par WhatsApp

### 4. Gestion Utilisateur
- Inscription/connexion
- Profil utilisateur
- Historique des commandes

## Maintenance et Monitoring

### Logs
Les logs sont gérés par Next.js et peuvent être consultés via :
- Console du navigateur (développement)
- Logs serveur (production)

### Base de Données
- Sauvegardes régulières recommandées
- Monitoring des performances
- Nettoyage périodique des données temporaires

### Sécurité
- Validation des entrées utilisateur
- Authentification sécurisée
- Protection CSRF
- Sanitisation des uploads

## Support et Contribution

### Structure de Développement
1. Créer une branche feature
2. Développer et tester
3. Créer une pull request
4. Review et merge

### Conventions de Code
- ESLint pour la qualité du code
- Prettier pour le formatage
- TypeScript strict mode
- Nommage en camelCase

---

*Documentation mise à jour le : $(date)*
*Version du projet : 1.0.0*