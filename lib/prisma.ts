// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// On déclare une variable globale pour stocker le client Prisma.
// Cela évite de créer une nouvelle connexion à chaque requête en développement.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
