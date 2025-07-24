import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Validation des données d'inscription
const validateRegistrationData = (data: any) => {
  const errors: string[] = [];
  // Champs requis : prénom, nom, téléphone
  if (!data.firstName?.trim()) errors.push('Prénom requis');
  if (!data.lastName?.trim()) errors.push('Nom requis');
  if (!data.phoneNumber?.trim()) errors.push('Numéro de téléphone requis');
  // Email optionnel, mais si fourni, doit être valide
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Format d\'email invalide');
  }
  // Numéro de téléphone : 8 à 15 chiffres
  if (data.phoneNumber) {
    const cleanPhone = data.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      errors.push('Format de numéro de téléphone invalide');
    }
  }
  return errors;
};

// Nettoyer le numéro de téléphone
const cleanPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/\D/g, '');
};

// Normaliser l'email
const normalizeEmail = (email: string) => {
  return email.toLowerCase().trim();
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      city,
      country
    } = body;
    // Validation des données
    const validationErrors = validateRegistrationData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    // Nettoyer et normaliser les données
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    const normalizedEmail = email ? normalizeEmail(email) : undefined;
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    // Vérifier si l'email existe déjà (si fourni)
    if (normalizedEmail) {
      const existingUserByEmail = await prisma.user.findFirst({
        where: { email: normalizedEmail }
      });
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'Un compte avec cet email existe déjà' },
          { status: 409 }
        );
      }
    }
    // Vérifier si le numéro de téléphone existe déjà
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phoneNumber: cleanPhone }
    });
    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Un compte avec ce numéro de téléphone existe déjà' },
        { status: 409 }
      );
    }
    // Créer l'utilisateur (sans mot de passe, ni birthDate)
    const newUser = await prisma.user.create({
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: normalizedEmail || null,
        phoneNumber: cleanPhone,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || 'Sénégal',
        name: `${cleanFirstName} ${cleanLastName}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    // Retourner les informations de l'utilisateur
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: newUser
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Un utilisateur avec ces informations existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 