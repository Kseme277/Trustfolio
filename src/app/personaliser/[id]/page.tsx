// Fichier : src/app/personaliser/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageProvider';
import { Lang } from '@/i18n/translations';
import React from 'react';

// --- Définition des Types (définis localement pour éviter les problèmes d'importation .d.ts) ---
type Book = { id: number; title: string; description: string; coverImage: string; };
type Value = { id: number; name: string; };

type CharacterData = {
  id: number;
  name: string;
  relationshipToHero: string;
  animalType?: string; 
  sex?: string; 
  age?: string; 
  photoUrl?: string; 
  fileToUpload: File | null; 
  isUploading: boolean; 
};

// Définition des détails des packs (packDetails)
const packDetails = {
  Basique: { 
    characters: 1, 
    price: 8000, 
    maxLanguages: 1, 
    maxValues: 2, 
    languages: ['Français', 'Anglais'] 
  },
  Standard: { 
    characters: 2, 
    price: 14000, 
    maxLanguages: 2, 
    maxValues: 4, 
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol'] 
  },
  Prestige: { 
    characters: 5, 
    price: 18000, 
    maxLanguages: 4, 
    maxValues: 6, 
    languages: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Italien', 'Arabe', 'Swahili'] 
  },
};

type PaymentMethod = 'Mobile Money' | 'Carte bancaire' | 'PayPal' | 'Virement Bancaire';
type DeliveryOption = 'numerique' | 'physique' | null;

