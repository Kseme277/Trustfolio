import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
  private client: Client | null = null;
  private isReady = false;
  private isConnecting = false;
  private isSimulationMode = true; // Mode simulation activé

  constructor() {
    if (!this.isSimulationMode) {
      this.initializeClient();
    } else {
      console.log('🔧 Mode simulation WhatsApp activé');
      this.isReady = true;
    }
  }

  private initializeClient() {
    if (this.client) return;

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      console.log('🔐 QR Code pour WhatsApp Web:');
      qrcode.generate(qr, { small: true });
      console.log('📱 Scannez ce QR code avec votre WhatsApp pour connecter le service');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Web connecté et prêt!');
      this.isReady = true;
      this.isConnecting = false;
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp Web authentifié!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Échec d\'authentification WhatsApp:', msg);
      this.isReady = false;
      this.isConnecting = false;
    });

    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp Web déconnecté:', reason);
      this.isReady = false;
      this.isConnecting = false;
    });

    this.client.initialize();
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (this.isSimulationMode) {
        // Mode simulation - simuler l'envoi
        console.log('🔧 [SIMULATION] Envoi de message WhatsApp:');
        console.log(`📱 Destinataire: ${phoneNumber}`);
        console.log(`💬 Message: ${message}`);
        console.log('✅ [SIMULATION] Message envoyé avec succès!');
        return true;
      }

      if (!this.client) {
        console.error('❌ Client WhatsApp non initialisé');
        return false;
      }

      if (!this.isReady) {
        console.log('⏳ Attente de la connexion WhatsApp...');
        await this.waitForReady();
      }

      // Formater le numéro de téléphone
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      if (!formattedNumber) {
        console.error('❌ Format de numéro de téléphone invalide:', phoneNumber);
        return false;
      }

      console.log(`📱 Envoi de message à ${formattedNumber}: ${message}`);

      // Envoyer le message
      const response = await this.client!.sendMessage(formattedNumber, message);
      
      if (response) {
        console.log('✅ Message envoyé avec succès!');
        return true;
      } else {
        console.error('❌ Échec de l\'envoi du message');
        return false;
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message WhatsApp:', error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string | null {
    // Nettoyer le numéro
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Ajouter l'indicatif du Cameroun si pas présent
    if (cleanNumber.startsWith('09') || cleanNumber.startsWith('6') || 
        cleanNumber.startsWith('2') || cleanNumber.startsWith('3') || 
        cleanNumber.startsWith('4') || cleanNumber.startsWith('5') ||
        cleanNumber.startsWith('7') || cleanNumber.startsWith('8') ||
        cleanNumber.startsWith('9')) {
      cleanNumber = '237' + cleanNumber;
    }
    
    // Vérifier que c'est un numéro valide
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      return null;
    }
    
    // Ajouter le suffixe WhatsApp
    return cleanNumber + '@c.us';
  }

  private async waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 1000);
        }
      };
      checkReady();
    });
  }

  async isConnected(): Promise<boolean> {
    return this.isReady;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
    }
  }
}

// Instance singleton
const whatsappService = new WhatsAppService();

export default whatsappService; 