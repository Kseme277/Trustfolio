export const whatsappConfig = {
  // Configuration du client WhatsApp
  client: {
    authStrategy: 'local',
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    }
  },

  // Configuration des messages
  messages: {
    verificationCode: (code: string) => 
      `🔐 Votre code de vérification TrustFolio: *${code}*\n\n` +
      `Ce code expire dans 10 minutes.\n\n` +
      `Ne partagez jamais ce code avec qui que ce soit.`,
    
    testMessage: () => 
      `🧪 Ceci est un message de test de TrustFolio.\n\n` +
      `Si vous recevez ce message, le service WhatsApp fonctionne correctement.`,
    
    welcomeMessage: (firstName: string) => 
      `🎉 Bienvenue ${firstName} sur TrustFolio!\n\n` +
      `Votre compte a été créé avec succès.\n` +
      `Vous pouvez maintenant vous connecter et commencer à personnaliser vos livres.`,
    
    orderConfirmation: (orderId: string, total: number) => 
      `✅ Commande confirmée!\n\n` +
      `Numéro de commande: *${orderId}*\n` +
      `Montant total: *${total} FCFA*\n\n` +
      `Nous vous tiendrons informé du statut de votre commande.`
  },

  // Configuration des tentatives
  retry: {
    maxAttempts: 3,
    delayBetweenAttempts: 2000, // 2 secondes
    maxDelay: 10000 // 10 secondes max
  },

  // Configuration des numéros de téléphone
  phoneNumber: {
    // Formats acceptés pour le Cameroun
    cameroonFormats: [
      /^6\d{8}$/,   // 6 + 8 chiffres (Mobile)
      /^2\d{8}$/,   // 2 + 8 chiffres (Mobile)
      /^3\d{8}$/,   // 3 + 8 chiffres (Mobile)
      /^4\d{8}$/,   // 4 + 8 chiffres (Mobile)
      /^5\d{8}$/,   // 5 + 8 chiffres (Mobile)
      /^7\d{8}$/,   // 7 + 8 chiffres (Mobile)
      /^8\d{8}$/,   // 8 + 8 chiffres (Mobile)
      /^9\d{8}$/    // 9 + 8 chiffres (Mobile)
    ],
    
    // Indicatif international du Cameroun
    countryCode: '237',
    
    // Validation du numéro
    validate: (phoneNumber: string) => {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Vérifier si c'est un numéro camerounais
      const isCameroonNumber = whatsappConfig.phoneNumber.cameroonFormats.some(
        format => format.test(cleanNumber)
      );
      
      return isCameroonNumber && cleanNumber.length === 9;
    },
    
    // Formater pour WhatsApp
    formatForWhatsApp: (phoneNumber: string) => {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      // Ajouter l'indicatif si pas présent
      const withCountryCode = cleanNumber.startsWith('237') 
        ? cleanNumber 
        : `237${cleanNumber}`;
      
      return `${withCountryCode}@c.us`;
    }
  },

  // Configuration des logs
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    includeTimestamps: true,
    includePhoneNumbers: false // Pour la confidentialité
  }
};

export default whatsappConfig; 