# Explication détaillée de la réalisation du projet TrustFolio

## 1. Présentation générale

TrustFolio est une plateforme web qui permet aux parents de créer et commander des livres personnalisés pour leurs enfants. L'utilisateur peut :
- Parcourir un catalogue de livres filtrable (par prix, valeurs, langue, etc.)
- Personnaliser un livre (prénom, valeurs, langue, etc.)
- Ajouter des livres au panier et aux favoris
- Commander et suivre ses achats

L'objectif est de rendre la lecture plus inclusive, éducative et adaptée à la culture africaine.

---

## 2. Technologies utilisées

### Next.js
- Framework React pour le rendu côté serveur (SSR), le routage, et l’API intégrée.
- Utilisé pour :
  - Le routage des pages (`/livres`, `/contact`, `/personaliser/[id]`)
  - Les routes API internes (`/api/books`, `/api/orders`)

### React
- Bibliothèque pour construire des interfaces utilisateur réactives et modulaires.
- Utilisé pour :
  - Les composants réutilisables (`BookGrid`, `BookModal`, filtres, carrousels, etc.)

### TypeScript
- Surcouche de JavaScript pour la sécurité de typage et la robustesse du code.
- Utilisé pour :
  - Typage strict des hooks, props, et modèles de données (`Book`, `Order`, etc.)

### Prisma
- ORM moderne pour interagir avec la base de données.
- Utilisé pour :
  - Modéliser la base (livres, utilisateurs, commandes, valeurs, etc.)
  - Gérer les migrations et requêtes typées

### Tailwind CSS
- Framework CSS utilitaire pour un design rapide, responsive et moderne.
- Utilisé pour :
  - Styliser toutes les pages et composants
  - Gérer le dark mode

### NextAuth
- Authentification (email, réseaux sociaux, téléphone).
- Utilisé pour :
  - Connexion sécurisée et gestion des sessions utilisateur

### Zustand
- Gestion d’état légère pour le panier et les favoris.
- Utilisé pour :
  - Stocker l’état du panier et des favoris côté client, avec persistance locale

### Framer Motion
- Animations fluides et modernes (ex : apparition au scroll, modales).
- Utilisé pour :
  - Effets d’entrée au scroll (`AnimateOnScroll`)
  - Animations de modales (`BookModal`)

### Swiper.js
- Carrousels interactifs pour les livres et témoignages.
- Utilisé pour :
  - Afficher les livres en carrousel sur la page d’accueil

### React-Toastify
- Affichage de notifications utilisateur (succès, erreurs, etc.)

### API REST intégrée
- Endpoints personnalisés pour la gestion des livres, commandes, utilisateurs, etc.
- Utilisé pour :
  - `/api/books`, `/api/orders`, `/api/values`, etc.

---

## 3. Structure du projet

- `/src/app` : Pages principales (accueil, livres, contact, personnalisation, etc.)
- `/src/components` : Composants réutilisables (`BookGrid`, `BookModal`, filtres, carrousels, etc.)
- `/src/store` : Stores Zustand pour le panier, favoris, etc.
- `/src/types` : Types TypeScript partagés (`Book`, `Order`, `Value`, etc.)
- `/src/app/api` : Endpoints API Next.js (livres, commandes, etc.)
- `/public` : Images, logos, fichiers statiques

---

## 4. Détail des technologies principales

### Next.js
- Génère des pages statiques (SSG) ou dynamiques (SSR) pour de meilleures performances et SEO.
- Les routes API (dans `/src/app/api/`) permettent de gérer les données sans backend séparé.
- Exemple : la page `/livres` affiche le catalogue, la route `/api/books` fournit les données.

### Prisma
- Le schéma Prisma (`prisma/schema.prisma`) définit les modèles (Book, User, Order, Value, etc.).
- Les migrations créent/modifient la base de données automatiquement.
- Exemple : `prisma.book.findMany()` récupère tous les livres pour l’API.

### Tailwind CSS
- Les classes utilitaires (`bg-white`, `rounded-lg`, `text-orange-500`, etc.) sont utilisées partout pour le style.
- Le dark mode est géré automatiquement avec `dark:`.

### Zustand
- Permet de stocker l’état du panier et des favoris côté client, avec persistance dans le localStorage.
- Exemple : `useCartStore` gère l’ajout, la suppression et la quantité des livres dans le panier.

### Framer Motion
- Utilisé pour animer l’apparition des sections (ex : AnimateOnScroll) et les modales (BookModal).

---

## 5. Démarche de réalisation (exemple étape par étape)

1. **Initialisation du projet**
   - Création du projet avec `npx create-next-app@latest` et configuration TypeScript.
   - Installation des dépendances principales (Prisma, Tailwind, Zustand, etc.).
2. **Modélisation de la base de données**
   - Définition du schéma Prisma (livres, valeurs, utilisateurs, commandes, etc.).
   - Migration de la base de données et génération des types.
3. **Développement des pages principales**
   - Page d’accueil avec carrousel, présentation, CTA.
   - Page catalogue avec filtres dynamiques (prix, valeurs, langue, etc.).
   - Page de personnalisation d’un livre (formulaire multi-étapes).
   - Page panier et gestion des commandes.
4. **Création des composants réutilisables**
   - Grille de livres (`BookGrid`), modale de détails (`BookModal`), filtres, carrousels, etc.
   - Gestion des interactions (ajout au panier, favoris, modale, etc.).
5. **Intégration de l’authentification**
   - NextAuth pour la connexion classique et par téléphone.
   - Gestion du panier pour les invités et les utilisateurs connectés.
6. **Ajout des animations et du design**
   - Utilisation de Tailwind pour le style et Framer Motion pour les animations.
   - Responsive design et dark mode.
7. **Tests et débogage**
   - Vérification des fonctionnalités principales (filtres, panier, personnalisation, etc.).
   - Correction des bugs et amélioration de l’UX.
8. **Déploiement**
   - Déploiement sur Vercel ou autre plateforme compatible Next.js.
   - Configuration des variables d’environnement et de la base de données en production.

---

**N’hésite pas à détailler chaque étape selon ton expérience, à ajouter des captures d’écran, ou à expliquer les choix techniques importants (ex : pourquoi Zustand plutôt que Redux, pourquoi Next.js, etc.).** 