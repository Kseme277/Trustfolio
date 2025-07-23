export const dynamic = "force-dynamic";
// Fichier : src/app/api/books/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Importe le client Prisma partagé

/**
 * Gère la requête GET pour récupérer tous les livres disponibles.
 *
 * Supporte le tri des résultats par :
 * - `sortBy`: 'createdAt' (par date d'ajout) ou 'price' (par prix).
 * - `order`: 'asc' (croissant) ou 'desc' (décroissant).
 *
 * Exemples d'utilisation :
 * - /api/books                    (Récupère tous les livres, tri par défaut par date d'ajout descendante)
 * - /api/books?sortBy=createdAt   (Récupère tous les livres, tri par défaut par date d'ajout descendante)
 * - /api/books?sortBy=createdAt&order=asc (Récupère les livres par date d'ajout ascendante)
 * - /api/books?sortBy=price&order=desc    (Récupère les livres par prix descendant)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url); // Récupère les paramètres d'URL de la requête
    const sortBy = searchParams.get('sortBy');     // Paramètre pour le champ de tri
    const order = searchParams.get('order');       // Paramètre pour l'ordre de tri ('asc' ou 'desc')

    let orderByClause: any = {}; // Initialise l'objet de tri pour Prisma

    // Logique pour construire la clause de tri en fonction des paramètres reçus
    if (sortBy === 'createdAt') {
      // Trie par 'createdAt', l'ordre par défaut est 'desc' (les plus récents en premier)
      orderByClause = { createdAt: order === 'asc' ? 'asc' : 'desc' };
    } else if (sortBy === 'price') {
      // Trie par 'price', l'ordre par défaut est 'asc'
      orderByClause = { price: order === 'asc' ? 'asc' : 'desc' };
    } else {
      // Si aucun paramètre de tri valide n'est spécifié, le tri par défaut est par date de création descendante
      orderByClause = { createdAt: 'desc' };
    }

    // Récupère les livres depuis la base de données en appliquant la clause de tri
    const books = await prisma.book.findMany({
      orderBy: orderByClause, // Applique la clause de tri construite
    });

    return NextResponse.json(books); // Retourne les livres au format JSON

  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error);
    return new NextResponse("Une erreur interne du serveur est survenue lors de la récupération des livres.", { status: 500 });
  }
}