import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Validation des données d'inscription
const validateRegistrationData = (data: any) => {
  const errors: string[] = [];

  // Validation des champs requis
  if (!data.firstName?.trim()) errors.push('Prénom requis');
  if (!data.lastName?.trim()) errors.push('Nom requis');
  if (!data.email?.trim()) errors.push('Email requis');
  if (!data.phoneNumber?.trim()) errors.push('Numéro de téléphone requis');
  if (!data.password?.trim()) errors.push('Mot de passe requis');
  if (!data.birthDate) errors.push('Date de naissance requise');

  // Validation de l'email
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Format d\'email invalide');
  }

  // Validation du mot de passe
  if (data.password && data.password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  // Validation du numéro de téléphone
  if (data.phoneNumber) {
    const cleanPhone = data.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      errors.push('Format de numéro de téléphone invalide');
    }
  }

  // Validation de la date de naissance
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      errors.push('Vous devez avoir au moins 13 ans');
    }
    if (age > 120) {
      errors.push('Date de naissance invalide');
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
      password,
      birthDate,
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
    const normalizedEmail = normalizeEmail(email);
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await prisma.user.findFirst({
      where: { email: normalizedEmail }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
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

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: normalizedEmail,
        phoneNumber: cleanPhone,
        password: hashedPassword,
        birthDate: new Date(birthDate),
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || 'Sénégal',
        name: `${cleanFirstName} ${cleanLastName}`, // Pour NextAuth
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = newUser;

    console.log(`✅ Nouvel utilisateur créé: ${userWithoutPassword.email}`);

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Gestion des erreurs Prisma
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