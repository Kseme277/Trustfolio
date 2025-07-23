This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Configuration de l'environnement (.env)

Crée un fichier `.env` à la racine du projet avec le contenu suivant :

```
# Chaîne de connexion PostgreSQL pour Prisma
# Format général :
# postgresql://UTILISATEUR:MOTDEPASSE@HOTE:PORT/NOM_DE_LA_BASE

DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/nom_de_ta_db"
#            |            |           |         |      |
#            |            |           |         |      └─ nom de ta base de données PostgreSQL
#            |            |           |         └──────── port PostgreSQL (par défaut 5432)
#            |            |           └────────────────── adresse de l’hôte (localhost si en local)
#            |            └────────────────────────────── mot de passe de l’utilisateur PostgreSQL
#            └─────────────────────────────────────────── nom d’utilisateur PostgreSQL
```

Adapte la chaîne de connexion à ta configuration PostgreSQL.

## Installation et lancement du projet

1. **Installe les dépendances Node.js**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

2. **Configure le fichier `.env`** (voir section ci-dessus)

3. **Initialise la base de données**
   ```bash
   npx prisma migrate dev
   ```
   (Optionnel, pour insérer des données de test)
   ```bash
   npx prisma db seed
   ```

4. **Lance le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

## Gestion des migrations Prisma

Les migrations servent à synchroniser le schéma de ta base de données avec les modèles définis dans `prisma/schema.prisma`.

1. **Créer une migration après modification du schéma**
   ```bash
   npx prisma migrate dev --name nom_de_ta_migration
   ```
   Remplace `nom_de_ta_migration` par un nom qui décrit le changement (ex : `ajout_utilisateur`).

2. **Appliquer toutes les migrations existantes**
   ```bash
   npx prisma migrate dev
   ```
   Cela applique toutes les migrations non encore appliquées à ta base de données.

3. **Vérifier l’état des migrations**
   ```bash
   npx prisma migrate status
   ```
   Pour voir la liste des migrations et leur état.

4. **Insérer des données de test (seed)**
   ```bash
   npx prisma db seed
   ```
   Le script de seed est défini dans le fichier `prisma/seed.ts`.

## Configuration de l'environnement (.env)

Crée un fichier `.env` à la racine du projet avec le contenu suivant :

```
# Chaîne de connexion PostgreSQL pour Prisma
# Format général :
# postgresql://UTILISATEUR:MOTDEPASSE@HOTE:PORT/NOM_DE_LA_BASE

DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/nom_de_ta_db"
#            |            |           |         |      |
#            |            |           |         |      └─ nom de ta base de données PostgreSQL
#            |            |           |         └──────── port PostgreSQL (par défaut 5432)
#            |            |           └────────────────── adresse de l’hôte (localhost si en local)
#            |            └────────────────────────────── mot de passe de l’utilisateur PostgreSQL
#            └─────────────────────────────────────────── nom d’utilisateur PostgreSQL
```

Adapte la chaîne de connexion à ta configuration PostgreSQL.

## Installation et lancement du projet

1. **Installe les dépendances Node.js**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

2. **Configure le fichier `.env`** (voir section ci-dessus)

3. **Initialise la base de données**
   ```bash
   npx prisma migrate dev
   ```
   (Optionnel, pour insérer des données de test)
   ```bash
   npx prisma db seed
   ```

4. **Lance le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

## Gestion des migrations Prisma

Les migrations servent à synchroniser le schéma de ta base de données avec les modèles définis dans `prisma/schema.prisma`.

1. **Créer une migration après modification du schéma**
   ```bash
   npx prisma migrate dev --name nom_de_ta_migration
   ```
   Remplace `nom_de_ta_migration` par un nom qui décrit le changement (ex : `ajout_utilisateur`).

2. **Appliquer toutes les migrations existantes**
   ```bash
   npx prisma migrate dev
   ```
   Cela applique toutes les migrations non encore appliquées à ta base de données.

3. **Vérifier l’état des migrations**
   ```bash
   npx prisma migrate status
   ```
   Pour voir la liste des migrations et leur état.

4. **Insérer des données de test (seed)**
   ```bash
   npx prisma db seed
   ```
   Le script de seed est défini dans le fichier `prisma/seed.ts`.