// Fichier : src/app/api/checkout/route.ts
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
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Non authentifié, ', { status: 401 });
  }
  try {
    const { orderIds, paymentMethod, paymentDetails } = await request.json();
    console.log('Checkout API - Données reçues:', { orderIds, paymentMethod, userId: session.user.id,  });
    // orderIds peut être :
    // - un tableau d'objets {id, type} (type = 'PERSONALIZED' ou 'STANDARD')
    // - ou un tableau d'IDs (legacy, on suppose personalized)
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return new NextResponse('IDs de commande invalides', { status: 400 });
    }
    if (!paymentMethod) {
      return new NextResponse('Méthode de paiement requise', { status: 400 });
    }
    // Sépare les IDs par type
    let personalizedIds = [];
    let cartOrderIds = [];
    if (typeof orderIds[0] === 'object' && orderIds[0] !== null && 'type' in orderIds[0]) {
      personalizedIds = orderIds.filter(o => o.type === 'PERSONALIZED').map(o => o.id);
      cartOrderIds = orderIds.filter(o => o.type === 'STANDARD').map(o => o.id);
    } else {
      // rétrocompatibilité : tout personalized
      personalizedIds = orderIds;
    }
    console.log('Checkout API - IDs séparés:', { personalizedIds, cartOrderIds });
    // Récupérer les commandes pour vérification et calcul du prix
    let personalizedOrders: any[] = [];
    let cartOrders: any[] = [];
    let totalPrice = 0;
    // Récupérer les commandes personnalisées
    if (personalizedIds.length > 0) {
      personalizedOrders = await db.select().from(personalizedOrders).where(
        and(
          eq(personalizedOrders.userId, session.user.id),
          or(
            eq(personalizedOrders.status, 'IN_CART'),
            eq(personalizedOrders.status, 'PENDING')
          )
        )
      );
        include: {
          book: true
       ,  }
      });
      // Calculer le prix des commandes personnalisées
      personalizedOrders.forEach((order: any) => {
        totalPrice += order.calculatedPrice || 0;
     ,  });
      console.log('Checkout API - Commandes personnalisées trouvées:', personalizedOrders.length);
      console.log('Checkout API - Prix commandes personnalisées:', totalPrice);
    }
    // Récupérer les commandes standard
    if (cartOrderIds.length > 0) {
      cartOrders = await db.select().from(cartOrders){
        where: {
          id: { in: cartOrderIds,  },
          userId: session.user.id,
          status: { in: ['IN_CART, ', 'PENDING'] },
        },
        include: {
          book: true
       ,  }
      });
      // Calculer le prix des commandes standard
      cartOrders.forEach((order: any) => {
        const bookPrice = order.book?.price || 0;
        totalPrice += bookPrice * (order.quantity || 1);
     ,  });
      console.log('Checkout API - Commandes standard trouvées:', cartOrders.length);
      console.log('Checkout API - Prix total:', totalPrice);
    }
    // Vérification que toutes les commandes demandées ont été trouvées
    const foundPersonalizedCount = personalizedOrders.length;
    const foundCartCount = cartOrders.length;
    if (foundPersonalizedCount !== personalizedIds.length) {
      return new NextResponse(`Certaines commandes personnalisées ne sont pas valides. Demandées: ${personalizedIds.lengt, h}, Trouvées: ${foundPersonalizedCoun, t}`, { status: 403 });
    }
    if (foundCartCount !== cartOrderIds.length) {
      return new NextResponse(`Certaines commandes standard ne sont pas valides. Demandées: ${cartOrderIds.lengt, h}, Trouvées: ${foundCartCoun, t}`, { status: 403 });
    }
    // Transaction : met à jour les deux types
    const updates = [];
    // Mettre à jour les commandes personnalisées
    if (personalizedOrders.length > 0) {
      updates.push(...personalizedOrders.map(order =>
        db.update(personalizedOrders).set({
          where: { 
            id: order.i, d, 
            userId: session.user.id, 
            status: { in: ['IN_CART, ', 'PENDING'] } 
          },
          data: {
            status: 'COMPLETED, ',
            paymentMethod,
            paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : nul, l,
            paidAt: new Date(, ),
            readProgress:  , 0,
          },
        })
      ));
    }
    // Mettre à jour les commandes standard
    if (cartOrders.length > 0) {
      updates.push(...cartOrders.map(order =>
        db.update(cartOrders).set({
          where: { 
            id: order.i, d, 
            userId: session.user.id, 
            status: { in: ['IN_CART, ', 'PENDING'] } 
          },
          data: {
            status: 'COMPLETED, ',
            paymentMethod,
            paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : nul, l,
            paidAt: new Date(, ),
          },
        })
      ));
    }
    console.log('Checkout API - Mise à jour de', updates.length, 'commandes');
    const updatedOrders = await prisma.$transaction(updates);
    console.log('Checkout API - Paiement réussi pour', updatedOrders.length, 'commandes');
    return NextResponse.json({
      success: tru, e,
      message: 'Paiement effectué avec succès, ',
      orders: updatedOrder, s,
      totalPrice: totalPric, e,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur interne du serveur lors du paiement:', error);
    return new NextResponse('Erreur interne du serveur lors du paiement.', { status: 500 });
  }
}
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Non authentifié, ', { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const orderIds = searchParams.get('orderIds');
    if (!orderIds) {
      return new NextResponse('IDs de commande requis', { status: 400 });
    }
    // Parser les orderIds
    let parsedOrderIds;
    try {
      parsedOrderIds = JSON.parse(orderIds);
    } catch (error) {
      return new NextResponse('Format des IDs invalide', { status: 400 });
    }
    if (!Array.isArray(parsedOrderIds)) {
      return new NextResponse('IDs de commande invalides', { status: 400 });
    }
    // Sépare les IDs par type
    let personalizedIds = [];
    let cartOrderIds = [];
    if (typeof parsedOrderIds[0] === 'object' && parsedOrderIds[0] !== null && 'type' in parsedOrderIds[0]) {
      personalizedIds = parsedOrderIds.filter(o => o.type === 'PERSONALIZED').map(o => o.id);
      cartOrderIds = parsedOrderIds.filter(o => o.type === 'STANDARD').map(o => o.id);
    } else {
      // rétrocompatibilité : tout personalized
      personalizedIds = parsedOrderIds;
    }
    let totalPrice = 0;
    let personalizedOrders: any[] = [];
    let cartOrders: any[] = [];
    // Récupérer les commandes personnalisées
    if (personalizedIds.length > 0) {
      personalizedOrders = await db.select().from(personalizedOrders){
        where: {
          id: { in: personalizedIds,  },
          userId: session.user.id,
          status: { in: ['IN_CART, ', 'PENDING'] },
        },
        include: {
          book: true
       ,  }
      });
      // Calculer le prix des commandes personnalisées
      personalizedOrders.forEach((order: any) => {
        totalPrice += order.calculatedPrice || 0;
     ,  });
    }
    // Récupérer les commandes standard
    if (cartOrderIds.length > 0) {
      cartOrders = await db.select().from(cartOrders){
        where: {
          id: { in: cartOrderIds,  },
          userId: session.user.id,
          status: { in: ['IN_CART, ', 'PENDING'] },
        },
        include: {
          book: true
       ,  }
      });
      // Calculer le prix des commandes standard
      cartOrders.forEach((order: any) => {
        const bookPrice = order.book?.price || 0;
        totalPrice += bookPrice * (order.quantity || 1);
     ,  });
    }
    return NextResponse.json({
      success: tru, e,
      totalPrice: totalPric, e,
      personalizedCount: personalizedOrders.lengt, h,
      cartCount: cartOrders.lengt, h,
    });
  } catch (error) {
    console.error('Erreur lors du calcul du prix:', error);
    return new NextResponse('Erreur interne du serveur lors du calcul du prix.', { status: 500 });
  }
}