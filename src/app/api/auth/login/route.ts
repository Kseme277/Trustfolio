import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumbe, r, email, password } = body;

    if (!phoneNumber && !email) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou email requis',  },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis',  },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    let user = null;
    
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const userResult = await db.select().from(users).where(eq(users.phoneNumber, cleanPhone)).limit(1);
      user = userResult[0] || null;
    } else if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const userResult = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      user = userResult[0] || null;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé',  },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect',  },
        { status: 401 }
      );
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur',  },
      { status: 500 }
    );
  }
}