// --- Traductions multilingues (exemple pour la première étape) ---
const TRANSLATIONS = {
  fr: {
    contact: 'Étape 1: Vos informations',
    fullName: 'Votre Nom Complet',
    fullNamePlaceholder: 'Ex: Jean Dupont',
    phone: 'Votre Numéro de Téléphone (CM)',
    phonePlaceholder: 'Ex: 09XX XXX XXX ou 6XX XXX XXX',
    phoneTitle: 'Numéro de téléphone camerounais (09XX XXX XXX ou 6XX XXX XXX)',
    address: 'Adresse',
    addressPlaceholder: 'Votre adresse',
    city: 'Ville',
    cityPlaceholder: 'Ex: Yaoundé',
    postal: 'Code Postal (Optionnel)',
    postalPlaceholder: 'Ex: 12345',
    country: 'Pays',
    countryPlaceholder: 'Ex: Cameroun',
    next: 'Suivant',
    prev: 'Précédent',
    hero: 'Étape 2: Informations du héros',
    heroName: 'Prénom du héros (votre enfant)',
    heroNamePlaceholder: 'Ex: Amina, Kwadjeu...',
    heroAge: "Âge de l'enfant (ans)",
    heroAgePlaceholder: 'Ex: 7',
    heroAgeError: "L'âge doit être compris entre 0 et 12 ans.",
    mainTheme: 'Thème principal',
    mainThemeSelect: 'Sélectionner',
    mainThemeOptions: [
      'Aventure et exploration',
      'Héros du quotidien et résilience',
      'Contes traditionnels et sagesse africaine',
      'Découverte culturelle et identité',
      'Amitié et solidarité',
      'Nature et environnement',
    ],
    storyLocation: 'Lieu de l\'histoire',
    storyLocationPlaceholder: 'Ex: Yaoundé, Mont Cameroun, Forêt tropicale',
    storyArea: 'Zone de l\'histoire',
    storyAreaSelect: 'Sélectionner',
    storyAreaOptions: [
      'Urbaine (ville)',
      'Rurale (village)',
      'Cotière (bord de mer)',
      'Montagneuse (plateau)',
    ],
    heroPhoto: 'Photo du héros (Optionnel)',
    heroPhotoChoose: 'Cliquez pour choisir une photo',
    heroPhotoUpload: 'Téléverser la photo',
    heroPhotoUploading: 'Envoi en cours...',
    heroPhotoPreview: 'Aperçu :',
    customizeBook: 'Personnalisez',
    loginCheckInbox: 'Vérification du téléphone',
    loginEnterCodeSubtitle: 'Un code à 6 chiffres a été envoyé à votre numéro.',
    loginCodeLabel: 'Code de test',
    loginCodeSent: 'Code envoyé sur WhatsApp !',
    loginCodeError: 'Erreur lors de l\'envoi du code',
    loginPhoneContinue: 'Valider',
    loginCodeVerifying: 'Vérification...',
    loginPhoneSending: 'Envoi en cours...',
    loginResendCode: 'Renvoyer le code',
    loginCodeIncorrect: 'Code incorrect',
    loginBack: 'Retour',
    packTitle: 'Choix du Pack',
    packOptions: ['Basique', 'Standard', 'Prestige'],
    characterTitle: ['Personnage 1', 'Personnage 2', 'Personnage 3', 'Personnage 4', 'Personnage 5'],
    relationOptions: ['Relation 1', 'Relation 2', 'Relation 3', 'Relation 4', 'Relation 5', 'Relation 6', 'Relation 7', 'Relation 8', 'Relation 9', 'Relation 10'],
    relationPlaceholder: ['Ex: Père', 'Ex: Mère', 'Ex: Frère/Sœur', 'Ex: Ami(e)', 'Ex: Grand-Parent', 'Ex: Oncle/Tante', 'Ex: Cousin(e)', 'Ex: Enseignant(e)', 'Ex: Animal', 'Ex: Autre'],
    animalTypeOptions: ['Animal 1', 'Animal 2', 'Animal 3', 'Animal 4', 'Animal 5'],
    animalTypePlaceholder: ['Ex: Lion', 'Ex: Tigre', 'Ex: Éléphant', 'Ex: Zèbre', 'Ex: Chien'],
    sexOptions: ['Homme', 'Femme'],
    ageOptions: ['Enfant (3-8 ans)', 'Adolescent (9-15 ans)', 'Adulte (16+ ans)', 'Senior (60+ ans)'],
    photoOptions: ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'],
    uploadingOptions: ['Uploading 1', 'Uploading 2', 'Uploading 3', 'Uploading 4', 'Uploading 5'],
    uploadOptions: ['Upload 1', 'Upload 2', 'Upload 3', 'Upload 4', 'Upload 5'],
    previewOptions: ['Preview 1', 'Preview 2', 'Preview 3', 'Preview 4', 'Preview 5'],
    bookLanguagesTitle: 'Langues du livre',
    bookLanguagesOptions: 'Sélectionnez les langues',
    valuesTitle: 'Valeurs',
    messageTitle: 'Message Spécial',
    recapTitle: 'Récapitulatif',
    bookField: 'Livre',
    packField: 'Pack',
    languagesField: 'Langues',
    heroField: 'Héros',
    heroPhotoField: 'Photo du héros',
    charactersField: 'Personnages',
    messageField: 'Message',
    deliveryField: 'Livraison',
    messagePlaceholder: 'Entrez votre message spécial',
    addingToCart: 'Ajout au panier',
    addCart: 'Ajouter au panier',
    bookLanguagesList: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Arabe'],
    bookLanguagesNames: { fr: 'Français', en: 'Anglais', de: 'Allemand', es: 'Espagnol', ar: 'Arabe' },
  },
  en: {
    contact: 'Step 1: Your Information',
    fullName: 'Your Full Name',
    fullNamePlaceholder: 'e.g. John Smith',
    phone: 'Your Phone Number (CM)',
    phonePlaceholder: 'e.g. 09XX XXX XXX or 6XX XXX XXX',
    phoneTitle: 'Cameroonian phone number (09XX XXX XXX or 6XX XXX XXX)',
    address: 'Full Address',
    addressPlaceholder: 'e.g. 123 Joy Street, Nlongkak District',
    city: 'City',
    cityPlaceholder: 'e.g. Yaoundé',
    postal: 'Postal Code (Optional)',
    postalPlaceholder: 'e.g. 12345',
    country: 'Country',
    countryPlaceholder: 'e.g. Cameroon',
    next: 'Next',
    prev: 'Previous',
    hero: 'Step 2: Hero Information',
    heroName: "Hero's First Name (your child)",
    heroNamePlaceholder: 'e.g. Amina, Kwadjeu...',
    heroAge: "Child's Age (years)",
    heroAgePlaceholder: 'e.g. 7',
    heroAgeError: "Age must be between 0 and 12 years.",
    mainTheme: 'Main Theme',
    mainThemeSelect: 'Select',
    mainThemeOptions: [
      'Adventure and exploration',
      'Everyday heroism and resilience',
      'Traditional tales and African wisdom',
      'Cultural discovery and identity',
      'Friendship and solidarity',
      'Nature and environment',
    ],
    storyLocation: 'Story Location',
    storyLocationPlaceholder: 'e.g. Yaoundé, Mount Cameroon, Rainforest',
    storyArea: 'Residential Area',
    storyAreaSelect: 'Select',
    storyAreaOptions: [
      'Urban (city)',
      'Rural (village)',
      'Coastal (seaside)',
      'Mountainous (plateau)',
    ],
    heroPhoto: "Hero's Photo (Optional)",
    heroPhotoChoose: 'Click to choose a photo',
    heroPhotoUpload: 'Upload photo',
    heroPhotoUploading: 'Uploading...',
    heroPhotoPreview: 'Preview:',
    customizeBook: 'Personalize',
    loginCheckInbox: 'Phone Verification',
    loginEnterCodeSubtitle: 'A 6-digit code has been sent to your number.',
    loginCodeLabel: 'Test Code',
    loginCodeSent: 'Code sent on WhatsApp!',
    loginCodeError: 'Error sending code',
    loginPhoneContinue: 'Validate',
    loginCodeVerifying: 'Verifying...',
    loginPhoneSending: 'Sending...',
    loginResendCode: 'Resend Code',
    loginCodeIncorrect: 'Incorrect code',
    loginBack: 'Back',
    packTitle: 'Pack Selection',
    packOptions: ['Basique', 'Standard', 'Prestige'],
    characterTitle: ['Character 1', 'Character 2', 'Character 3', 'Character 4', 'Character 5'],
    relationOptions: ['Relation 1', 'Relation 2', 'Relation 3', 'Relation 4', 'Relation 5', 'Relation 6', 'Relation 7', 'Relation 8', 'Relation 9', 'Relation 10'],
    relationPlaceholder: ['Ex: Father', 'Ex: Mother', 'Ex: Brother/Sister', 'Ex: Friend(e)', 'Ex: Grandparent', 'Ex: Uncle/Aunt', 'Ex: Cousin(e)', 'Ex: Teacher(e)', 'Ex: Animal', 'Ex: Other'],
    animalTypeOptions: ['Animal 1', 'Animal 2', 'Animal 3', 'Animal 4', 'Animal 5'],
    animalTypePlaceholder: ['Ex: Lion', 'Ex: Tiger', 'Ex: Elephant', 'Ex: Zebra', 'Ex: Dog'],
    sexOptions: ['Male', 'Female'],
    ageOptions: ['Child (3-8 years)', 'Adolescent (9-15 years)', 'Adult (16+ years)', 'Senior (60+ years)'],
    photoOptions: ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'],
    uploadingOptions: ['Uploading 1', 'Uploading 2', 'Uploading 3', 'Uploading 4', 'Uploading 5'],
    uploadOptions: ['Upload 1', 'Upload 2', 'Upload 3', 'Upload 4', 'Upload 5'],
    previewOptions: ['Preview 1', 'Preview 2', 'Preview 3', 'Preview 4', 'Preview 5'],
    bookLanguagesTitle: 'Book Languages',
    bookLanguagesOptions: 'Select languages',
    valuesTitle: 'Values',
    messageTitle: 'Special Message',
    recapTitle: 'Summary',
    bookField: 'Book',
    packField: 'Pack',
    languagesField: 'Languages',
    heroField: 'Hero',
    heroPhotoField: 'Hero Photo',
    charactersField: 'Characters',
    messageField: 'Message',
    deliveryField: 'Delivery',
    messagePlaceholder: 'Enter your special message',
    addingToCart: 'Adding to Cart',
    addCart: 'Add to Cart',
    bookLanguagesList: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Arabe'],
    bookLanguagesNames: { fr: 'Français', en: 'Anglais', de: 'Allemand', es: 'Espagnol', ar: 'Arabe' },
  },
  de: {
    contact: 'Schritt 1: Ihre Informationen',
    fullName: 'Ihr vollständiger Name',
    fullNamePlaceholder: 'z.B. Max Mustermann',
    phone: 'Ihre Telefonnummer (CM)',
    phonePlaceholder: 'z.B. 09XX XXX XXX oder 6XX XXX XXX',
    phoneTitle: 'Kamerunische Telefonnummer (09XX XXX XXX oder 6XX XXX XXX)',
    address: 'Adresse',
    addressPlaceholder: 'z.B. 123 Freudestr., Stadtteil Nlongkak',
    city: 'Stadt',
    cityPlaceholder: 'z.B. Yaoundé',
    postal: 'Postleitzahl (optional)',
    postalPlaceholder: 'z.B. 12345',
    country: 'Land',
    countryPlaceholder: 'z.B. Kamerun',
    next: 'Weiter',
    prev: 'Zurück',
    hero: 'Schritt 2: Heldeninformationen',
    heroName: 'Vorname des Helden (Ihr Kind)',
    heroNamePlaceholder: 'z.B. Amina, Kwadjeu...',
    heroAge: "Alter des Kindes (Jahre)",
    heroAgePlaceholder: 'z.B. 7',
    heroAgeError: "Das Alter muss zwischen 0 und 12 Jahren liegen.",
    mainTheme: 'Hauptthema',
    mainThemeSelect: 'Auswählen',
    mainThemeOptions: [
      'Abenteuer und Erkundung',
      'Alltagshelden und Resilienz',
      'Traditionelle Geschichten und afrikanische Weisheit',
      'Kulturelle Entdeckung und Identität',
      'Freundschaft und Solidarität',
      'Natur und Umwelt',
    ],
    storyLocation: 'Handlungsort',
    storyLocationPlaceholder: 'z.B. Yaoundé, Mount Cameroon, Regenwald',
    storyArea: 'Wohngebiet',
    storyAreaSelect: 'Auswählen',
    storyAreaOptions: [
      'Städtisch (Stadt)',
      'Ländlich (Dorf)',
      'Küstenregion (Meer)',
      'Gebirge (Plateau)',
    ],
    heroPhoto: 'Foto des Helden (optional)',
    heroPhotoChoose: 'Klicken Sie, um ein Foto auszuwählen',
    heroPhotoUpload: 'Foto hochladen',
    heroPhotoUploading: 'Wird hochgeladen...',
    heroPhotoPreview: 'Vorschau:',
    customizeBook: 'Personalisieren',
    loginCheckInbox: 'Telefonüberprüfung',
    loginEnterCodeSubtitle: 'Ein 6-stelliger Code wurde an Ihre Nummer gesendet.',
    loginCodeLabel: 'Testcode',
    loginCodeSent: 'Code an WhatsApp gesendet!',
    loginCodeError: 'Fehler beim Senden des Codes',
    loginPhoneContinue: 'Bestätigen',
    loginCodeVerifying: 'Überprüfung...',
    loginPhoneSending: 'Wird gesendet...',
    loginResendCode: 'Code erneut senden',
    loginCodeIncorrect: 'Falscher Code',
    loginBack: 'Zurück',
    packTitle: 'Pack Auswahl',
    packOptions: ['Basisch', 'Standard', 'Prestige'],
    characterTitle: ['Charakter 1', 'Charakter 2', 'Charakter 3', 'Charakter 4', 'Charakter 5'],
    relationOptions: ['Beziehung 1', 'Beziehung 2', 'Beziehung 3', 'Beziehung 4', 'Beziehung 5', 'Beziehung 6', 'Beziehung 7', 'Beziehung 8', 'Beziehung 9', 'Beziehung 10'],
    relationPlaceholder: ['Ex: Vater', 'Ex: Mutter', 'Ex: Bruder/Schwester', 'Ex: Freund(e)', 'Ex: Großeltern', 'Ex: Onkel/Tante', 'Ex: Cousin(e)', 'Ex: Lehrer(in)', 'Ex: Tier', 'Ex: Anderes'],
    animalTypeOptions: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'],
    animalTypePlaceholder: ['Ex: Löwe', 'Ex: Tiger', 'Ex: Elefant', 'Ex: Zebra', 'Ex: Hund'],
    sexOptions: ['Mann', 'Frau'],
    ageOptions: ['Kind (3-8 Jahre)', 'Jugendlicher (9-15 Jahre)', 'Erwachsener (16+ Jahre)', 'Senior (60+ Jahre)'],
    photoOptions: ['Foto 1', 'Foto 2', 'Foto 3', 'Foto 4', 'Foto 5'],
    uploadingOptions: ['Hochladen 1', 'Hochladen 2', 'Hochladen 3', 'Hochladen 4', 'Hochladen 5'],
    uploadOptions: ['Hochladen 1', 'Hochladen 2', 'Hochladen 3', 'Hochladen 4', 'Hochladen 5'],
    previewOptions: ['Vorschau 1', 'Vorschau 2', 'Vorschau 3', 'Vorschau 4', 'Vorschau 5'],
    bookLanguagesTitle: 'Buch Sprachen',
    bookLanguagesOptions: 'Wählen Sie die Sprachen',
    valuesTitle: 'Werte',
    messageTitle: 'Spezialnachricht',
    recapTitle: 'Zusammenfassung',
    bookField: 'Buch',
    packField: 'Pack',
    languagesField: 'Sprachen',
    heroField: 'Held',
    heroPhotoField: 'Heldenfoto',
    charactersField: 'Charaktere',
    messageField: 'Nachricht',
    deliveryField: 'Lieferung',
    messagePlaceholder: 'Geben Sie Ihre spezielle Nachricht ein',
    addingToCart: 'Zum Warenkorb hinzufügen',
    addCart: 'Zur Warenkorb hinzufügen',
    bookLanguagesList: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Arabe'],
    bookLanguagesNames: { fr: 'Français', en: 'Anglais', de: 'Allemand', es: 'Espagnol', ar: 'Arabe' },
  },
  es: {
    contact: 'Paso 1: Su información',
    fullName: 'Su nombre completo',
    fullNamePlaceholder: 'ej. Juan Pérez',
    phone: 'Su número de teléfono (CM)',
    phonePlaceholder: 'ej. 09XX XXX XXX o 6XX XXX XXX',
    phoneTitle: 'Número de teléfono camerunés (09XX XXX XXX o 6XX XXX XXX)',
    address: 'Dirección',
    addressPlaceholder: 'ej. 123 Calle de la Alegría, Barrio Nlongkak',
    city: 'Ciudad',
    cityPlaceholder: 'ej. Yaundé',
    postal: 'Código postal (opcional)',
    postalPlaceholder: 'ej. 12345',
    country: 'País',
    countryPlaceholder: 'ej. Camerún',
    next: 'Siguiente',
    prev: 'Anterior',
    hero: 'Paso 2: Información del héroe',
    heroName: 'Nombre del héroe (su hijo/a)',
    heroNamePlaceholder: 'ej. Amina, Kwadjeu...',
    heroAge: "Edad del niño/a (años)",
    heroAgePlaceholder: 'ej. 7',
    heroAgeError: "La edad debe estar entre 0 y 12 años.",
    mainTheme: 'Tema principal',
    mainThemeSelect: 'Seleccionar',
    mainThemeOptions: [
      'Aventura y exploración',
      'Héroes cotidianos y resiliencia',
      'Cuentos tradicionales y sabiduría africana',
      'Descubrimiento cultural e identidad',
      'Amistad y solidaridad',
      'Naturaleza y medio ambiente',
    ],
    storyLocation: 'Lugar de la historia',
    storyLocationPlaceholder: 'ej. Yaundé, Monte Camerún, Selva tropical',
    storyArea: 'Zona de residencia',
    storyAreaSelect: 'Seleccionar',
    storyAreaOptions: [
      'Urbana (ciudad)',
      'Rural (pueblo)',
      'Costera (mar)',
      'Montañosa (meseta)',
    ],
    heroPhoto: 'Foto del héroe (opcional)',
    heroPhotoChoose: 'Haga clic para elegir una foto',
    heroPhotoUpload: 'Subir foto',
    heroPhotoUploading: 'Subiendo...',
    heroPhotoPreview: 'Vista previa:',
    customizeBook: 'Personalizar',
    loginCheckInbox: 'Verificación de teléfono',
    loginEnterCodeSubtitle: 'Se ha enviado un código de 6 dígitos a su número.',
    loginCodeLabel: 'Código de prueba',
    loginCodeSent: 'Código enviado a WhatsApp!',
    loginCodeError: 'Error al enviar el código',
    loginPhoneContinue: 'Validar',
    loginCodeVerifying: 'Verificando...',
    loginPhoneSending: 'Enviando...',
    loginResendCode: 'Reenviar código',
    loginCodeIncorrect: 'Código incorrecto',
    loginBack: 'Anterior',
    packTitle: 'Selección de Pack',
    packOptions: ['Basico', 'Estándar', 'Prestige'],
    characterTitle: ['Personaje 1', 'Personaje 2', 'Personaje 3', 'Personaje 4', 'Personaje 5'],
    relationOptions: ['Relación 1', 'Relación 2', 'Relación 3', 'Relación 4', 'Relación 5', 'Relación 6', 'Relación 7', 'Relación 8', 'Relación 9', 'Relación 10'],
    relationPlaceholder: ['Ex: Padre', 'Ex: Madre', 'Ex: Hermano/Hermana', 'Ex: Amigo(a)', 'Ex: Abuelo(a)', 'Ex: Tío/Tía', 'Ex: Primo(a)', 'Ex: Profesor(a)', 'Ex: Animal', 'Ex: Otro'],
    animalTypeOptions: ['Animal 1', 'Animal 2', 'Animal 3', 'Animal 4', 'Animal 5'],
    animalTypePlaceholder: ['Ex: León', 'Ex: Tigre', 'Ex: Elefante', 'Ex: Zebra', 'Ex: Perro'],
    sexOptions: ['Hombre', 'Mujer'],
    ageOptions: ['Niño/a (3-8 años)', 'Adolescente (9-15 años)', 'Adulto (16+ años)', 'Adulto mayor (60+ años)'],
    photoOptions: ['Foto 1', 'Foto 2', 'Foto 3', 'Foto 4', 'Foto 5'],
    uploadingOptions: ['Subiendo 1', 'Subiendo 2', 'Subiendo 3', 'Subiendo 4', 'Subiendo 5'],
    uploadOptions: ['Subir 1', 'Subir 2', 'Subir 3', 'Subir 4', 'Subir 5'],
    previewOptions: ['Vista previa 1', 'Vista previa 2', 'Vista previa 3', 'Vista previa 4', 'Vista previa 5'],
    bookLanguagesTitle: 'Idiomas del libro',
    bookLanguagesOptions: 'Seleccione los idiomas',
    valuesTitle: 'Valores',
    messageTitle: 'Mensaje Especial',
    recapTitle: 'Resumen',
    bookField: 'Libro',
    packField: 'Pack',
    languagesField: 'Idiomas',
    heroField: 'Héroe',
    heroPhotoField: 'Foto del héroe',
    charactersField: 'Personajes',
    messageField: 'Mensaje',
    deliveryField: 'Envío',
    messagePlaceholder: 'Ingrese su mensaje especial',
    addingToCart: 'Añadir al carrito',
    addCart: 'Añadir al carrito',
    bookLanguagesList: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Arabe'],
    bookLanguagesNames: { fr: 'Français', en: 'Anglais', de: 'Allemand', es: 'Espagnol', ar: 'Arabe' },
  },
  ar: {
    contact: 'الخطوة 1: معلوماتك',
    fullName: 'اسمك الكامل',
    fullNamePlaceholder: 'مثال: أحمد محمد',
    phone: 'رقم هاتفك (الكاميرون)',
    phonePlaceholder: 'مثال: 09XX XXX XXX أو 6XX XXX XXX',
    phoneTitle: 'رقم هاتف كاميروني (09XX XXX XXX أو 6XX XXX XXX)',
    address: 'العنوان',
    addressPlaceholder: 'مثال: 123 شارع الفرح، حي نلونكاك',
    city: 'المدينة',
    cityPlaceholder: 'مثال: ياوندي',
    postal: 'الرمز البريدي (اختياري)',
    postalPlaceholder: 'مثال: 12345',
    country: 'البلد',
    countryPlaceholder: 'مثال: الكاميرون',
    next: 'التالي',
    prev: 'السابق',
    hero: 'الخطوة 2: معلومات البطل',
    heroName: 'اسم البطل (طفلك)',
    heroNamePlaceholder: 'مثال: أمينة، كواجيو...',
    heroAge: 'عمر الطفل (بالسنوات)',
    heroAgePlaceholder: 'مثال: 7',
    heroAgeError: 'يجب أن يكون العمر بين 0 و12 سنة.',
    mainTheme: 'الموضوع الرئيسي',
    mainThemeSelect: 'اختر',
    mainThemeOptions: [
      'المغامرة والاستكشاف',
      'أبطال الحياة اليومية والمرونة',
      'القصص التقليدية والحكمة الأفريقية',
      'اكتشاف الثقافة والهوية',
      'الصداقة والتضامن',
      'الطبيعة والبيئة',
    ],
    storyLocation: 'مكان القصة',
    storyLocationPlaceholder: 'مثال: ياوندي، جبل الكاميرون، الغابة المطيرة',
    storyArea: 'منطقة السكن',
    storyAreaSelect: 'اختر',
    storyAreaOptions: [
      'حضري (مدينة)',
      'ريفي (قرية)',
      'ساحلي (بحر)',
      'جبلي (هضبة)',
    ],
    heroPhoto: 'صورة البطل (اختياري)',
    heroPhotoChoose: 'انقر لاختيار صورة',
    heroPhotoUpload: 'رفع الصورة',
    heroPhotoUploading: 'جارٍ الرفع...',
    heroPhotoPreview: 'المعاينة:',
    customizeBook: 'التخصيص',
    loginCheckInbox: 'التحقق من الهاتف',
    loginEnterCodeSubtitle: 'تم إرسال رمز مكون من 6 أرقام إلى رقمك.',
    loginCodeLabel: 'رمز الاختبار',
    loginCodeSent: 'تم إرسال رمز إلى WhatsApp!',
    loginCodeError: 'خطأ في إرسال الرمز',
    loginPhoneContinue: 'تأكيد',
    loginCodeVerifying: 'يتم التحقق...',
    loginPhoneSending: 'جارٍ الإرسال...',
    loginResendCode: 'إعادة إرسال الرمز',
    loginCodeIncorrect: 'الرمز غير صحيح',
    loginBack: 'السابق',
    packTitle: 'اختيار الحزمة',
    packOptions: ['أساسي', 'متوسط', 'متميز'],
    characterTitle: ['شخصية 1', 'شخصية 2', 'شخصية 3', 'شخصية 4', 'شخصية 5'],
    relationOptions: ['العلاقة 1', 'العلاقة 2', 'العلاقة 3', 'العلاقة 4', 'العلاقة 5', 'العلاقة 6', 'العلاقة 7', 'العلاقة 8', 'العلاقة 9', 'العلاقة 10'],
    relationPlaceholder: ['مثال: الأب', 'مثال: الأم', 'مثال: الأخ', 'مثال: الصديق', 'مثال: الأبن الكبير', 'مثال: العم', 'مثال: الأخ', 'مثال: المعلم', 'مثال: الحيوان', 'مثال: غير ذلك'],
    animalTypeOptions: ['حيوان 1', 'حيوان 2', 'حيوان 3', 'حيوان 4', 'حيوان 5'],
    animalTypePlaceholder: ['مثال: ليون', 'مثال: تيغر', 'مثال: إلفانت', 'مثال: زيبرا', 'مثال: سكري'],
    sexOptions: ['ذكر', 'أنثى'],
    ageOptions: ['طفل (3-8 سنوات)', 'مراهق (9-15 سنوات)', 'مراهق (16+ سنوات)', 'مسن (60+ سنوات)'],
    photoOptions: ['الصورة 1', 'الصورة 2', 'الصورة 3', 'الصورة 4', 'الصورة 5'],
    uploadingOptions: ['تحميل 1', 'تحميل 2', 'تحميل 3', 'تحميل 4', 'تحميل 5'],
    uploadOptions: ['تحميل 1', 'تحميل 2', 'تحميل 3', 'تحميل 4', 'تحميل 5'],
    previewOptions: ['معاينة 1', 'معاينة 2', 'معاينة 3', 'معاينة 4', 'معاينة 5'],
    bookLanguagesTitle: 'لغات الكتاب',
    bookLanguagesOptions: 'حالة اللغات',
    valuesTitle: 'القيم',
    messageTitle: 'رسالة خاصة',
    recapTitle: 'ملخص',
    bookField: 'الكتاب',
    packField: 'الحزمة',
    languagesField: 'اللغات',
    heroField: 'البطل',
    heroPhotoField: 'صورة البطل',
    charactersField: 'الشخصيات',
    messageField: 'الرسالة',
    deliveryField: 'التسليم',
    messagePlaceholder: 'أدخل رسالتك الخاصة',
    addingToCart: 'إضافة إلى السلة',
    addCart: 'إضافة إلى السلة',
    bookLanguagesList: ['Français', 'Anglais', 'Allemand', 'Espagnol', 'Arabe'],
    bookLanguagesNames: { fr: 'Français', en: 'Anglais', de: 'Allemand', es: 'Espagnol', ar: 'Arabe' },
  },
};

