# Migration de Prisma vers Drizzle ORM

Ce guide détaille la migration complète de Prisma vers Drizzle ORM pour le projet Trustfolio.

## ✅ Étapes Complétées

### 1. Configuration Drizzle
- ✅ Installation des dépendances Drizzle (`drizzle-orm`, `drizzle-kit`, `postgres`, `@auth/drizzle-adapter`)
- ✅ Création du fichier de configuration `drizzle.config.ts`
- ✅ Création du schéma Drizzle dans `src/db/schema.ts`
- ✅ Création du client de base de données dans `src/db/index.ts`
- ✅ Génération des migrations Drizzle

### 2. Migration des Fichiers API
- ✅ `src/app/api/books/route.ts` - Migration complète
- ✅ `src/app/api/books/[id]/route.ts` - Migration complète
- ✅ `src/app/api/values/route.ts` - Migration complète
- ✅ `src/lib/authOptions.ts` - Migration vers DrizzleAdapter

### 3. Scripts et Configuration
- ✅ Mise à jour du `package.json` avec les nouveaux scripts Drizzle
- ✅ Création du fichier de seed Drizzle `src/db/seed.ts`
- ✅ Suppression des dépendances Prisma

## 🔄 Étapes Restantes

### Fichiers API à Migrer
Les fichiers suivants utilisent encore Prisma et doivent être migrés :

- `src/app/api/auth/verify-code/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/session/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/phone/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/clear/route.ts`
- `src/app/api/orders/pay/route.ts`
- `src/app/api/orders/types-count/route.ts`
- `src/app/api/cart-orders/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/generate-book-content/route.ts`
- `src/app/api/update-read-progress/route.ts`
- `src/app/api/users/route.ts`
- `src/app/api/register/route.ts`

## 📋 Instructions de Migration

### 1. Sauvegarde des Données
Avant de procéder, assurez-vous d'avoir une sauvegarde complète de votre base de données.

### 2. Migration des Données
```bash
# Générer les migrations Drizzle
npm run db:generate

# Appliquer les migrations (ATTENTION: cela va recréer les tables)
npm run db:push

# Exécuter le seed pour repeupler les données de base
npm run db:seed
```

### 3. Patterns de Migration

#### Remplacement des Imports
```typescript
// Ancien (Prisma)
import { PrismaClient } from '@prisma/client';
import prisma from '../../../../lib/prisma';

// Nouveau (Drizzle)
import { eq, desc, asc } from 'drizzle-orm';
import { db } from '../../../db';
import { users, books, values } from '../../../db/schema';
```

#### Remplacement des Requêtes

**Lecture (SELECT)**
```typescript
// Prisma
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({ where: { id: 1 } });

// Drizzle
const users = await db.select().from(users);
const userResult = await db.select().from(users).where(eq(users.id, 1)).limit(1);
const user = userResult[0];
```

**Création (INSERT)**
```typescript
// Prisma
const newUser = await prisma.user.create({ data: { name: 'John', email: 'john@example.com' } });

// Drizzle
const newUser = await db.insert(users).values({ name: 'John', email: 'john@example.com' }).returning();
```

**Mise à jour (UPDATE)**
```typescript
// Prisma
const updatedUser = await prisma.user.update({ where: { id: 1 }, data: { name: 'Jane' } });

// Drizzle
const updatedUser = await db.update(users).set({ name: 'Jane' }).where(eq(users.id, 1)).returning();
```

**Suppression (DELETE)**
```typescript
// Prisma
await prisma.user.delete({ where: { id: 1 } });

// Drizzle
await db.delete(users).where(eq(users.id, 1));
```

### 4. Gestion des Relations

Drizzle utilise des jointures explicites pour les relations :

```typescript
// Prisma
const ordersWithBooks = await prisma.personalizedOrder.findMany({
  include: { book: true }
});

// Drizzle
const ordersWithBooks = await db
  .select()
  .from(personalizedOrders)
  .leftJoin(books, eq(personalizedOrders.bookId, books.id));
```

## 🗂️ Structure des Fichiers

```
src/
├── db/
│   ├── index.ts          # Client de base de données
│   ├── schema.ts         # Schémas des tables
│   └── seed.ts           # Script de seed
├── lib/
│   └── authOptions.ts    # Configuration NextAuth avec Drizzle
drizzle.config.ts         # Configuration Drizzle
drizzle/                  # Dossier des migrations générées
```

## 🚀 Avantages de Drizzle

1. **Performance** : Requêtes SQL plus optimisées
2. **Type Safety** : Typage TypeScript complet
3. **Flexibilité** : Contrôle total sur les requêtes SQL
4. **Taille** : Bundle plus léger que Prisma
5. **Migrations** : Système de migration plus transparent

## ⚠️ Points d'Attention

1. **Relations** : Drizzle nécessite des jointures explicites
2. **Transactions** : Syntaxe différente pour les transactions
3. **Validation** : Pas de validation automatique des données
4. **Migrations** : Les migrations doivent être gérées manuellement

## 🔧 Scripts Disponibles

```bash
npm run db:generate    # Générer les migrations
npm run db:migrate     # Appliquer les migrations
npm run db:push        # Pousser le schéma vers la DB
npm run db:studio      # Interface graphique Drizzle Studio
npm run db:seed        # Exécuter le seed
```

## 📞 Support

En cas de problème lors de la migration, vérifiez :
1. La variable d'environnement `DATABASE_URL`
2. La compatibilité des types de données
3. Les relations entre les tables
4. Les contraintes de clés étrangères