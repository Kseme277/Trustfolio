// Fichier : src/app/api/orders/route.ts

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

// Définition des détails des packs (packDetails)
const packDetails = {
  Basique: { 
    characters: 1, 
    price: 8000, 
    maxLanguages: 1, 
    maxValues: 2, 
    languages: ['Français', 'Anglais'] 
  },
  Standard: { 
    characters: 2, 
    price: 14000, 
    maxLanguages: 2, 
    maxValues: 4, 
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol'] 
  },
  Prestige: { 
    characters: 5, 
    price: 18000, 
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

  let where: any = {};
  
  // Priorité : userId de la session, puis phoneUserId, puis userId des paramètres, puis guestToken
  if (sessionUserId) {
    where.user = { id: sessionUserId };
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

  if (orderId) {
    where.id = Number(orderId);
  }

  // Si status=all, on ne filtre pas sur le statut
  if (status && status !== 'all') {
    where.status = status;
  } else if (!status) {
    // Par défaut, ne récupérer que les commandes dans le panier
    where.status = 'IN_CART';
  }

  // Récupérer les commandes personnalisées
  const personalizedOrders = await prisma.personalizedOrder.findMany({
    where,
    include: { 
      book: true,
      selectedValues: true,
      characters: true
    }
  });

  // Si on demande aussi les commandes standard
  let cartOrders: any[] = [];
  if (includeCartOrders) {
    cartOrders = await prisma.cartOrder.findMany({
      where: {
        user: where.user,
        guestToken: where.guestToken,
        status: status && status !== 'all' ? status : undefined
      },
      include: {
        book: true
      }
    });
  }

  // Combiner les résultats
  const allOrders = [
    ...personalizedOrders.map(order => ({ ...order, _type: 'PERSONALIZED' })),
    ...cartOrders.map(order => ({ ...order, _type: 'STANDARD' }))
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
    const book = await prisma.book.findUnique({
      where: { id: Number(bookId) }
    });

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

    const newOrder = await prisma.personalizedOrder.create({
      data: {
        book: { connect: { id: Number(bookId) } },
        user: userId ? { connect: { id: userId } } : undefined,
        guestToken: guestToken || null,
        status: "IN_CART",
        calculatedPrice,
        originalBookPrice,
        uploadedImages,
        personalizationData,
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
        bookLanguages,
        messageSpecial,
        // Connecter les valeurs sélectionnées
        selectedValues: {
          connect: valueIds.map((id: number) => ({ id }))
        },
        // Créer les personnages
        characters: {
          create: characters.map((char: any) => ({
            name: char.name,
            relationshipToHero: char.relationshipToHero,
            animalType: char.animalType || null,
            sex: char.sex || null,
            age: char.age || null,
            photoUrl: char.photoUrl || null
          }))
        }
      },
      include: { 
        book: true,
        selectedValues: true,
        characters: true
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
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
    if (!session || !session.user?.id) {
      return new NextResponse('Non authentifié', { status: 401 });
    }

    const orderId = Number(params.id);

    await prisma.personalizedOrder.delete({
      where: { id: orderId, user: { id: session.user.id } },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Erreur lors de la suppression d'une commande :", error);
    if ((error as any).code === 'P2025') { 
        return new NextResponse("Commande non trouvée ou non autorisée.", { status: 404 });
    }
    return new NextResponse("Erreur interne du serveur.", { status: 500 });
  }
}