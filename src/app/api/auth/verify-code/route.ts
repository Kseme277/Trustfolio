import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Stockage temporaire des codes (synchronisé avec l'API phone)
const tempCodes = new Map<string, {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
}>();

// Nettoyer les codes expirés
const cleanExpiredCodes = () => {
  const now = new Date();
  for (const [key, tempCode] of tempCodes.entries()) {
    if (tempCode.expiresAt < now) {
      tempCodes.delete(key);
    }
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et code requis' },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Nettoyer les codes expirés
    cleanExpiredCodes();

    // Vérifier le code
    const tempCode = tempCodes.get(cleanPhone);
    
    if (!tempCode || tempCode.code !== code) {
      return NextResponse.json(
        { error: 'Code incorrect ou expiré' },
        { status: 400 }
      );
    }

    // Code correct - supprimer le code utilisé
    tempCodes.delete(cleanPhone);

    // Chercher l'utilisateur
    const user = await prisma.user.findFirst({
      where: { phoneNumber: cleanPhone }
    });

    if (user) {
      // Utilisateur existant - retourner les informations de connexion
      return NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber
        },
        newUser: false
      });
    } else {
      // Nouvel utilisateur - rediriger vers l'inscription
      return NextResponse.json({
        success: true,
        message: 'Code vérifié, redirection vers inscription',
        newUser: true,
        phoneNumber: cleanPhone
      });
    }

  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 