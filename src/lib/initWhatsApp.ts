import whatsappService from './whatsappService';

export async function initializeWhatsApp() {
  try {
    console.log('🚀 Initialisation du service WhatsApp...');
    
    // Attendre que le service soit prêt
    let attempts = 0;
    const maxAttempts = 30; // 30 secondes max
    
    while (!(await whatsappService.isConnected()) && attempts < maxAttempts) {
      console.log(`⏳ Tentative ${attempts + 1}/${maxAttempts} - Connexion WhatsApp...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    if (await whatsappService.isConnected()) {
      console.log('✅ Service WhatsApp initialisé avec succès!');
      return true;
    } else {
      console.error('❌ Échec de l\'initialisation du service WhatsApp');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation WhatsApp:', error);
    return false;
  }
}

// Fonction pour vérifier le statut du service
export async function checkWhatsAppStatus() {
  return await whatsappService.isConnected();
}

// Fonction pour envoyer un message de test
export async function sendTestMessage(phoneNumber: string) {
  try {
    const message = '🧪 Ceci est un message de test de TrustFolio.';
    const success = await whatsappService.sendMessage(phoneNumber, message);
    
    if (success) {
      console.log('✅ Message de test envoyé avec succès!');
      return true;
    } else {
      console.error('❌ Échec de l\'envoi du message de test');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message de test:', error);
    return false;
  }
} 