// Fichier : src/types/app.d.ts

// -------------------------------------------------------------------------
// Types des Modèles de Base (Doivent correspondre exactement au schéma Prisma)
// -------------------------------------------------------------------------

/**
 * Informations de base d'un livre (tel que récupéré de la DB via Prisma).
 */
export type BookInfo = { 
  id: number; 
  title: string; 
  description: string; 
  shortDescription?: string; // Peut être optionnel si non toujours présent de la DB
  coverImage: string; 
  price: number;
  tags?: string[]; // Les tags sont un tableau de chaînes
};

/**
 * Informations d'une valeur/thème éducatif.
 */
export type ValueInfo = { 
  id: number; 
  name: string; 
};

/**
 * Informations d'un personnage secondaire (tel que récupéré de la DB via Prisma).
 * Ne doit pas contenir de champs spécifiques au frontend (comme fileToUpload).
 */
export type CharacterInfo = {
  id: number; // ID du personnage dans la DB
  name: string;
  relationshipToHero: string;
  animalType?: string | null; // Peut être null de la DB
  sex?: string | null;       // Peut être null de la DB
  age?: string | null;       // Peut être null de la DB
  photoUrl?: string | null;  // URL de la photo, peut être null
  personalizedOrderId?: number; // L'ID de la commande à laquelle il appartient
};


// -------------------------------------------------------------------------
// Types des Données de l'Application (souvent un assemblage de types de modèles)
// -------------------------------------------------------------------------

/**
 * Type pour une commande personnalisée.
 * Reflète le modèle PersonalizedOrder de Prisma, avec les relations incluses.
 */
export type Order = { 
  id: number; 
  childName: string; 
  childPhotoUrl: string | null; 
  status: string; // "IN_CART", "PENDING", "COMPLETED", "CANCELLED"
  readProgress: number; // 0-100
  createdAt: Date; // Important: C'est un objet Date en TypeScript (pas string)
  updatedAt: Date; // Ajouté pour cohérence

  // Relations incluses
  book: BookInfo | null; // Les détails du livre de base
  selectedValues: ValueInfo[]; // Les valeurs choisies
  characters?: CharacterInfo[]; // Les personnages secondaires associés (si inclus par Prisma)
  
  // Informations de livraison
  deliveryAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;

  // Informations utilisateur qui commande
  userFullName?: string | null;
  userPhoneNumber?: string | null;
  
  generatedContent?: string | null; 
  // Détails de l'histoire/pack
  heroAgeRange?: string | null;
  mainTheme?: string | null;
  storyLocation?: string | null;
  residentialArea?: string | null;
  packType?: string | null;
  bookLanguages?: string[] | null;
  messageSpecial?: string | null;
  pdfUrl?: string | null; // Ajout pour la gestion du PDF

  // Informations de paiement (ajoutées après le paiement)
  paymentMethod?: string | null;
  paymentDetails?: string | null; // Peut être un JSON stringifié
  paidAt?: Date | null; // Date/heure du paiement

  // Prix calculés pour les commandes personnalisées
  calculatedPrice?: number;
  originalBookPrice?: number;
  uploadedImages?: string[];
  personalizationData?: any; // Données JSON pour l'IA
};


// -------------------------------------------------------------------------
// Types et Données Spécifiques au Frontend
// -------------------------------------------------------------------------

/**
 * Type pour les détails d'un pack (utilisé pour la logique des packs, ex: nombre de personnages).
 */
export type PackDetail = {
  characters: number;      // Nombre de personnages inclus dans ce pack
  price: number;           // Prix du pack (peut être ajusté par le packType)
  maxLanguages: number;    // Nombre max de langues
  maxValues: number;       // Nombre max de valeurs
  languages: string[];     // Langues disponibles dans ce pack
};

/**
 * Définition des détails des packs.
 * C'est une CONSTANTE (objet) qui peut être exportée et importée directement.
 * Mieux vaut la définir dans un fichier .ts séparé (ex: src/config/packs.ts) et l'importer.
 * Pour cet exemple, je la mets ici comme un 'const' normal.
 */
export const packDetailsConfig = {
  Basique: {
    characters: 1, // 1 personnage principal (l'enfant) + 0 personnage secondaire
    price: 15000,
    maxLanguages: 1,
    maxValues: 3,
    languages: ["Français"],
  },
  Standard: {
    characters: 3, // 1 principal + 2 secondaires
    price: 25000,
    maxLanguages: 2,
    maxValues: 5,
    languages: ["Français", "Anglais"],
  },
  Prestige: {
    characters: 5, // 1 principal + 4 secondaires
    price: 40000,
    maxLanguages: 3,
    maxValues: 7,
    languages: ["Français", "Anglais", "Autres"],
  },
};


/**
 * Types pour les méthodes de paiement (utilisé dans le modal de paiement).
 */
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'mobile_money' | 'card';