// --- Le Composant Principal ---
export default function PersonalizePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  // Initialisation de l'étape à partir de l'URL
  const initialStep = React.useMemo(() => {
    const stepParam = searchParams.get('step');
    const parsed = stepParam ? parseInt(stepParam, 10) : 1;
    return isNaN(parsed) ? 1 : parsed;
  }, [searchParams]);
  const [step, setStep] = React.useState(initialStep);

  // Synchroniser l'étape si l'URL change (ex: navigation via bouton précédent)
  React.useEffect(() => {
    const stepParam = searchParams.get('step');
    const parsed = stepParam ? parseInt(stepParam, 10) : 1;
    setStep(isNaN(parsed) ? 1 : parsed);
  }, [searchParams]);
  
  // --- États du Composant ---
  const [book, setBook] = useState<Book | null>(null);
  const [availableValues, setAvailableValues] = useState<Value[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- États du Formulaire ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SECTION 1: INFOS UTILISATEUR & LIVRAISON
  const [userFullName, setUserFullName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Cameroun');

  // SECTION 2: INFOS HÉROS (ENFANT)
  const [childName, setChildName] = useState('');
  const [heroAge, setHeroAge] = useState<number | ''>(''); // Âge numérique dans le formulaire
  const [mainTheme, setMainTheme] = useState('');
  const [storyLocation, setStoryLocation] = useState('');
  const [storyArea, setStoryArea] = useState('');
  const [childPhotoUrl, setChildPhotoUrl] = useState(''); 
  const [childFileToUpload, setChildFileToUpload] = useState<File | null>(null);
  const [isChildPhotoUploading, setIsChildPhotoUploading] = useState(false);
  const childFileInputRef = useRef<HTMLInputElement>(null);

  // SECTION 3: PACK ET PERSONNAGES
  const [packType, setPackType] = useState<'Basique' | 'Standard' | 'Prestige'>('Basique');
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const nextCharId = useRef(0); 

  // SECTION 4: LANGUES ET VALEURS
  const [bookLanguages, setBookLanguages] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<number[]>([]); // Contient les IDs des valeurs

  // SECTION 5: MESSAGE SPÉCIAL
  const [messageSpecial, setMessageSpecial] = useState(''); 
  
  const { toggleCart } = useCartStore();

  // --- Multilingue ---
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];

  // --- États pour la vérification du téléphone ---
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [sentCode, setSentCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Ajouter l'état manquant pour l'affichage du bloc de vérification
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // 1. Ajouter un nouvel état step1Status: 'form' | 'confirm' | 'code' | 'register'
  const [step1Status, setStep1Status] = useState<'form' | 'confirm' | 'code' | 'register'>('form');
  const [step1UserExists, setStep1UserExists] = useState<boolean | null>(null);
  const [step1Code, setStep1Code] = useState('');
  const [step1IsLoading, setStep1IsLoading] = useState(false);
  const [step1Error, setStep1Error] = useState('');

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const [bookRes, valuesRes] = await Promise.all([
          fetch(`/api/books/${id}`),
          fetch('/api/values')
        ]);
        if (!bookRes.ok) throw new Error("Le livre n'a pas pu être chargé.");
        setBook(await bookRes.json());
        if (valuesRes.ok) {
          const fetchedValues = await valuesRes.json();
          setAvailableValues(fetchedValues);
        }
      } catch (error) { console.error(error); toast.error("Erreur de chargement des données."); } 
      finally { setIsLoading(false); }
    }
    fetchInitialData();
  }, [id]);

  // Gère la mise à jour des personnages en fonction du pack sélectionné
  useEffect(() => {
    const requiredChars = packDetails[packType].characters;
    setCharacters(prev => {
      const newChars = [...prev];
      while (newChars.length < requiredChars) {
        newChars.push({ 
          id: nextCharId.current++, 
          name: '', relationshipToHero: '', animalType: '', sex: '', age: '', photoUrl: '', fileToUpload: null, isUploading: false 
        });
      }
      return newChars.slice(0, requiredChars); // Tronque si le nombre de caractères est réduit
    });
  }, [packType]);

  const handleChildPhotoUpload = async () => { 
    if (!childFileInputRef.current?.files?.[0]) return;
    const file = childFileInputRef.current.files[0];
    
    // Éviter de téléverser si on a déjà une URL pour cette image
    if (childPhotoUrl && childFileToUpload && file.name === childFileToUpload.name) {
      toast.info('Cette image a déjà été téléversée.');
      return;
    }
    
    setIsChildPhotoUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const result = await response.json();
        setChildPhotoUrl(result.url);
        setChildFileToUpload(file);
        toast.success('Photo uploadée avec succès !');
      } else {
        toast.error('Erreur lors de l\'upload de la photo.');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload de la photo.');
    } finally {
      setIsChildPhotoUploading(false);
    }
  };

  const handleCharacterPhotoUpload = async (index: number, eventOrFile: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = eventOrFile instanceof File ? eventOrFile : eventOrFile.target.files?.[0];
    if (!file) return;
    
    const char = characters[index];
    
    // Éviter de téléverser si on a déjà une URL pour cette image
    if (char.photoUrl && char.fileToUpload && file.name === char.fileToUpload.name) {
      toast.info('Cette image a déjà été téléversée.');
      return;
    }
    
    setCharacters(prev => prev.map((char, i) => 
      i === index ? { ...char, isUploading: true } : char
    ));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const result = await response.json();
        setCharacters(prev => prev.map((char, i) => 
          i === index ? { ...char, photoUrl: result.url, fileToUpload: file, isUploading: false } : char
        ));
        toast.success('Photo uploadée avec succès !');
      } else {
        toast.error('Erreur lors de l\'upload de la photo.');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload de la photo.');
    } finally {
      setCharacters(prev => prev.map((char, i) => 
        i === index ? { ...char, isUploading: false } : char
      ));
    }
  };

  const handleLanguageToggle = (lang: string) => {
    setBookLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleValueToggle = (valueId: number) => {
    setSelectedValues(prev => 
      prev.includes(valueId) 
        ? prev.filter(id => id !== valueId)
        : [...prev, valueId]
    );
  };

  // --- SOUMISSION FINALE DU FORMULAIRE ---
  const handleSubmit = async (e: FormEvent) => { 
    e.preventDefault();
    if (!book) return;
    setIsSubmitting(true);

    try {
      // 1. Utiliser la photo de l'enfant déjà uploadée ou uploader si nécessaire
      let finalChildPhotoUrl = childPhotoUrl || '';
      if (childFileToUpload && !childPhotoUrl) {
        const childFormData = new FormData();
        childFormData.append('file', childFileToUpload);
        const childUploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: childFormData
        });
        if (childUploadRes.ok) {
          const childResult = await childUploadRes.json();
          finalChildPhotoUrl = childResult.url;
        }
      }

      // 2. Utiliser les photos des personnages déjà uploadées ou uploader si nécessaire
      const characterPhotos: string[] = [];
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        let photoUrl = char.photoUrl || '';
        
        // Upload seulement si on a un fichier mais pas d'URL
        if (char.fileToUpload && !photoUrl) {
          const charFormData = new FormData();
          charFormData.append('file', char.fileToUpload);
          const charUploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: charFormData
          });
          if (charUploadRes.ok) {
            const charResult = await charUploadRes.json();
            photoUrl = charResult.url;
          }
        }
        characterPhotos.push(photoUrl);
      }

      // 3. Préparer toutes les URLs d'images
      const allUploadedImages = [finalChildPhotoUrl, ...characterPhotos].filter(url => url);

      // 4. Préparer les données des personnages avec les URLs mises à jour
      const charactersForApi = characters.filter(char => char.name).map((char, index) => ({
        name: char.name,
        relationshipToHero: char.relationshipToHero,
        animalType: char.animalType || null, 
        sex: char.sex || null,               
        age: char.age || null,               
        photoUrl: characterPhotos[index] || char.photoUrl || null,     
      }));

      // 5. Collecte de TOUTES les données du formulaire
      // Récupérer le userId depuis le localStorage (auth téléphone)
      let userId = null;
      if (typeof window !== 'undefined') {
        const phoneAuth = localStorage.getItem('phoneAuth');
        if (phoneAuth) {
          try {
            const userData = JSON.parse(phoneAuth);
            userId = userData.id;
          } catch (e) {}
        }
      }

      const orderData = { 
        bookId: book.id,
        // Informations utilisateur & livraison (Étape 1)
        userFullName,
        userPhoneNumber,
        deliveryAddress,
        city,
        postalCode,
        country,

        // Informations du héros (Étape 2)
        childName,
        heroAgeRange: heroAge === '' ? null : String(heroAge),
        mainTheme,
        storyLocation,
        storyArea,
        childPhotoUrl: finalChildPhotoUrl || '',

        // Pack et Personnages (Étape 3)
        packType,
        characters: charactersForApi,

        // Langues et Valeurs (Étape 4)
        bookLanguages,
        valueIds: selectedValues,

        // Message spécial (Étape 5)
        messageSpecial, 

        // Images uploadées
        uploadedImages: allUploadedImages,
        ...(session && session.user && session.user.id ? { userId: session.user.id } : {}),
        ...(userId ? { userId } : {}),
      };

      // 6. Créer la commande personnalisée
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Erreur API lors de la soumission:", errorBody);
        throw new Error(errorBody.message || 'Erreur lors de la soumission de la commande');
      }
      
      const result = await response.json(); 
      
      // Ajouter la commande personnalisée au panier
      const { addPersonalizedOrder } = useCartStore.getState();
      addPersonalizedOrder(result.id, result.calculatedPrice);
      
      toggleCart(); 
      toast.success('Commande personnalisée créée avec succès !');
      // Pas besoin de redirection, toggleCart() ouvre déjà la SideCart
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error(`Échec de la commande: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. À la soumission de l'étape 1 :
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      // Vérifier l'existence du compte
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhoneNumber, action: 'check-user' })
      });
      const data = await res.json();
      setStep1UserExists(data.exists);
      if (data.exists) {
        setStep1Status('confirm');
      } else {
        // Envoyer le code directement
        await sendStep1Code();
        setStep1Status('code');
      }
    } catch (err) {
      setStep1Error('Erreur lors de la vérification du compte.');
    } finally {
      setStep1IsLoading(false);
    }
  };

  // 3. Fonction pour envoyer le code
  const sendStep1Code = async () => {
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhoneNumber, action: 'send-code' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur envoi code');
      // Optionnel: afficher toast
    } catch (err) {
      setStep1Error('Erreur lors de l\'envoi du code.');
    } finally {
      setStep1IsLoading(false);
    }
  };

  // 4. Fonction pour vérifier le code
  const verifyStep1Code = async () => {
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhoneNumber, action: 'verify-code', code: step1Code })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Code incorrect');
      if (step1UserExists) {
        // Compte existant: passer à l'étape 2
        goToStep(2);
      } else {
        // Création automatique du compte
        try {
          const resRegister = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: userFullName.split(' ')[0] || '',
              lastName: userFullName.split(' ').slice(1).join(' ') || '',
              email: '',
              phoneNumber: userPhoneNumber.replace(/\s/g, ''),
              address: deliveryAddress,
              city,
              country
            })
          });
          const dataRegister = await resRegister.json();
          if (!resRegister.ok || !dataRegister.user) throw new Error(dataRegister.error || 'Erreur création compte');
          // Stocker l'utilisateur dans localStorage pour auto-login (phoneAuth)
          localStorage.setItem('phoneAuth', JSON.stringify({
            id: dataRegister.user.id,
            phoneNumber: dataRegister.user.phoneNumber,
            firstName: dataRegister.user.firstName,
            lastName: dataRegister.user.lastName,
            email: dataRegister.user.email,
          }));
          goToStep(2);
          return;
        } catch (err) {
          setStep1Error('Erreur lors de la création du compte.');
          return;
        }
      }
    } catch (err) {
      setStep1Error('Code incorrect ou erreur.');
    } finally {
      setStep1IsLoading(false);
    }
  };

  // --- LOGIQUE DE VALIDATION POUR LES BOUTONS SUIVANT/PRÉCÉDENT ---
  const isNextDisabled = (() => {
    switch (step) {
      case 1: // Vos informations (Contact & Livraison)
        return !userFullName || !userPhoneNumber || !deliveryAddress || !city || !country;
      case 2: // Informations du héros (enfant)
        return !childName || heroAge === '' || heroAge < 0 || heroAge > 12 || !mainTheme || !storyLocation || !storyArea || isChildPhotoUploading;
      case 3: // Pack et personnages
        const allRequiredCharsFilled = characters.every(char => 
          char.name && char.relationshipToHero && 
          !(char.relationshipToHero === 'Animal' && !char.animalType) && 
          !char.isUploading
        );
        return !packType || !allRequiredCharsFilled || characters.some(char => char.isUploading); 
      case 4: // Langues et valeurs
        const languagesValid = bookLanguages.length > 0 && bookLanguages.length <= packDetails[packType].maxLanguages;
        const valuesValid = selectedValues.length > 0 && selectedValues.length <= packDetails[packType].maxValues;
        return !languagesValid || !valuesValid;
      case 5: // Message Spécial (toujours enabled car optionnel)
        return false; 
      default:
        return false;
    }
  })();

  const goToStep = (s: number) => { 
    if (s < step) { setStep(s); return; } 
    if (isNextDisabled && s > step) { 
      toast.warn("Veuillez compléter tous les champs requis de l'étape actuelle avant de continuer.");
      return;
    }
    setStep(s);
  };

  // --- LOGIQUE DE PASSAGE À L'ÉTAPE SUIVANTE ---
  // Je supprime toute la logique liée à isVerifyingPhone, PhoneCodeVerification, sendVerificationCode, verifyCode, et l'affichage de l'étape de vérification par code après l'étape 1.
  // L'étape 1 affiche uniquement le formulaire d'informations utilisateur et livraison, puis passe directement à l'étape 2.

  // Exemple d'utilisation lors de la détection d'un nouvel utilisateur (avant router.push('/inscription?...')) :
  if (typeof window !== 'undefined') {
    localStorage.setItem('registerPrefill', JSON.stringify({
      userFullName,
      userPhoneNumber,
      deliveryAddress,
      city,
      postalCode,
      country
    }));
  }

  // --- Rendu du Composant ---
  if (isLoading) return <div className="text-center p-10 text-xl text-gray-700 dark:text-gray-300">Chargement du livre...</div>;
  if (!book) return (
    <div className="text-center p-10 text-xl text-red-500">
      Ce livre n'existe pas ou n'est pas encore personnalisable.<br />
      <a href="/livres" className="mt-4 inline-block text-orange-600 underline hover:text-orange-800">Retour à la boutique</a>
    </div>
  );

  const totalSteps = 5; 
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* Sélecteur de langue */}
      <div className="flex justify-end mb-4">
        <select value={lang} onChange={e => setLang(e.target.value as Lang)} className="border rounded p-2">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">{t.customizeBook || 'Personnalisez'} "{book.title}"</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8 sm:mb-12">Créez une histoire unique, étape par étape.</p>
      
      {/* Barre de Progression Visuelle et Cliqable */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button type="button" key={s} onClick={() => goToStep(s)} className={`flex flex-col items-center transition-all duration-300 group ${s === step ? 'text-orange-500 font-bold' : 'text-gray-500 dark:text-gray-400'} ${s <= step ? 'cursor-pointer' : 'cursor-default'}`} aria-label={`Aller à l'étape ${s}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${s === step ? 'bg-orange-500 border-orange-500 text-white' : s < step ? 'bg-gray-300 border-gray-300 text-gray-800 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'}`}>{s}</div>
              <span className="text-xs mt-1 hidden sm:block">
                {s === 1 && "Contact"}
                {s === 2 && "Héros"}
                {s === 3 && "Pack"} 
                {s === 4 && "Langues"} 
                {s === 5 && "Message"}
                {s === 6 && "Aperçu"} 
              </span>
            </button>
          ))}
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
        {/* Étape 1 */}
        {step === 1 && (
          <>
            {step1Status === 'form' && (
              <form onSubmit={handleStep1Submit}>
                {/* ÉTAPE 1: Informations de l'utilisateur et livraison */}
                <section className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t.contact}</h2>
                  <div>
                    <label htmlFor="userFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.fullName}</label>
                    <input type="text" id="userFullName" value={userFullName} onChange={(e) => setUserFullName(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.fullNamePlaceholder} />
                  </div>
                  <div>
                    <label htmlFor="userPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                    <input type="tel" id="userPhoneNumber" value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.phonePlaceholder} pattern="^(09|6)\d{8}$" title={t.phoneTitle} />
                  </div>
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                    <input type="text" id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.addressPlaceholder} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.city}</label>
                      <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.cityPlaceholder} />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.postal}</label>
                      <input type="text" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.postalPlaceholder} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.country}</label>
                    <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.countryPlaceholder} />
                  </div>
                </section>
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={isNextDisabled}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full"
                  >
                    {t.next}
                  </button>
                </div>
              </form>
            )}
            {step1Status === 'confirm' && (
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6 animate-fade-in">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-16 h-16 text-orange-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmer votre numéro</h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{userPhoneNumber}</p>
                </div>
                <div className="flex flex-col gap-4 w-full mt-4">
                  <button
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-orange-600 transition-colors"
                    onClick={async () => {
                      await sendStep1Code();
                      setStep1Status('code');
                    }}
                  >
                    Continuer avec ce numéro
                  </button>
                  <button
                    className="w-full bg-orange-100 text-orange-600 py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-orange-200 transition-colors border border-orange-200"
                    onClick={() => {
                      setStep1Status('form');
                      setStep1UserExists(null);
                      setStep1Code('');
                      setUserPhoneNumber(''); // Vide uniquement le numéro
                    }}
                  >
                    Changer de compte
                  </button>
                </div>
              </div>
            )}
            {step1Status === 'code' && (
              <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6 animate-fade-in">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-16 h-16 text-orange-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M22 7l-10 6L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vérification du code</h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">Un code a été envoyé à <span className="text-orange-500">{userPhoneNumber}</span></p>
                </div>
                <div className="flex justify-center space-x-2 mt-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={step1Code[idx] || ''}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        let newCode = step1Code.split('');
                        if (value.length === 1) {
                          newCode[idx] = value;
                          setStep1Code(newCode.join(''));
                          if (idx < 5) setTimeout(() => document.getElementById(`code-input-${idx+1}`)?.focus(), 0);
                        } else if (value.length > 1) {
                          const chars = value.split('');
                          for (let i = 0; i < chars.length && idx + i < 6; i++) {
                            newCode[idx + i] = chars[i];
                          }
                          setStep1Code(newCode.join(''));
                          const nextIndex = Math.min(idx + value.length - 1, 5);
                          setTimeout(() => document.getElementById(`code-input-${nextIndex}`)?.focus(), 0);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'ArrowLeft' && idx > 0) document.getElementById(`code-input-${idx-1}`)?.focus();
                        else if (e.key === 'ArrowRight' && idx < 5) document.getElementById(`code-input-${idx+1}`)?.focus();
                        else if (e.key === 'Backspace') {
                          if (step1Code[idx]) {
                            let newCode = step1Code.split('');
                            newCode[idx] = '';
                            setStep1Code(newCode.join(''));
                          } else if (idx > 0) document.getElementById(`code-input-${idx-1}`)?.focus();
                        }
                      }}
                      id={`code-input-${idx}`}
                      className="w-12 h-12 text-center text-xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                {step1Error && <div className="text-red-500 text-sm text-center mt-2">{step1Error}</div>}
                <button
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-orange-600 transition-colors mt-4"
                  disabled={step1IsLoading || step1Code.length !== 6}
                  onClick={verifyStep1Code}
                >
                  Vérifier le code
                </button>
                <button
                  className="w-full bg-orange-100 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-200 transition-colors mt-2 border border-orange-200"
                  onClick={sendStep1Code}
                  disabled={step1IsLoading}
                >
                  Renvoyer le code
                </button>
              </div>
            )}
          </>
        )}
        {/* Étape 2 */}
        {step === 2 && (
          <form onSubmit={e => { e.preventDefault(); goToStep(step + 1); }}>
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t.hero}</h2>
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.heroName}</label>
                <input type="text" id="childName" value={childName} onChange={(e) => setChildName(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.heroNamePlaceholder} />
              </div>
              <div>
                <label htmlFor="heroAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.heroAge}</label>
                <input 
                  type="number" 
                  id="heroAge" 
                  value={heroAge} 
                  onChange={(e) => setHeroAge(Number(e.target.value))} 
                  required 
                  min="0"
                  max="12"
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" 
                  placeholder={t.heroAgePlaceholder} 
                />
                {heroAge !== '' && (heroAge < 0 || heroAge > 12) && (
                  <p className="text-xs text-red-500 mt-1">{t.heroAgeError}</p>
                )}
              </div>
              <div>
                <label htmlFor="mainTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.mainTheme}</label>
                <select id="mainTheme" value={mainTheme} onChange={(e) => setMainTheme(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                  <option value="">{t.mainThemeSelect}</option>
                  {t.mainThemeOptions.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="storyLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.storyLocation}</label>
                <input type="text" id="storyLocation" value={storyLocation} onChange={(e) => setStoryLocation(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder={t.storyLocationPlaceholder} />
              </div>
              <div>
                <label htmlFor="storyArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.storyArea}</label>
                <select id="storyArea" value={storyArea} onChange={(e) => setStoryArea(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                  <option value="">{t.storyAreaSelect}</option>
                  {t.storyAreaOptions.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.heroPhoto}</p>
              <input type="file" ref={childFileInputRef} onChange={(e) => setChildFileToUpload(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
              <button type="button" onClick={() => childFileInputRef.current?.click()} className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                {childFileToUpload ? `Fichier : ${childFileToUpload.name}` : t.heroPhotoChoose}
              </button>
              <button type="button" onClick={handleChildPhotoUpload} disabled={!childFileToUpload || isChildPhotoUploading} className="mt-4 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 w-full">
                {isChildPhotoUploading ? t.heroPhotoUploading : t.heroPhotoUpload}
              </button>
              {childPhotoUrl && (
                <div className="mt-6 text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{t.heroPhotoPreview}</p>
                  <Image src={childPhotoUrl} alt="Aperçu photo héros" width={150} height={150} className="rounded-md mx-auto" />
                </div>
              )}
            </section>
            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => goToStep(step - 1)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg">{t.prev}</button>
              <button type="submit" disabled={isNextDisabled} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full">{t.next}</button>
            </div>
          </form>
        )}

        {/* ÉTAPE 3: Pack et Personnages */}
        {step === 3 && (
          <form onSubmit={e => { e.preventDefault(); goToStep(step + 1); }}>
            <section className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 3: Choix du Pack et Personnages</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.packTitle}</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pack" value="Basique" checked={packType === 'Basique'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                    <span className="text-gray-800 dark:text-gray-200">{t.packOptions[0]}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pack" value="Standard" checked={packType === 'Standard'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                    <span className="text-gray-800 dark:text-gray-200">{t.packOptions[1]}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="pack" value="Prestige" checked={packType === 'Prestige'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                    <span className="text-gray-800 dark:text-gray-200">{t.packOptions[2]}</span>
                  </label>
                </div>
              </div>

              {characters.map((char, index) => (
                <div key={char.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.characterTitle[index]}</h3>
                  <div>
                    <label htmlFor={`char-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.relationOptions[index]}</label>
                    <input type="text" id={`char-name-${index}`} value={char.name} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200" placeholder={t.relationPlaceholder[index]} />
                  </div>
                  <div>
                    <label htmlFor={`char-relation-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.relationOptions[index]}</label>
                    <select id={`char-relation-${index}`} value={char.relationshipToHero} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, relationshipToHero: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                      <option value="">{t.relationOptions[index]}</option>
                      <option value="Père">{t.relationOptions[0]}</option>
                      <option value="Mère">{t.relationOptions[1]}</option>
                      <option value="Frère/Sœur">{t.relationOptions[2]}</option>
                      <option value="Ami(e)">{t.relationOptions[3]}</option>
                      <option value="Grand-Parent">{t.relationOptions[4]}</option>
                      <option value="Oncle/Tante">{t.relationOptions[5]}</option>
                      <option value="Cousin(e)">{t.relationOptions[6]}</option>
                      <option value="Enseignant(e)">{t.relationOptions[7]}</option>
                      <option value="Animal">{t.relationOptions[8]}</option>
                      <option value="Autre">{t.relationOptions[9]}</option>
                    </select>
                  </div>
                  {char.relationshipToHero === 'Animal' && (
                    <div>
                      <label htmlFor={`animal-type-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.animalTypeOptions[index]}</label>
                      <input type="text" id={`animal-type-${index}`} value={char.animalType} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, animalType: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200" placeholder={t.animalTypePlaceholder[index]} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.sexOptions[index]}</label>
                    <div className="flex space-x-4">
                      <label><input type="radio" name={`char-sex-${index}`} value="Homme" checked={char.sex === 'Homme'} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, sex: e.target.value } : c))} className="form-radio text-orange-500" /> {t.sexOptions[0]}</label>
                      <label><input type="radio" name={`char-sex-${index}`} value="Femme" checked={char.sex === 'Femme'} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, sex: e.target.value } : c))} className="form-radio text-orange-500" /> {t.sexOptions[1]}</label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`char-age-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ageOptions[index]}</label>
                    <select id={`char-age-${index}`} value={char.age} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, age: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                      <option value="">{t.ageOptions[index]}</option>
                      <option value="Enfant (3-8 ans)">{t.ageOptions[0]}</option>
                      <option value="Adolescent (9-15 ans)">{t.ageOptions[1]}</option>
                      <option value="Adulte (16+ ans)">{t.ageOptions[2]}</option>
                      <option value="Senior (60+ ans)">{t.ageOptions[3]}</option>
                    </select>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.photoOptions[index]}</p>
                  <input type="file" onChange={(e) => handleCharacterPhotoUpload(index, e)} className="hidden" id={`char-file-${index}`} accept="image/*" />
                  <button type="button" onClick={() => document.getElementById(`char-file-${index}`)?.click()} className="w-full p-2 border-2 border-dashed rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {char.fileToUpload ? `Fichier : ${char.fileToUpload.name}` : t.photoOptions[index]}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (char.fileToUpload) {
                        handleCharacterPhotoUpload(index, char.fileToUpload);
                      }
                    }} 
                    disabled={!char.fileToUpload || char.isUploading} 
                    className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 w-full"
                  >
                    {char.isUploading ? t.uploadingOptions[index] : t.uploadOptions[index]}
                  </button>
                  {char.photoUrl && (
                    <div className="mt-4 text-center">
                      <p className="font-semibold dark:text-white">{t.previewOptions[index]}</p>
                      <Image src={char.photoUrl} alt="Aperçu personnage" width={100} height={100} className="rounded-md mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </section>
            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => goToStep(step - 1)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg">{t.prev}</button>
              <button type="submit" disabled={isNextDisabled} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full">{t.next}</button>
            </div>
          </form>
        )}

        {/* ÉTAPE 4: Langues et Valeurs */}
        {step === 4 && (
          <form onSubmit={e => { e.preventDefault(); goToStep(step + 1); }}>
            <section className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t.bookLanguagesTitle}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.bookLanguagesOptions} ({bookLanguages.length}/{packDetails[packType].maxLanguages}) :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['fr','en','de','es','ar'].map((code) => (
                    <label key={code} className="flex items-center space-x-2 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={bookLanguages.includes(code)}
                        onChange={() => handleLanguageToggle(code)}
                        disabled={bookLanguages.length >= packDetails[packType].maxLanguages && !bookLanguages.includes(code)}
                        className="form-checkbox text-orange-500" 
                      />
                      <span>{(t.bookLanguagesNames as any)[code]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.valuesTitle}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableValues.map((value) => (
                    <label key={value.id} className="flex items-center space-x-2 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                      <input 
                        type="checkbox"
                        checked={selectedValues.includes(value.id)}
                        onChange={() => handleValueToggle(value.id)}
                        disabled={selectedValues.length >= packDetails[packType].maxValues && !selectedValues.includes(value.id)}
                        className="form-checkbox text-orange-500" 
                      />
                      <span>{(value as any)[`name_${lang}`] || (value as any).name_fr}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => goToStep(step - 1)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg">{t.prev}</button>
              <button type="submit" disabled={isNextDisabled} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full">{t.next}</button>
            </div>
          </form>
        )}

        {/* ÉTAPE 5: Message Spécial */}
        {step === 5 && (
          <form onSubmit={handleSubmit}>
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t.messageTitle}</h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                {/* Héros (Étape 2) */}
                <section>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>🦸</span> {t.heroField}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><span>🧑‍🎓</span> <span className="font-bold">{childName}</span></div>
                    <div className="flex items-center gap-2"><span>🎂</span> <span>{heroAge} ans</span></div>
                    <div className="flex items-center gap-2"><span>🏙️</span> <span>{storyArea}</span></div>
                    <div className="flex items-center gap-2"><span>📍</span> <span>{storyLocation}</span></div>
                    <div className="flex items-center gap-2"><span>📖</span> <span>{mainTheme}</span></div>
                    {childPhotoUrl && (
                      <div className="flex items-center gap-2"><span>🖼️</span>
                        <img src={childPhotoUrl} alt="Photo héros" className="w-16 h-16 object-cover rounded-full border-2 border-orange-300 shadow" />
                      </div>
                    )}
                  </div>
                  <hr className="my-2" />
                </section>
                {/* Pack et Personnages (Étape 3) */}
                <section>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>📦</span> {t.packField}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium shadow">{packType}</span>
                    <span className="text-gray-500">({packDetails[packType].price} FCFA)</span>
                  </div>
                  <h5 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>👥</span> {t.charactersField}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {characters.map((char, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                        {char.photoUrl && (
                          <img src={char.photoUrl} alt={char.name} className="w-12 h-12 object-cover rounded-full border-2 border-gray-300" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2"><span>🧑‍🤝‍🧑</span> <span className="font-medium">{char.name}</span></div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>🔗</span> {char.relationshipToHero}
                            <span>⚧️</span> {char.sex}
                            <span>🎂</span> {char.age}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <hr className="my-2" />
                </section>
                {/* Langues (Étape 4) */}
                <section>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>🌐</span> {t.bookLanguagesTitle}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {bookLanguages.map(lang => (
                      <span key={lang} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium shadow">{lang}</span>
                    ))}
                  </div>
                </section>
                {/* Valeurs éducatives (Étape 4) */}
                <section>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>🎯</span> {t.valuesTitle}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedValues.map(id => {
                      const value = availableValues.find(v => v.id === id);
                      return value ? (
                        <span key={id} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow">
                          {(value as any)[`name_${lang}`] || (value as any).name_fr}
                        </span>
                      ) : null;
                    })}
                  </div>
                </section>
                {/* Livraison */}
                <section>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                    <span>🚚</span> {t.deliveryField}
                  </h4>
                  <div className="text-gray-700 dark:text-gray-300">{deliveryAddress}, {city}, {country}</div>
                </section>
                {/* Message spécial */}
                {messageSpecial && (
                  <section>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-2">
                      <span>💌</span> {t.messageField}
                    </h4>
                    <div className="bg-orange-50 text-orange-800 p-3 rounded shadow">{messageSpecial}</div>
                  </section>
                )}
              </div>
            </section>
            <div className="flex justify-between mt-8">
              <button type="button" onClick={() => goToStep(step - 1)} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg">{t.prev}</button>
              <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white font-bold py-2 px-8 rounded-full disabled:bg-gray-400">{isSubmitting ? t.addingToCart : t.addCart}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 