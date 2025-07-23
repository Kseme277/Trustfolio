import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Configuration simplifiée de NextAuth
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        phoneNumber: { label: "Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.phoneNumber) {
          return null;
        }

        let user = null;
        
        if (credentials.email) {
          user = await prisma.user.findUnique({ 
            where: { email: credentials.email.toLowerCase().trim() } 
          });
        } else if (credentials.phoneNumber) {
          const cleanPhone = credentials.phoneNumber.replace(/\D/g, '');
          user = await prisma.user.findFirst({ 
            where: { phoneNumber: cleanPhone } 
          });
        }

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password || '', user.password);
        if (!isPasswordValid) {
          return null;
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: '/connexion'
  }
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Récupérer les informations complètes de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        birthDate: true,
        address: true,
        city: true,
        country: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Cette route peut être utilisée pour déconnecter l'utilisateur côté serveur
    // La déconnexion principale se fait côté client avec signOut()
    
    return NextResponse.json({
      success: true,
      message: 'Session supprimée'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 