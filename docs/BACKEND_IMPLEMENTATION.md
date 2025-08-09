# Backend Implementation - TrustFolio

## 🚀 APIs Implémentées

### 1. Authentification par Téléphone (`/api/auth/phone`)
- **POST** : Envoi de code WhatsApp
- **POST** : Vérification de code
- **Fonctionnalités** :
  - Génération de codes à 6 chiffres
  - Expiration automatique (10 minutes)
  - Validation du format téléphone
  - Gestion des tentatives multiples

### 2. Inscription (`/api/auth/register`)
- **POST** : Création de compte utilisateur
- **Fonctionnalités** :
  - Validation complète des données
  - Hachage sécurisé des mots de passe (bcrypt)
  - Vérification des doublons (email/téléphone)
  - Gestion des erreurs Prisma

### 3. Connexion (`/api/auth/login`)
- **POST** : Authentification par email/téléphone + mot de passe
- **Fonctionnalités** :
  - Support email et téléphone
  - Vérification de mot de passe
  - Retour des informations utilisateur

### 4. Sessions (`/api/auth/session`)
- **GET** : Récupération de la session actuelle
- **DELETE** : Suppression de session
- **Fonctionnalités** :
  - Vérification d'authentification
  - Informations utilisateur complètes

### 5. Vérification de Code (`/api/auth/verify-code`)
- **POST** : Vérification de code avec gestion avancée
- **PUT** : Stockage de code temporaire
- **Fonctionnalités** :
  - Limitation des tentatives (3 max)
  - Expiration automatique
  - Gestion des sessions

### 6. Gestion Utilisateurs (`/api/users`)
- **GET** : Récupération du profil utilisateur
- **PUT** : Mise à jour du profil
- **DELETE** : Suppression de compte
- **Fonctionnalités** :
  - Validation des données
  - Vérification des doublons
  - Sécurité des sessions

### 7. Changement de Mot de Passe (`/api/auth/change-password`)
- **POST** : Changement sécurisé de mot de passe
- **Fonctionnalités** :
  - Validation de l'ancien mot de passe
  - Hachage du nouveau mot de passe
  - Sécurité renforcée

## 🔧 Configuration NextAuth

### Mise à jour de `authOptions.ts`
- **Support téléphone** : Ajout du champ phoneNumber
- **Callbacks améliorés** : Gestion des sessions étendues
- **Redirection intelligente** : Après connexion/inscription
- **Session JWT** : Stratégie sécurisée

## 🛡️ Sécurité

### Validation des Données
- **Format téléphone** : Validation regex
- **Email** : Format standard
- **Mot de passe** : Minimum 6 caractères
- **Date de naissance** : Validation d'âge (13+ ans)

### Gestion des Erreurs
- **Codes HTTP appropriés** : 400, 401, 404, 409, 429, 500
- **Messages d'erreur clairs** : Français
- **Logging** : Console pour debug

### Stockage Sécurisé
- **Mots de passe** : Hachage bcrypt (12 rounds)
- **Codes temporaires** : Map en mémoire (Redis en production)
- **Sessions** : JWT avec expiration

## 📱 Intégration WhatsApp

### Simulation Actuelle
```javascript
const sendWhatsAppCode = async (phoneNumber, code) => {
  console.log(`📱 Code ${code} envoyé sur WhatsApp au ${phoneNumber}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};
```

### Production (Twilio)
```javascript
// À implémenter avec Twilio
const sendWhatsAppCode = async (phoneNumber, code) => {
  const client = require('twilio')(accountSid, authToken);
  return client.messages.create({
    body: `Votre code TrustFolio: ${code}`,
    from: `whatsapp:${twilioPhoneNumber}`,
    to: `whatsapp:${phoneNumber}`
  });
};
```

## 🗄️ Base de Données

### Modèle User Étendu
```prisma
model User {
  id            String    @id @default(cuid())
  firstName     String?
  lastName      String?
  email         String?   @unique
  phoneNumber   String?   @unique
  password      String?   @db.Text
  birthDate     DateTime?
  address       String?
  city          String?
  country       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // ... autres champs
}
```

## 🚀 Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/trustfolio"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# WhatsApp API (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Environnement
NODE_ENV="development"
```

## 🔄 Workflow d'Authentification

### 1. Connexion par Téléphone
1. **Saisie téléphone** → Validation format
2. **Envoi code** → Génération + stockage temporaire
3. **Saisie code** → Vérification + expiration
4. **Utilisateur existant** → Connexion directe
5. **Nouvel utilisateur** → Redirection inscription

### 2. Inscription
1. **Remplissage formulaire** → Validation complète
2. **Vérification doublons** → Email + téléphone
3. **Hachage mot de passe** → Sécurité
4. **Création compte** → Base de données
5. **Redirection connexion** → Authentification

## 🧪 Tests Recommandés

### APIs à Tester
- [ ] Envoi de code WhatsApp
- [ ] Vérification de code
- [ ] Inscription utilisateur
- [ ] Connexion utilisateur
- [ ] Gestion des sessions
- [ ] Mise à jour profil
- [ ] Changement mot de passe

### Scénarios de Test
- [ ] Numéro téléphone invalide
- [ ] Code expiré
- [ ] Trop de tentatives
- [ ] Email déjà utilisé
- [ ] Téléphone déjà utilisé
- [ ] Mot de passe faible
- [ ] Session expirée

## 🚀 Prochaines Étapes

1. **Intégration Twilio** : Remplacer la simulation
2. **Redis** : Stockage des codes temporaires
3. **Rate Limiting** : Protection contre les abus
4. **Logs** : Système de logging avancé
5. **Tests** : Tests unitaires et d'intégration
6. **Monitoring** : Surveillance des performances 