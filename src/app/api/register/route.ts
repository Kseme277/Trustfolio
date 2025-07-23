// Fichier : src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs'; // Import de bcryptjs pour le hachage sécurisé du mot de passe

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json(); // Récupère le nom, l'email et le mot de passe

    // 1. Validation des champs requis
    if (!email || !password) {
      return new NextResponse('Email et mot de passe sont requis.', { status: 400 });
    }

    // 2. Vérifier si l'utilisateur existe déjà avec cet email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return new NextResponse('Cet email est déjà enregistré.', { status: 409 }); // 409 Conflict si l'email existe
    }

    // 3. Hacher le mot de passe avant de le sauvegarder dans la base de données
    // '10' est le "salt rounds", plus il est élevé, plus le hachage est sécurisé mais prend plus de temps.
    const hashedPassword = await bcrypt.hash(password, 10); 

    // 4. Créer le nouvel utilisateur dans la base de données
    const newUser = await prisma.user.create({
      data: {
        name: name, // Ajoute le nom d'utilisateur (peut être null si non fourni)
        email: email,
        password: hashedPassword,
        emailVerified: new Date(), // Marquer l'email comme vérifié pour la simplicité du MVP
      },
    });

    // 5. Ne pas retourner le mot de passe haché dans la réponse pour des raisons de sécurité
    const { password: _, ...userWithoutPass } = newUser;

    return NextResponse.json(userWithoutPass, { status: 201 }); // Réponse 201 Created pour succès
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return new NextResponse('Erreur interne du serveur lors de l\'inscription.', { status: 500 });
  }
}