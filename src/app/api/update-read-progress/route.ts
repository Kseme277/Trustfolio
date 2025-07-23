// Fichier : src/app/api/update-read-progress/route.ts

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

export async function POST(request: Request) {
  // Vérifie l'authentification de l'utilisateur
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Non authentifié', { status: 401 });
  }

  try {
    // Récupère l'ID de la commande et la progression depuis le corps de la requête
    const { orderId, progress } = await request.json();

    // Valide les données reçues
    if (typeof orderId !== 'number' || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return new NextResponse('Données invalides : orderId (nombre) et progress (0-100) sont requis.', { status: 400 });
    }

    // Met à jour la progression de lecture de la commande dans la base de données
    const updatedOrder = await prisma.personalizedOrder.update({
      where: {
        id: orderId, // Identifie la commande par son ID
        userId: session.user.id, // SÉCURITÉ : L'utilisateur ne peut mettre à jour que ses propres livres
      },
      data: {
        readProgress: progress, // Met à jour le champ readProgress
      },
    });

    // Retourne la commande mise à jour avec un statut 200 OK
    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression de lecture :", error);
    // Gère le cas où l'enregistrement n'est pas trouvé (par exemple, ID incorrect ou pas l'utilisateur)
    if ((error as any).code === 'P2025') { 
      return new NextResponse('Livre personnel non trouvé ou non autorisé.', { status: 404 });
    }
    // Gère les autres erreurs serveur
    return new NextResponse('Erreur interne du serveur.', { status: 500 });
  }
}