# Structure du Projet TrustFolio

## Vue d'ensemble de l'Architecture

TrustFolio est organisé selon l'architecture Next.js 14 avec App Router, utilisant Drizzle ORM pour la gestion de base de données.

## Structure Détaillée

```
Trustfolio/
├── 📁 src/                           # Code source principal
│   ├── 📁 app/                       # App Router Next.js 14
│   │   ├── 📁 api/                   # Routes API REST
│   │   │   ├── 📁 auth/              # Authentification
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   └── verify-code/route.ts
│   │   │   ├── 📁 books/             # Gestion des livres
│   │   │   │   ├── route.ts          # Liste des livres
│   │   │   │   └── [id]/route.ts     # Détails d'un livre
│   │   │   ├── 📁 cart-orders/       # Panier d'achat
│   │   │   │   └── route.ts
│   │   │   ├── 📁 checkout/          # Processus de commande
│   │   │   │   └── route.ts
│   │   │   ├── 📁 contact/           # Messages de contact
│   │   │   │   └── route.ts
│   │   │   ├── 📁 generate-book-content/ # Génération de contenu
│   │   │   │   └── route.ts
│   │   │   ├── 📁 orders/            # Gestion des commandes
│   │   │   │   ├── route.ts
│   │   │   │   └── types-count/route.ts
│   │   │   ├── 📁 update-read-progress/ # Progression de lecture
│   │   │   │   └── route.ts
│   │   │   └── 📁 upload/            # Upload de fichiers
│   │   │       └── route.ts
│   │   ├── 📁 (pages)/               # Pages de l'application
│   │   │   ├── 📁 a-propos/          # Page À propos
│   │   │   ├── 📁 compte/            # Compte utilisateur
│   │   │   ├── 📁 confirmation/      # Confirmation de commande
│   │   │   ├── 📁 connexion/         # Page de connexion
│   │   │   ├── 📁 contact/           # Page de contact
│   │   │   ├── 📁 inscription/       # Page d'inscription
│   │   │   ├── 📁 livres/            # Catalogue de livres
│   │   │   ├── 📁 nouveautes/        # Nouveautés
│   │   │   ├── 📁 panier/            # Panier d'achat
│   │   │   └── 📁 personaliser/      # Personnalisation
│   │   ├── layout.tsx                # Layout principal
│   │   ├── page.tsx                  # Page d'accueil
│   │   ├── globals.css               # Styles globaux
│   │   ├── error.tsx                 # Page d'erreur
│   │   ├── global-error.tsx          # Erreur globale
│   │   └── not-found.tsx             # Page 404
│   ├── 📁 components/                # Composants React réutilisables
│   │   ├── AnimateOnScroll.tsx       # Animation au scroll
│   │   ├── AuthButtons.tsx           # Boutons d'authentification
│   │   ├── AuthLayout.tsx            # Layout d'authentification
│   │   ├── AuthProvider.tsx          # Contexte d'authentification
│   │   ├── BookCardSkeleton.tsx      # Skeleton des cartes de livres
│   │   ├── BookGrid.tsx              # Grille de livres
│   │   ├── BookModal.tsx             # Modal de détails de livre
│   │   ├── BookSelectModal.tsx       # Modal de sélection de livre
│   │   ├── CallToAction.tsx          # Appel à l'action
│   │   ├── CartItem.tsx              # Élément du panier
│   │   ├── CartSyncer.tsx            # Synchronisation du panier
│   │   ├── ClientHeroCarousel.tsx    # Carrousel héro côté client
│   │   ├── ClientProviders.tsx       # Providers côté client
│   │   ├── FloatingCustomizeButton.tsx # Bouton de personnalisation flottant
│   │   ├── Footer.tsx                # Pied de page
│   │   ├── FooterWrapper.tsx         # Wrapper du pied de page
│   │   ├── Header.tsx                # En-tête
│   │   ├── HorizontalBookCarousel.tsx # Carrousel horizontal de livres
│   │   ├── LanguageProvider.tsx      # Provider de langue
│   │   ├── LoginForm.tsx             # Formulaire de connexion
│   │   ├── OrderDetailsModal.tsx     # Modal de détails de commande
│   │   ├── PDFViewer.tsx             # Visualiseur PDF
│   │   ├── PaymentModal.tsx          # Modal de paiement
│   │   ├── PersonalizedCartItem.tsx  # Élément personnalisé du panier
│   │   ├── ProfileStatusIcon.tsx     # Icône de statut de profil
│   │   ├── RegisterForm.tsx          # Formulaire d'inscription
│   │   ├── SectionTemoignages.tsx    # Section témoignages
│   │   ├── SideCart.tsx              # Panier latéral
│   │   ├── Testimonials.tsx          # Témoignages
│   │   ├── ThemeProvider.tsx         # Provider de thème
│   │   ├── ThemeSwitcher.tsx         # Commutateur de thème
│   │   ├── ToastProvider.tsx         # Provider de notifications
│   │   ├── VirtuesBar.tsx            # Barre de vertus
│   │   ├── SectionTemoignages.css    # Styles des témoignages
│   │   └── style.css                 # Styles additionnels
│   ├── 📁 db/                        # Configuration Drizzle ORM
│   │   ├── index.ts                  # Connexion à la base de données
│   │   ├── schema.ts                 # Schémas des tables
│   │   └── seed.ts                   # Script de peuplement
│   ├── 📁 lib/                       # Utilitaires et configurations
│   │   ├── authOptions.ts            # Configuration NextAuth
│   │   ├── initWhatsApp.ts           # Initialisation WhatsApp
│   │   ├── whatsappConfig.ts         # Configuration WhatsApp
│   │   └── whatsappService.ts        # Service WhatsApp
│   ├── 📁 store/                     # Gestion d'état global
│   │   └── cartStore.ts              # Store du panier (Zustand)
│   ├── 📁 types/                     # Types TypeScript
│   │   ├── app.d.ts                  # Types de l'application
│   │   └── next-auth.d.ts            # Types NextAuth
│   └── 📁 i18n/                      # Internationalisation
│       └── translations.ts           # Traductions
├── 📁 drizzle/                       # Migrations Drizzle
│   ├── 0000_yellow_sphinx.sql        # Migration initiale
│   └── 📁 meta/                      # Métadonnées des migrations
│       ├── 0000_snapshot.json
│       └── _journal.json
├── 📁 public/                        # Assets statiques
│   ├── 📁 pdf/                       # Fichiers PDF des livres
│   ├── 📁 uploads/                   # Images uploadées par les utilisateurs
│   ├── Logo TrustFolio.png           # Logo principal
│   ├── hero-image.webp               # Image héro
│   └── [autres assets...]            # Autres images et icônes
├── 📁 scripts/                       # Scripts utilitaires
│   ├── seed-values.js                # Valeurs de peuplement
│   └── start-with-whatsapp.js        # Démarrage avec WhatsApp
├── 📁 lib/                           # Bibliothèques externes
│   └── bookContentGenerator.ts       # Générateur de contenu de livre
├── 📁 .wwebjs_auth/                  # Session WhatsApp
├── 📁 .wwebjs_cache/                 # Cache WhatsApp
├── drizzle.config.ts                 # Configuration Drizzle
├── next.config.mjs                   # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind CSS
├── tsconfig.json                     # Configuration TypeScript
├── tsconfig.seed.json                # Configuration TypeScript pour seed
├── package.json                      # Dépendances et scripts
├── .gitignore                        # Fichiers ignorés par Git
└── 📄 Documentation/                 # Documentation du projet
    ├── README.md                     # Guide principal
    ├── DOCUMENTATION.md              # Documentation technique
    ├── PROJECT_STRUCTURE.md          # Ce fichier
    ├── BACKEND_IMPLEMENTATION.md     # Implémentation backend
    ├── MIGRATION_DRIZZLE.md          # Guide de migration Drizzle
    ├── WHATSAPP_SETUP.md             # Configuration WhatsApp
    └── README_REALISATION.txt        # Notes de réalisation
```

