// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Utilise le client partagé

// Le deuxième argument 'context' contient les paramètres de l'URL
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const book = await prisma.book.findUnique({
      where: {
        // On convertit l'ID de l'URL (qui est une chaîne) en nombre
        id: parseInt(id, 10),
      },
    });

    // Si aucun livre n'est trouvé, renvoyer une erreur 404
    if (!book) {
      return new NextResponse(`Livre avec l'ID ${id} non trouvé.`, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error(`Erreur lors de la récupération du livre ${id}:`, error);
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}