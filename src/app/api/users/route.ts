import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../src/lib/authOptions';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Récupérer le profil utilisateur
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
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
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour le profil utilisateur
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthDate,
      address,
      city,
      country
    } = body;

    // Validation des données
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'Prénom et nom requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà (sauf pour l'utilisateur actuel)
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Un compte avec cet email existe déjà' },
          { status: 409 }
        );
      }
    }

    // Vérifier si le numéro de téléphone existe déjà (sauf pour l'utilisateur actuel)
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: cleanPhone,
          id: { not: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Un compte avec ce numéro de téléphone existe déjà' },
          { status: 409 }
        );
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.toLowerCase().trim(),
        phoneNumber: phoneNumber ? phoneNumber.replace(/\D/g, '') : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        address: address?.trim(),
        city: city?.trim(),
        country: country?.trim(),
        name: `${firstName?.trim()} ${lastName?.trim()}`,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
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

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Supprimer le compte utilisateur
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 