## Conventions de Nommage

### Fichiers et Dossiers
- **Pages** : kebab-case (ex: `a-propos`, `cart-orders`)
- **Composants** : PascalCase (ex: `BookGrid.tsx`, `AuthProvider.tsx`)
- **Utilitaires** : camelCase (ex: `authOptions.ts`, `cartStore.ts`)
- **API Routes** : kebab-case (ex: `verify-code`, `generate-book-content`)

### Code
- **Variables** : camelCase
- **Fonctions** : camelCase
- **Composants** : PascalCase
- **Types/Interfaces** : PascalCase
- **Constantes** : UPPER_SNAKE_CASE

## Flux de Données

### 1. Authentification
```
Utilisateur → LoginForm → API /auth/login → NextAuth → Session → AuthProvider
```

### 2. Gestion des Livres
```
Catalogue → BookGrid → BookModal → API /books → Drizzle → PostgreSQL
```

### 3. Panier et Commandes
```
Panier → CartStore (Zustand) → API /cart-orders → Checkout → API /checkout
```

### 4. Personnalisation
```
Upload → API /upload → Génération → API /generate-book-content → PDF
```

## Technologies par Couche

### Frontend (Client)
- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **État** : Zustand + React Context
- **Animations** : Framer Motion
- **Formulaires** : React Hook Form

### Backend (Server)
- **API** : Next.js API Routes
- **ORM** : Drizzle ORM
- **Base de données** : PostgreSQL
- **Authentification** : NextAuth.js
- **Upload** : Système de fichiers local

### Services Externes
- **WhatsApp** : WhatsApp Web.js
- **PDF** : React-PDF + PDF.js
- **Notifications** : React Toastify

## Sécurité

### Authentification
- Sessions sécurisées avec NextAuth.js
- Hachage des mots de passe avec bcryptjs
- Tokens JWT pour l'API

### Validation
- Validation côté client et serveur
- Sanitisation des entrées utilisateur
- Protection contre les injections SQL (Drizzle ORM)

### Upload de Fichiers
- Validation des types de fichiers
- Limitation de la taille des fichiers
- Stockage sécurisé dans `/public/uploads`

## Performance

### Optimisations Frontend
- Lazy loading des composants
- Optimisation des images (Next.js Image)
- Code splitting automatique
- Mise en cache des assets statiques

### Optimisations Backend
- Requêtes optimisées avec Drizzle ORM
- Mise en cache des sessions
- Compression des réponses API

## Déploiement

### Environnements
- **Développement** : `npm run dev`
- **Production** : `npm run build && npm start`
- **Base de données** : Migrations automatiques avec Drizzle

### Variables d'Environnement
- `DATABASE_URL` : Connexion PostgreSQL
- `NEXTAUTH_SECRET` : Secret NextAuth
- `NEXTAUTH_URL` : URL de l'application
- `WHATSAPP_SESSION_PATH` : Chemin de session WhatsApp

---

*Structure mise à jour le : $(date)*
*Version : 1.0.0 (Post-migration Drizzle)*