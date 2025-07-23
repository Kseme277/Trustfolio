import { NextResponse } from 'next/server';

// Simulation du service WhatsApp
const simulateWhatsAppService = {
  async isConnected(): Promise<boolean> {
    return true; // Toujours connecté en mode simulation
  }
};

export async function GET() {
  try {
    const isConnected = await simulateWhatsAppService.isConnected();
    
    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? 'Connecté' : 'Déconnecté',
      timestamp: new Date().toISOString(),
      mode: 'simulation'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du statut WhatsApp:', error);
    return NextResponse.json(
      { 
        connected: false,
        status: 'Erreur',
        timestamp: new Date().toISOString(),
        error: 'Erreur interne du serveur'
      },
      { status: 500 }
    );
  }
} 