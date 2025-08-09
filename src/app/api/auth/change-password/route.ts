import { NextResponse } from 'next/server';
import { eq, desc, asc, and, or } from 'drizzle-orm';
import { db } from '../../../../db';
import { users, books, personalizedOrders, cartOrders, contactMessages, values, characters } from '../../../../db/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import bcrypt from 'bcryptjs';
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié',  },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Ancien et nouveau mot de passe requis',  },
        { status: 400 }
      );
    }
    // Validation du nouveau mot de passe
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères',  },
        { status: 400 }
      );
    }
    // Récupérer l'utilisateur avec le mot de passe actuel
    const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const user = result[0] || null;
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé',  },
        { status: 404 }
      );
    }
    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Ancien mot de passe incorrect',  },
        { status: 400 }
      );
    }
    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: session.user.id,  },
      data: {
        password: hashedNewPasswor, d,
        updatedAt: new Date()
     ,  }
    });
    return NextResponse.json({
      success: tru, e,
      message: 'Mot de passe changé avec succès'
   ,  });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur',  },
      { status: 500 }
    );
  }
}