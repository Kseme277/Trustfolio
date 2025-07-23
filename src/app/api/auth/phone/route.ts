import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulation du service WhatsApp
const simulateWhatsAppService = {
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    console.log('🔧 [SIMULATION] Envoi de message WhatsApp:');
    console.log(`📱 Destinataire: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    console.log('✅ [SIMULATION] Message envoyé avec succès!');
    return true;
  },
  async isConnected(): Promise<boolean> {
    return true; // Toujours connecté en mode simulation
  }
};

// Interface pour les codes temporaires
interface TempCode {
  phoneNumber: string;
  code: string;
  expiresAt: Date;
}

// Stockage temporaire des codes (en production, utilisez Redis)
const tempCodes = new Map<string, TempCode>();

// Générer un code à 6 chiffres
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Nettoyer les codes expirés
const cleanExpiredCodes = () => {
  const now = new Date();
  for (const [key, tempCode] of tempCodes.entries()) {
    if (tempCode.expiresAt < now) {
      tempCodes.delete(key);
    }
  }
};

// Valider le format du numéro de téléphone camerounais
const validatePhoneNumber = (phoneNumber: string) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Formats camerounais: 09 + 8 chiffres OU 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres
  const cameroonPattern = /^(09\d{8}|[6-9]\d{8}|[2-5]\d{8})$/;
  
  if (!cameroonPattern.test(cleanPhone)) {
    return false;
  }
  
  return true;
};

// Envoyer le code via WhatsApp
const sendWhatsAppCode = async (phoneNumber: string, code: string) => {
  try {
    const message = `🔐 Votre code de vérification TrustFolio: *${code}*\n\nCe code expire dans 10 minutes.\n\nNe partagez jamais ce code avec qui que ce soit.`;
    
    const success = await simulateWhatsAppService.sendMessage(phoneNumber, message);
    
    if (success) {
      console.log(`✅ Code ${code} envoyé avec succès sur WhatsApp au ${phoneNumber}`);
      return true;
    } else {
      console.error(`❌ Échec de l'envoi du code ${code} au ${phoneNumber}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi WhatsApp:', error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, action } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Nettoyer le numéro de téléphone
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!validatePhoneNumber(cleanPhone)) {
      return NextResponse.json(
        { error: 'Format de numéro de téléphone invalide' },
        { status: 400 }
      );
    }

    if (action === 'send-code') {
      // Vérifier que WhatsApp est connecté (temporairement désactivé pour les tests)
      const isConnected = await simulateWhatsAppService.isConnected();
      if (!isConnected) {
        console.log('⚠️ WhatsApp non connecté, mais on continue pour les tests');
        // return NextResponse.json(
        //   { error: 'Service WhatsApp non disponible. Veuillez réessayer dans quelques instants.' },
        //   { status: 503 }
        // );
      }

      // Nettoyer les codes expirés
      cleanExpiredCodes();

      // Générer et envoyer le code
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Stocker le code temporairement
      tempCodes.set(cleanPhone, {
        phoneNumber: cleanPhone,
        code,
        expiresAt
      });

      // Envoyer le code via WhatsApp
      const sent = await sendWhatsAppCode(cleanPhone, code);
      
      if (!sent) {
        // Supprimer le code si l'envoi a échoué
        tempCodes.delete(cleanPhone);
        return NextResponse.json(
          { error: 'Erreur lors de l\'envoi du code WhatsApp. Veuillez vérifier le numéro et réessayer.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Code envoyé sur WhatsApp (simulation)',
        // Code toujours renvoyé pour les tests
        code: code
      });

    } else if (action === 'verify-code') {
      const { code } = body;
      
      if (!code) {
        return NextResponse.json(
          { error: 'Code requis' },
          { status: 400 }
        );
      }

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

      // Supprimer le code utilisé
      tempCodes.delete(cleanPhone);

      // Chercher l'utilisateur par numéro de téléphone
      const user = await prisma.user.findFirst({
        where: {
          phoneNumber: cleanPhone
        }
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
    }

    return NextResponse.json(
      { error: 'Action invalide' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur authentification téléphone:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 