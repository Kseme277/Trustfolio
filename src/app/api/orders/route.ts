// Fichier : src/app/api/orders/route.ts
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
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1).then(result => result[0] || null);
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
// Définition des détails des packs (packDetails)
const packDetails = {
  Basique: { 
    characters: 1, 
    price: 800.0, 
    maxLanguages: 1, 
    maxValues: 2, 
    languages: ['Français', 'Anglais'] 
  },
  Standard: { 
    characters: 2, 
    price: 1400.0, 
    maxLanguages: 2, 
    maxValues: 4, 
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol'] 
  },
  Prestige: { 
    characters: 5, 
    price: 1800.0, 
    maxLanguages: 4, 
    maxValues: 6, 
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Arabe', 'Swahili'] 
  },
};
/**
 * Gère la requête GET pour récupérer les commandes personnalisées de l'utilisateur connecté.
 * Supporte le filtrage par statut et par ID de commande.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestToken = searchParams.get('guestToken');
  const userId = searchParams.get('userId');
  const phoneUserId = searchParams.get('phoneUserId');
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const includeCartOrders = searchParams.get('includeCartOrders') === 'true';
  // Récupérer la session pour les requêtes authentifiées
  const session = await getServerSession(authOptions);
  let sessionUserId = null;
  if (session && session.user?.id) {
    sessionUserId = session.user.id;
  }
  let whereConditions = [];
  
  // Priorité : userId de la session, puis phoneUserId, puis userId des paramètres, puis guestToken
  if (sessionUserId) {
    whereConditions.push(eq(personalizedOrders.userId, sessionUserId));
  } else if (phoneUserId) {
    whereConditions.push(eq(personalizedOrders.userId, phoneUserId));
  } else if (userId) {
    whereConditions.push(eq(personalizedOrders.userId, userId));
  } else if (guestToken) {
    whereConditions.push(eq(personalizedOrders.guestToken, guestToken));
  } else {
    return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
  }
  
  if (orderId) {
    whereConditions.push(eq(personalizedOrders.id, Number(orderId)));
  }
  
  // Si status=all, on ne filtre pas sur le statut
  if (status && status !== 'all') {
    whereConditions.push(eq(personalizedOrders.status, status));
  } else if (!status) {
    // Par défaut, ne récupérer que les commandes dans le panier
    whereConditions.push(eq(personalizedOrders.status, 'IN_CART'));
  }
  // Récupérer les commandes personnalisées
  const orders = await db.select().from(personalizedOrders).where(and(...whereConditions));
  
  // Si on demande aussi les commandes standard
  let standardOrders: any[] = [];
  if (includeCartOrders) {
    let cartWhereConditions = [];
    
    if (sessionUserId) {
      cartWhereConditions.push(eq(cartOrders.userId, sessionUserId));
    } else if (phoneUserId) {
      cartWhereConditions.push(eq(cartOrders.userId, phoneUserId));
    } else if (userId) {
      cartWhereConditions.push(eq(cartOrders.userId, userId));
    } else if (guestToken) {
      cartWhereConditions.push(eq(cartOrders.guestToken, guestToken));
    }
    
    if (status && status !== 'all') {
      cartWhereConditions.push(eq(cartOrders.status, status));
    } else if (!status) {
      cartWhereConditions.push(eq(cartOrders.status, 'IN_CART'));
    }
    
    standardOrders = await db.select().from(cartOrders).where(and(...cartWhereConditions));
  }
  
  // Combiner les résultats
  const allOrders = [
    ...orders.map(order => ({ ...order, _type: 'PERSONALIZED' })),
    ...standardOrders.map(order => ({ ...order, _type: 'STANDARD' }))
  ];
  
  return NextResponse.json(allOrders);
}
/**
 * Gère la requête POST pour créer une nouvelle commande personnalisée.
 * Accepte un grand nombre de champs pour la personnalisation étendue et les personnages.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { 
      bookId, 
      guestToken, 
      packType,
      characters = [],
      valueIds = [],
      uploadedImages = [],
      paymentMethod, // Supprimer ces champs
      deliveryOption, // Supprimer ces champs
      ...rest 
    } = body;
    // Vérification des champs obligatoires
    if (!bookId) {
      console.error('POST /api/orders - bookId manquant', body);
      return NextResponse.json({ error: 'Le champ bookId est obligatoire.' }, { status: 400 });
    }
    if (!packType) {
      console.error('POST /api/orders - packType manquant', body);
      return NextResponse.json({ error: 'Le champ packType est obligatoire.' }, { status: 400 });
    }
    // Priorité : userId du body > session NextAuth > guestToken
    let userId = body.userId || null;
    if (!userId && session && session.user?.id) {
      userId = session.user.id;
    }
    if (!userId && !guestToken) {
      console.error('POST /api/orders - Non authentifié et pas de guestToken', body);
      return NextResponse.json({ error: 'Non authentifié et pas de guestToken.' }, { status: 400 });
    }
    // Récupérer le livre pour obtenir le prix original
    const bookResult = await db.select().from(books).where(eq(books.id, Number(bookId))).limit(1);
    const book = bookResult[0];
    if (!book) {
      return NextResponse.json({ error: 'Livre non trouvé.' }, { status: 404 });
    }
    // Calculer le prix selon le pack
    const packInfo = packDetails[packType as keyof typeof packDetails];
    if (!packInfo) {
      console.error('POST /api/orders - Pack invalide', body);
      return NextResponse.json({ error: 'Pack invalide.' }, { status: 400 });
    }
    const calculatedPrice = packInfo.price;
    const originalBookPrice = book.price;
    // Préparer les données de personnalisation pour l'IA
    const personalizationData = {
      childName: rest.childName,
      heroAgeRange: rest.heroAgeRange,
      mainTheme: rest.mainTheme,
      storyLocation: rest.storyLocation,
      residentialArea: rest.residentialArea,
      packType,
      bookLanguages: rest.bookLanguages || [],
      selectedValues: valueIds,
      messageSpecial: rest.messageSpecial,
      characters: characters.map((char: any) => ({
        name: char.name,
        relationshipToHero: char.relationshipToHero,
        animalType: char.animalType,
        sex: char.sex,
        age: char.age,
        photoUrl: char.photoUrl
      })),
      uploadedImages,
      createdAt: new Date().toISOString()
    };
    // Filtrer les champs pour ne garder que ceux qui existent dans le schéma
    const {
      userFullName,
      userPhoneNumber,
      deliveryAddress,
      city,
      postalCode,
      country,
      childName,
      heroAgeRange,
      mainTheme,
      storyLocation,
      residentialArea,
      childPhotoUrl,
      bookLanguages,
      messageSpecial,
      ...otherFields
    } = rest;
    const newOrder = await db.insert(personalizedOrders).values({
      bookId: Number(bookId),
      userId: userId || null,
      guestToken: guestToken || null,
      status: "IN_CART",
      calculatedPrice,
      originalBookPrice,
      uploadedImages: JSON.stringify(uploadedImages),
      personalizationData: JSON.stringify(personalizationData),
      packType,
      userFullName,
      userPhoneNumber,
      deliveryAddress,
      city,
      postalCode,
      country,
      childName,
      heroAgeRange,
      mainTheme,
      storyLocation,
      residentialArea,
      childPhotoUrl,
      bookLanguages: JSON.stringify(rest.bookLanguages || []),
      messageSpecial,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    const createdOrder = newOrder[0];
     return NextResponse.json(createdOrder, { status: 201 });
  } catch (e) {
    console.error("Erreur lors de la création de la commande :", e);
    if ((e as any).code === 'P2025') { 
      return new NextResponse("Une ressource liée (livre, valeur) n'a pas été trouvée ou est invalide.", { status: 404 });
    }
    return new NextResponse("Une erreur interne du serveur est survenue.", { status: 500 });
  }
}
/**
 * Gère la requête DELETE pour supprimer une commande spécifique.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('guestToken');
    const userId = searchParams.get('userId');
    const phoneUserId = searchParams.get('phoneUserId');
    const orderId = Number(params.id);
    let whereConditions = [eq(personalizedOrders.id, orderId)];
    
    // Priorité : session, puis phoneUserId, puis userId, puis guestToken
    if (session && session.user?.id) {
      whereConditions.push(eq(personalizedOrders.userId, session.user.id));
    } else if (phoneUserId) {
      whereConditions.push(eq(personalizedOrders.userId, phoneUserId));
    } else if (userId) {
      whereConditions.push(eq(personalizedOrders.userId, userId));
    } else if (guestToken) {
      whereConditions.push(eq(personalizedOrders.guestToken, guestToken));
    } else {
      return new NextResponse('Non authentifié et pas de guestToken', { status: 400 });
    }
    
    const deleteResult = await db.delete(personalizedOrders).where(and(...whereConditions));
    console.log('Commande supprimée avec succès');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression d'une commande :", error);
    if ((error as any).code === 'P2025') { 
        return new NextResponse("Commande non trouvée ou non autorisée.", { status: 404 });
    }
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}