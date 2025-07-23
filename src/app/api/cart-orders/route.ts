import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';

const prisma = new PrismaClient();

// Configuration authOptions inline
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestToken = searchParams.get('guestToken');
  const userId = searchParams.get('userId');
  const phoneUserId = searchParams.get('phoneUserId');

  let where: any = {};
  
  // Priorité : userId de la session, puis phoneUserId, puis userId des paramètres, puis guestToken
  const session = await getServerSession(authOptions);
  if (session && session.user?.id) {
    where.user = { id: session.user.id };
  } else if (phoneUserId) {
    // Pour l'authentification par téléphone, chercher par ID utilisateur
    where.user = { id: phoneUserId };
  } else if (userId) {
    where.user = { id: userId };
  } else if (guestToken) {
    where.guestToken = guestToken;
  } else {
    return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
  }

  // Ne récupérer que les commandes dans le panier
  where.status = "IN_CART";

  const orders = await prisma.cartOrder.findMany({
    where,
    include: { book: true }
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { bookId, quantity = 1, guestToken, phoneUserId } = body;

    console.log('POST /api/cart-orders - Body:', body);
    console.log('POST /api/cart-orders - Session:', session);

    let userId = null;
    if (session && session.user?.id) {
      userId = session.user.id;
      console.log('Utilisation session userId:', userId);
    } else if (phoneUserId) {
      userId = phoneUserId;
      console.log('Utilisation phoneUserId:', userId);
    } else if (!guestToken) {
      console.log('Erreur: Non authentifié et pas de guestToken');
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }

    console.log('Final userId:', userId);

    const newOrder = await prisma.cartOrder.create({
      data: {
        book: { connect: { id: Number(bookId) } },
        quantity,
        user: userId ? { connect: { id: userId } } : undefined,
        guestToken: guestToken || null,
        status: "IN_CART",
      },
      include: { book: true }
    });

    console.log('Commande créée avec succès:', newOrder);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (e) {
    console.error("Erreur lors de la création de la commande :", e);
    return new NextResponse("Une erreur interne du serveur est survenue.", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { bookId, quantity, guestToken, phoneUserId } = body;

    console.log('PUT /api/cart-orders - Body:', body);
    console.log('PUT /api/cart-orders - Session:', session);

    if (!bookId || quantity === undefined) {
      console.log('Erreur: bookId et quantity requis');
      return new NextResponse('bookId et quantity requis', { status: 400 });
    }

    let where: any = {};
    
    // Priorité : session, puis phoneUserId, puis guestToken
    if (session && session.user?.id) {
      where.user = { id: session.user.id };
      console.log('Utilisation session userId:', session.user.id);
    } else if (phoneUserId) {
      where.user = { id: phoneUserId };
      console.log('Utilisation phoneUserId:', phoneUserId);
    } else if (guestToken) {
      where.guestToken = guestToken;
      console.log('Utilisation guestToken:', guestToken);
    } else {
      console.log('Erreur: Non authentifié et pas de guestToken');
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }

    // Ajouter le statut IN_CART et bookId pour identifier l'article
    where.status = "IN_CART";
    where.bookId = Number(bookId);

    console.log('Condition WHERE pour mise à jour:', where);

    // Mettre à jour la quantité
    const updatedOrder = await prisma.cartOrder.updateMany({
      where,
      data: { quantity: Number(quantity) }
    });

    console.log('Commande mise à jour avec succès:', updatedOrder);
    return NextResponse.json({ success: true, updatedCount: updatedOrder.count });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error);
    if ((error as any).code === 'P2025') { 
        console.log('Erreur P2025: Commande non trouvée');
        return new NextResponse("Commande non trouvée ou non autorisée.", { status: 404 });
    }
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bookId = searchParams.get('bookId');
    const guestToken = searchParams.get('guestToken');
    const userId = searchParams.get('userId');
    const phoneUserId = searchParams.get('phoneUserId');

    console.log('DELETE /api/cart-orders - Paramètres:', { id, bookId, guestToken, userId, phoneUserId, sessionUser: session?.user?.id });

    if (!id && !bookId) {
      console.log('Erreur: ID de commande ou bookId manquant');
      return new NextResponse('ID de commande ou bookId manquant', { status: 400 });
    }

    let where: any = {};
    
    // Priorité : session, puis phoneUserId, puis userId, puis guestToken
    if (session && session.user?.id) {
      where.user = { id: session.user.id };
      console.log('Utilisation session userId:', session.user.id);
    } else if (phoneUserId) {
      where.user = { id: phoneUserId };
      console.log('Utilisation phoneUserId:', phoneUserId);
    } else if (userId) {
      where.user = { id: userId };
      console.log('Utilisation userId:', userId);
    } else if (guestToken) {
      where.guestToken = guestToken;
      console.log('Utilisation guestToken:', guestToken);
    } else {
      console.log('Erreur: Non authentifié et pas de guestToken');
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }

    // Ajouter le statut IN_CART pour s'assurer qu'on ne supprime que les articles du panier
    where.status = "IN_CART";

    // Si on a un ID de commande, l'utiliser pour une suppression unique
    if (id) {
      where.id = Number(id);
      console.log('Condition WHERE pour suppression unique:', where);
      
      await prisma.cartOrder.delete({
        where,
      });
    } else if (bookId) {
      // Sinon, chercher par bookId et supprimer toutes les occurrences
      where.bookId = Number(bookId);
      console.log('Condition WHERE pour suppression multiple:', where);
      
      await prisma.cartOrder.deleteMany({
        where,
      });
    }

    console.log('Commande(s) supprimée(s) avec succès');
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Erreur lors de la suppression d'une commande :", error);
    if ((error as any).code === 'P2025') { 
        console.log('Erreur P2025: Commande non trouvée');
        return new NextResponse("Commande non trouvée ou non autorisée.", { status: 404 });
    }
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
} 