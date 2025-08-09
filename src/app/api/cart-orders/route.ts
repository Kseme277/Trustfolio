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
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
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
  
  // Priorité : userId de la session, puis phoneUserId, puis userId des paramètres, puis guestToken
  const session = await getServerSession(authOptions);
  let whereConditions = [eq(cartOrders.status, "IN_CART")];
  
  if (session && session.user?.id) {
    whereConditions.push(eq(cartOrders.userId, session.user.id));
  } else if (phoneUserId) {
    whereConditions.push(eq(cartOrders.userId, phoneUserId));
  } else if (userId) {
    whereConditions.push(eq(cartOrders.userId, userId));
  } else if (guestToken) {
    whereConditions.push(eq(cartOrders.guestToken, guestToken));
  } else {
    return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
  }
  
  const orders = await db.select().from(cartOrders).where(and(...whereConditions));
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
      return new NextResponse('Non authentifié et pas de guestToken, ', { status: 400 });
    }
    console.log('Final userId:', userId);
    const newOrder = await db.insert(cartOrders).values({
      bookId: Number(bookId),
      quantity,
      userId: userId || null,
      guestToken: guestToken || null,
      status: "IN_CART"
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
    
    let whereConditions = [eq(cartOrders.status, "IN_CART"), eq(cartOrders.bookId, Number(bookId))];
    
    // Priorité : session, puis phoneUserId, puis guestToken
    if (session && session.user?.id) {
      whereConditions.push(eq(cartOrders.userId, session.user.id));
      console.log('Utilisation session userId:', session.user.id);
    } else if (phoneUserId) {
      whereConditions.push(eq(cartOrders.userId, phoneUserId));
      console.log('Utilisation phoneUserId:', phoneUserId);
    } else if (guestToken) {
      whereConditions.push(eq(cartOrders.guestToken, guestToken));
      console.log('Utilisation guestToken:', guestToken);
    } else {
      console.log('Erreur: Non authentifié et pas de guestToken');
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }
    
    console.log('Conditions WHERE pour mise à jour:', whereConditions);
    // Mettre à jour la quantité
    const updatedOrder = await db.update(cartOrders)
      .set({ quantity: Number(quantity) })
      .where(and(...whereConditions));
    
    console.log('Commande mise à jour avec succès:', updatedOrder);
    return NextResponse.json({ success: true, updated: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error);
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
    
    let whereConditions = [eq(cartOrders.status, "IN_CART")];
    
    // Priorité : session, puis phoneUserId, puis userId, puis guestToken
    if (session && session.user?.id) {
      whereConditions.push(eq(cartOrders.userId, session.user.id));
      console.log('Utilisation session userId:', session.user.id);
    } else if (phoneUserId) {
      whereConditions.push(eq(cartOrders.userId, phoneUserId));
      console.log('Utilisation phoneUserId:', phoneUserId);
    } else if (userId) {
      whereConditions.push(eq(cartOrders.userId, userId));
      console.log('Utilisation userId:', userId);
    } else if (guestToken) {
      whereConditions.push(eq(cartOrders.guestToken, guestToken));
      console.log('Utilisation guestToken:', guestToken);
    } else {
      console.log('Erreur: Non authentifié et pas de guestToken');
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }
    
    // Si on a un ID de commande, l'utiliser pour une suppression unique
    if (id) {
      whereConditions.push(eq(cartOrders.id, Number(id)));
      console.log('Condition WHERE pour suppression unique:', whereConditions);
      const deleteResult = await db.delete(cartOrders).where(and(...whereConditions));
      console.log('Commande supprimée avec succès');
    } else if (bookId) {
      // Sinon, chercher par bookId et supprimer toutes les occurrences
      whereConditions.push(eq(cartOrders.bookId, Number(bookId)));
      console.log('Condition WHERE pour suppression multiple:', whereConditions);
      await db.delete(cartOrders).where(and(...whereConditions));
      console.log('Commandes supprimées avec succès');
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression d'une commande :", error);
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}