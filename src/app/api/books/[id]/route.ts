// src/app/api/books/[id]/route.ts
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { books } from '../../../../db/schema';

// Le deuxième argument 'context' contient les paramètres de l'URL
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const bookResult = await db.select().from(books).where(eq(books.id, parseInt(id, 10))).limit(1);
    const book = bookResult[0];

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
