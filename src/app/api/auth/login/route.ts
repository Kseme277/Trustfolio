import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, email, password } = body;

    if (!phoneNumber && !email) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou email requis' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    let user = null;
    
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      user = await prisma.user.findFirst({
        where: { phoneNumber: cleanPhone }
      });
    } else if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 