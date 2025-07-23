// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation des numéros camerounais
const validateCameroonPhone = (phoneNumber: string) => {
  const cleaned = phoneNumber.replace(/\s/g, '');
  
  // Formats camerounais: 09 + 8 chiffres OU 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres
  const cameroonPattern = /^(09\d{8}|[6-9]\d{8}|[2-5]\d{8})$/;
  
  if (!cameroonPattern.test(cleaned)) {
    return false;
  }
  
  return cleaned;
};

export async function POST(request: Request) {
  try {
    const { name, email, phoneNumber, message } = await request.json();

    if (!name || !email || !message) {
      return new NextResponse('Champs manquants : nom, email et message sont requis.', { status: 400 });
    }

    // Validation du numéro de téléphone si fourni
    let validatedPhone: string | null = null;
    if (phoneNumber) {
      const validationResult = validateCameroonPhone(phoneNumber);
      if (validationResult === false) {
        return new NextResponse('Format de numéro de téléphone invalide. Utilisez un format camerounais (09, 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres).', { status: 400 });
      }
      validatedPhone = validationResult;
    }

    // Validation de l'email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new NextResponse('Format d\'email invalide.', { status: 400 });
    }

    // Création du message de contact
    const newMessage = await prisma.contactMessage.create({
      data: { 
        name, 
        email, 
        message,
        // Ajouter le numéro de téléphone si validé
        ...(validatedPhone && { phoneNumber: validatedPhone })
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: newMessage
    }, { status: 201 });
    
  } catch (error) {
    console.error("Erreur API Contact:", error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}