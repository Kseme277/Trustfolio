# Configuration WhatsApp pour TrustFolio

## 🚀 Installation

### 1. Dépendances
```bash
npm install whatsapp-web.js qrcode-terminal
```

### 2. Variables d'environnement
Ajoutez ces variables dans votre fichier `.env` :
```env
# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_HEADLESS=true
WHATSAPP_DEBUG=false
```

## 📱 Utilisation

### Démarrage avec WhatsApp
```bash
# Démarrage normal
npm run dev

# Démarrage avec service WhatsApp
npm run dev:whatsapp
```

### Première connexion
1. **Démarrez l'application** avec `npm run dev:whatsapp`
2. **Scannez le QR code** qui apparaît dans la console
3. **Attendez la confirmation** "WhatsApp Web connecté et prêt!"
4. **Le service est maintenant opérationnel**

## 🔧 Configuration

### Service WhatsApp (`src/lib/whatsappService.ts`)
- **Authentification locale** : Stockage des sessions
- **Mode headless** : Fonctionne sans interface graphique
- **Gestion des erreurs** : Reconnexion automatique
- **Logs détaillés** : Debug en développement

### Configuration (`src/lib/whatsappConfig.ts`)
- **Formats de numéros** : Support Sénégal (22, 33, 76, 77, 78, 70)
- **Messages personnalisés** : Templates pour différents cas
- **Validation** : Vérification des numéros de téléphone
- **Sécurité** : Masquage des numéros dans les logs

## 📋 APIs Disponibles

### 1. Statut du service
```bash
GET /api/whatsapp/status
```
**Réponse :**
```json
{
  "connected": true,
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test d'envoi
```bash
POST /api/whatsapp/test
Content-Type: application/json

{
  "phoneNumber": "691831919"
}
```

### 3. Envoi de code de vérification
```bash
POST /api/auth/phone
Content-Type: application/json

{
  "phoneNumber": "22122345678",
  "action": "send-code"
}
```

## 🛠️ Administration

### Page d'administration
Accédez à `/admin/whatsapp` pour :
- ✅ Vérifier le statut du service
- ✅ Envoyer des messages de test
- ✅ Voir les logs en temps réel
- ✅ Gérer la connexion

### Logs de debug
```bash
# Activer les logs détaillés
WHATSAPP_DEBUG=true npm run dev:whatsapp
```

## 🔒 Sécurité

### Bonnes pratiques
- ✅ **Ne jamais partager** les sessions WhatsApp
- ✅ **Utiliser un compte dédié** pour le service
- ✅ **Limiter les tentatives** d'envoi
- ✅ **Valider les numéros** avant envoi
- ✅ **Logger les erreurs** pour debug

### Protection des données
- ✅ **Masquage des numéros** dans les logs
- ✅ **Expiration automatique** des codes
- ✅ **Limitation des tentatives** (3 max)
- ✅ **Validation des formats** de numéros

## 🚨 Dépannage

### Problèmes courants

#### 1. QR Code ne s'affiche pas
```bash
# Vérifier les logs
npm run dev:whatsapp

# Redémarrer le service
# Fermer et relancer l'application
```

#### 2. Messages non envoyés
```bash
# Vérifier le statut
GET /api/whatsapp/status

# Tester l'envoi
POST /api/whatsapp/test
```

#### 3. Connexion perdue
```bash
# Redémarrer le service
npm run dev:whatsapp

# Vérifier la session WhatsApp
# Rescanner le QR code si nécessaire
```

### Logs d'erreur
```bash
# Erreur de connexion
❌ Échec d'authentification WhatsApp

# Erreur d'envoi
❌ Échec de l'envoi du message WhatsApp

# Erreur de format
❌ Format de numéro de téléphone invalide
```

## 📱 Formats de numéros supportés

### Cameroun
- **6** + 8 chiffres (ex: 23761234567) - Mobile
- **2** + 8 chiffres (ex: 23721234567) - Mobile
- **3** + 8 chiffres (ex: 23731234567) - Mobile
- **4** + 8 chiffres (ex: 23741234567) - Mobile
- **5** + 8 chiffres (ex: 23751234567) - Mobile
- **7** + 8 chiffres (ex: 23771234567) - Mobile
- **8** + 8 chiffres (ex: 23781234567) - Mobile
- **9** + 8 chiffres (ex: 23791234567) - Mobile

### Validation automatique
- ✅ Format correct (9 chiffres)
- ✅ Indicatif pays ajouté automatiquement (237)
- ✅ Conversion pour WhatsApp (@c.us)

## 🔄 Workflow complet

### 1. Connexion utilisateur
```
Utilisateur saisit numéro → Validation → Génération code → Envoi WhatsApp → Vérification → Connexion
```

### 2. Inscription utilisateur
```
Formulaire inscription → Validation → Création compte → Message de bienvenue → Redirection connexion
```

### 3. Confirmation commande
```
Paiement validé → Génération message → Envoi WhatsApp → Confirmation utilisateur
```

## 🚀 Production

### Recommandations
- ✅ **Utiliser un serveur dédié** pour WhatsApp
- ✅ **Configurer les logs** pour monitoring
- ✅ **Mettre en place des alertes** en cas d'échec
- ✅ **Backup des sessions** WhatsApp
- ✅ **Monitoring** de la connectivité

### Variables d'environnement production
```env
NODE_ENV=production
WHATSAPP_ENABLED=true
WHATSAPP_HEADLESS=true
WHATSAPP_DEBUG=false
WHATSAPP_LOG_LEVEL=error
```

## 📞 Support

### En cas de problème
1. **Vérifier les logs** de l'application
2. **Tester le statut** via `/api/whatsapp/status`
3. **Redémarrer le service** WhatsApp
4. **Rescanner le QR code** si nécessaire
5. **Contacter l'équipe** technique

### Logs utiles
```bash
# Démarrage réussi
✅ WhatsApp Web connecté et prêt!

# Envoi réussi
✅ Code 123456 envoyé avec succès sur WhatsApp au 22122345678

# Erreur d'envoi
❌ Échec de l'envoi du code 123456 au 22122345678
``` 