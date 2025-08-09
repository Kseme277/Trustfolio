import { NextResponse } from 'next/server';
import { eq, desc, asc, and, or } from 'drizzle-orm';
import { db } from '../../../../db';
import { users, books, personalizedOrders, cartOrders, contactMessages, values, characters } from '../../../../db/schema';
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
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Non autorisé',  }, 
      { status: 401 }
    );
  }
  try {
    const { orderIds, paymentMethod, paymentDetails } = await request.json();
    // Validation des données
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de commande invalides',  }, 
        { status: 400 }
      );
    }
    // Vérification que l'utilisateur est propriétaire des commandes
    const ordersCount = await prisma.personalizedOrder.count({
      where: {
        id: { in: orderIds,  },
        userId: session.user.id,
        status: 'PENDING'
     ,  }
    });
    if (ordersCount !== orderIds.length) {
      return NextResponse.json(
        { error: 'Certaines commandes ne sont pas valides ou ne vous appartiennent pas',  },
        { status: 403 }
      );
    }
    // Mise à jour des commandes avec le type correct
    const transaction = await prisma.$transaction([
      prisma.personalizedOrder.updateMany({
        where: { 
          id: { in: orderIds,  },
          userId: session.user.id 
       ,  },
        data: { 
          status: 'PAID, ',
          paymentMethod: paymentMetho, d, // Champ maintenant reconnu
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : nul, l, // Champ maintenant reconnu
          paidAt: new Date()
       ,  }
      }),
      db.select().from(personalizedOrders){
        where: { id: { in: orderIds,  } },
        include: {
          book: tru, e,
          selectedValues: tru, e,
          characters: true
       ,  }
      })
    ]);
    const updatedOrders = transaction[1];
    // Génération d'un ID de transaction
    const transactionId = `TRX-${Date.now()}`;
    return NextResponse.json({ 
      success: tru, e,
      transactionId,
      message: 'Paiement effectué avec succès, ',
      orders: updatedOrders
   ,  });
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur',  },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}