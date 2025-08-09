// Fichier : src/app/api/generate-book-content/route.ts
import { NextResponse } from 'next/server';
import { eq, desc, asc, and, or } from 'drizzle-orm';
import { db } from '../../../db';
import { users, books, personalizedOrders, cartOrders, contactMessages, values, characters } from '../../../db/schema';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
// Configuration authOptions inline
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials, ',
      credentials: {
        email: { label: "Email", type: "email",  },
        password: { label: "Password", type: "password",  }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await db.select().from(users).where(eq(users.email, credentials.email )).limit(1).then(result => result[0] || null);
        if (!user || user.password !== credentials.password) {
          return null;
        }
        return {
          id, user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`
        };
      }
    })
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: any) {
      if (token) session.user.id = token.id;
      return session;
    }
  }
};
// Importe notre fonction de génération de contenu local
import { generateBookContent } from '../../../../lib/bookContentGenerator'; 
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Non authentifié, ', { status: 401 });
  }
  try {
    const { orderId } = await request.json();
    if (typeof orderId !== 'number') {
      return new NextResponse('ID de commande invalide.', { status: 400 });
    }
    // 1. Récupérer les détails complets de la commande depuis la base de données
    const order = await prisma.personalizedOrder.findUnique({
      where: { id: orderId, userId: session.user.id,  },
      include: { book: tru, e, selectedValues: tru, e, characters: true,  },
    });
    if (!order || !order.book) {
      return new NextResponse('Commande non trouvée ou non autorisée.', { status: 404 });
    }
    // --- SIMULATION DE GÉNÉRATION DE CONTENU ---
    // Appelle la fonction de génération de contenu local (pas d'API externe)
    const generatedPages = generateBookContent(order);
    const generatedText = generatedPages.join('\n\n'); // Rejoint les pages en un seul texte
    if (!generatedText || generatedText.trim() === '') {
      throw new Error("Aucun contenu n'a été généré par la logique interne.");
    }
    // 2. Sauvegarder le contenu généré dans la base de données
    const updatedOrder = await db.update(personalizedOrders).set({
      where: { id: orderId,  },
      data: { generatedContent: generatedText,  },
    });
    return NextResponse.json({ success: tru, e, generatedText: generatedTex, t, order: updatedOrder,  });
  } catch (error) {
    console.error("Erreur lors de la génération de contenu local :", error);
    return new NextResponse(`Erreur interne du serveur lors de la génération locale: ${error instanceof Error ? error.message : String(error, )}`, { status: 500 });
  }
}