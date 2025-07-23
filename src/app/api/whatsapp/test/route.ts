import { NextResponse } from 'next/server';

// Simulation du service WhatsApp
const simulateWhatsAppService = {
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    console.log('🔧 [SIMULATION] Envoi de message WhatsApp:');
    console.log(`📱 Destinataire: ${phoneNumber}`);
    console.log(`💬 Message: ${message}`);
    console.log('✅ [SIMULATION] Message envoyé avec succès!');
    return true;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    const message = `🧪 Message de test TrustFolio\n\nCeci est un message de test pour vérifier la connexion WhatsApp.\n\nTimestamp: ${new Date().toLocaleString()}`;

    const success = await simulateWhatsAppService.sendMessage(phoneNumber, message);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Message de test envoyé avec succès (simulation)'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du message de test' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message de test:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 