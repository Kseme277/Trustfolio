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
    address: 'Adresse complète',
    addressPlaceholder: 'Ex: 123 Rue de la Joie, Quartier Nlongkak',
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
    residentialArea: 'Zone de résidence',
    residentialAreaSelect: 'Sélectionner',
    residentialAreaOptions: [
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
    heroName: 'Hero’s First Name (your child)',
    heroNamePlaceholder: 'e.g. Amina, Kwadjeu...',
    heroAge: "Child’s Age (years)",
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
    residentialArea: 'Residential Area',
    residentialAreaSelect: 'Select',
    residentialAreaOptions: [
      'Urban (city)',
      'Rural (village)',
      'Coastal (seaside)',
      'Mountainous (plateau)',
    ],
    heroPhoto: 'Hero’s Photo (Optional)',
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
  },
  de: {
    contact: 'Schritt 1: Ihre Informationen',
    fullName: 'Ihr vollständiger Name',
    fullNamePlaceholder: 'z.B. Max Mustermann',
    phone: 'Ihre Telefonnummer (CM)',
    phonePlaceholder: 'z.B. 09XX XXX XXX oder 6XX XXX XXX',
    phoneTitle: 'Kamerunische Telefonnummer (09XX XXX XXX oder 6XX XXX XXX)',
    address: 'Vollständige Adresse',
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
    residentialArea: 'Wohngebiet',
    residentialAreaSelect: 'Auswählen',
    residentialAreaOptions: [
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
  },
  es: {
    contact: 'Paso 1: Su información',
    fullName: 'Su nombre completo',
    fullNamePlaceholder: 'ej. Juan Pérez',
    phone: 'Su número de teléfono (CM)',
    phonePlaceholder: 'ej. 09XX XXX XXX o 6XX XXX XXX',
    phoneTitle: 'Número de teléfono camerunés (09XX XXX XXX o 6XX XXX XXX)',
    address: 'Dirección completa',
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
    residentialArea: 'Zona de residencia',
    residentialAreaSelect: 'Seleccionar',
    residentialAreaOptions: [
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
  },
  ar: {
    contact: 'الخطوة 1: معلوماتك',
    fullName: 'اسمك الكامل',
    fullNamePlaceholder: 'مثال: أحمد محمد',
    phone: 'رقم هاتفك (الكاميرون)',
    phonePlaceholder: 'مثال: 09XX XXX XXX أو 6XX XXX XXX',
    phoneTitle: 'رقم هاتف كاميروني (09XX XXX XXX أو 6XX XXX XXX)',
    address: 'العنوان الكامل',
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
    residentialArea: 'منطقة السكن',
    residentialAreaSelect: 'اختر',
    residentialAreaOptions: [
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
  const [residentialArea, setResidentialArea] = useState('');
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
        residentialArea,
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

  // --- LOGIQUE DE VALIDATION POUR LES BOUTONS SUIVANT/PRÉCÉDENT ---
  const isNextDisabled = (() => {
    switch (step) {
      case 1: // Vos informations (Contact & Livraison)
        return !userFullName || !userPhoneNumber || !deliveryAddress || !city || !country;
      case 2: // Informations du héros (enfant)
        return !childName || heroAge === '' || heroAge < 0 || heroAge > 12 || !mainTheme || !storyLocation || !residentialArea || isChildPhotoUploading;
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
  const sendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhoneNumber, action: 'send-code' })
      });
      const data = await response.json();
      if (response.ok) {
        setSentCode(data.code || ''); // Pour affichage test
        setIsVerifyingPhone(true);
        setCodeError('');
        setEnteredCode('');
        toast.success(t.loginCodeSent || 'Code envoyé sur WhatsApp !');
      } else {
        toast.error(data.error || t.loginCodeError || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      toast.error(t.loginCodeError || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    setIsVerifyingCode(true);
    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: userPhoneNumber, action: 'verify-code', code: enteredCode })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.newUser) {
          // Rediriger vers l'inscription avec le numéro et le bookId
          const bookId = id;
          router.push(`/inscription?phone=${userPhoneNumber.replace(/\s/g, '')}&bookId=${bookId}`);
          return;
        } else {
          // Rediriger vers la connexion avec le numéro et le bookId
          const bookId = id;
          router.push(`/connexion?phone=${userPhoneNumber.replace(/\s/g, '')}&bookId=${bookId}`);
          return;
        }
      } else {
        setCodeError(data.error || t.loginCodeIncorrect || 'Code incorrect');
      }
    } catch (error) {
      setCodeError(t.loginCodeError || 'Erreur lors de la vérification du code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      await sendVerificationCode();
      return;
    }
    goToStep(step + 1);
  };
  const handlePrev = () => goToStep(step - 1);

  // --- UI de saisie du code à 6 chiffres ---
  function PhoneCodeVerification() {
    // Ajout d'une ref pour chaque input
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    return (
      <div className="space-y-6 max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <button
            onClick={() => {
              setIsVerifyingPhone(false);
              setEnteredCode('');
              setCodeError('');
            }}
            className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="ml-2 text-gray-500 dark:text-gray-400">{t.loginBack || 'Retour'}</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.loginCheckInbox || 'Consultez votre boîte de réception'}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t.loginEnterCodeSubtitle || 'Saisissez le code de sécurité à 6 chiffres que nous vous avons envoyé sur WhatsApp'}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); verifyCode(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t.loginCodeLabel || 'Code de sécurité'}</label>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={enteredCode[index] || ''}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    let newCode = enteredCode.split('');
                    if (value.length === 1) {
                      newCode[index] = value;
                      setEnteredCode(newCode.join(''));
                      // Toujours avancer le focus à la case suivante si elle existe
                      if (index < 5) {
                        setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
                      }
                    } else if (value.length > 1) {
                      // Collage ou saisie multiple : remplir progressif
                      const chars = value.split('');
                      for (let i = 0; i < chars.length && index + i < 6; i++) {
                        newCode[index + i] = chars[i];
                      }
                      setEnteredCode(newCode.join(''));
                      // Focus sur la dernière case remplie
                      const nextIndex = Math.min(index + value.length - 1, 5);
                      setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowLeft' && index > 0) {
                      inputRefs.current[index - 1]?.focus();
                    } else if (e.key === 'ArrowRight' && index < 5) {
                      inputRefs.current[index + 1]?.focus();
                    } else if (e.key === 'Backspace') {
                      if (enteredCode[index]) {
                        let newCode = enteredCode.split('');
                        newCode[index] = '';
                        setEnteredCode(newCode.join(''));
                      } else if (index > 0) {
                        inputRefs.current[index - 1]?.focus();
                      }
                    }
                  }}
                  onPaste={e => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pastedData) {
                      let newCode = enteredCode.split('');
                      for (let i = 0; i < pastedData.length && index + i < 6; i++) {
                        newCode[index + i] = pastedData[i];
                      }
                      setEnteredCode(newCode.join(''));
                      // Focus sur la dernière case remplie
                      const nextIndex = Math.min(index + pastedData.length - 1, 5);
                      setTimeout(() => inputRefs.current[nextIndex]?.focus(), 0);
                    }
                  }}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              ))}
            </div>
          </div>
          {codeError && <div className="text-red-500 text-sm text-center">{codeError}</div>}
          <button
            type="submit"
            disabled={isVerifyingCode || enteredCode.length !== 6}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifyingCode ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t.loginCodeVerifying || 'Vérification...'}
              </div>
            ) : (
              t.loginPhoneContinue || 'Continuer'
            )}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              setIsVerifyingPhone(false);
              setEnteredCode('');
              setCodeError('');
              sendVerificationCode();
            }}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2"
          >
            {t.loginResendCode || 'Renvoyer le code'}
          </button>
        </div>
      </div>
    );
  }

  // --- Rendu du Composant ---
  if (isLoading) return <div className="text-center p-10 text-xl text-gray-700 dark:text-gray-300">Chargement du livre...</div>;
  if (!book) return <div className="text-center p-10 text-xl text-red-500">Livre introuvable.</div>;

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
        {step === 1 && !isVerifyingPhone && (
          <form onSubmit={handleSubmit}>
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
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold mt-6">{t.address} :</p>
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
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full"
              >
                {t.next}
              </button>
            </div>
          </form>
        )}
        {step === 1 && isVerifyingPhone && <PhoneCodeVerification />}
        {step === 2 && (
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
              <label htmlFor="residentialArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.residentialArea}</label>
              <select id="residentialArea" value={residentialArea} onChange={(e) => setResidentialArea(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                <option value="">{t.residentialAreaSelect}</option>
                {t.residentialAreaOptions.map((opt: string) => (
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
        )}

        {/* ÉTAPE 3: Pack et Personnages */}
        {step === 3 && (
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 3: Choix du Pack et Personnages</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choisir un Pack :</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pack" value="Basique" checked={packType === 'Basique'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                  <span className="text-gray-800 dark:text-gray-200">Pack Basique - 1 personnage ({packDetails.Basique.price} FCFA)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pack" value="Standard" checked={packType === 'Standard'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                  <span className="text-gray-800 dark:text-gray-200">Pack Standard - 2 personnages ({packDetails.Standard.price} FCFA)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="pack" value="Prestige" checked={packType === 'Prestige'} onChange={(e) => setPackType(e.target.value as any)} className="form-radio text-orange-500" />
                  <span className="text-gray-800 dark:text-gray-200">Pack Prestige - 5 personnages ({packDetails.Prestige.price} FCFA)</span>
                </label>
              </div>
            </div>

            {characters.map((char, index) => (
              <div key={char.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personnage secondaire {index + 1}</h3>
                <div>
                  <label htmlFor={`char-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du personnage</label>
                  <input type="text" id={`char-name-${index}`} value={char.name} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200" placeholder="Ex: Papa, Ami, Tigre" />
                </div>
                <div>
                  <label htmlFor={`char-relation-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation avec le héros</label>
                  <select id={`char-relation-${index}`} value={char.relationshipToHero} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, relationshipToHero: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                    <option value="">Sélectionner</option>
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Frère/Sœur">Frère/Sœur</option>
                    <option value="Ami(e)">Ami(e)</option>
                    <option value="Grand-Parent">Grand-Parent</option>
                    <option value="Oncle/Tante">Oncle/Tante</option>
                    <option value="Cousin(e)">Cousin(e)</option>
                    <option value="Enseignant(e)">Enseignant(e)</option>
                    <option value="Animal">Animal</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                {char.relationshipToHero === 'Animal' && (
                  <div>
                    <label htmlFor={`animal-type-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'animal</label>
                    <input type="text" id={`animal-type-${index}`} value={char.animalType} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, animalType: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200" placeholder="Ex: Lion, Dévoué" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sexe</label>
                  <div className="flex space-x-4">
                    <label><input type="radio" name={`char-sex-${index}`} value="Homme" checked={char.sex === 'Homme'} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, sex: e.target.value } : c))} className="form-radio text-orange-500" /> Homme</label>
                    <label><input type="radio" name={`char-sex-${index}`} value="Femme" checked={char.sex === 'Femme'} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, sex: e.target.value } : c))} className="form-radio text-orange-500" /> Femme</label>
                  </div>
                </div>
                <div>
                  <label htmlFor={`char-age-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tranche d'âge</label>
                  <select id={`char-age-${index}`} value={char.age} onChange={(e) => setCharacters(prev => prev.map((c, i) => i === index ? { ...c, age: e.target.value } : c))} required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200">
                    <option value="">Sélectionner</option>
                    <option value="Enfant (3-8 ans)">Enfant (3-8 ans)</option>
                    <option value="Adolescent (9-15 ans)">Adolescent (9-15 ans)</option>
                    <option value="Adulte (16+ ans)">Adulte (16+ ans)</option>
                    <option value="Senior (60+ ans)">Senior (60+ ans)</option>
                  </select>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo du personnage (Optionnel)</p>
                <input type="file" onChange={(e) => handleCharacterPhotoUpload(index, e)} className="hidden" id={`char-file-${index}`} accept="image/*" />
                <button type="button" onClick={() => document.getElementById(`char-file-${index}`)?.click()} className="w-full p-2 border-2 border-dashed rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {char.fileToUpload ? `Fichier : ${char.fileToUpload.name}` : "Cliquez pour choisir une photo"}
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
                  {char.isUploading ? "Envoi en cours..." : "Téléverser la photo"}
                </button>
                {char.photoUrl && (
                  <div className="mt-4 text-center">
                    <p className="font-semibold dark:text-white">Aperçu :</p>
                    <Image src={char.photoUrl} alt="Aperçu personnage" width={100} height={100} className="rounded-md mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ÉTAPE 4: Langues et Valeurs */}
        {step === 4 && (
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 4: Langues et Valeurs</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue(s) du livre ({bookLanguages.length}/{packDetails[packType].maxLanguages}) :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {packDetails[packType].languages.map((lang) => (
                  <label key={lang} className="flex items-center space-x-2 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={bookLanguages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                      disabled={bookLanguages.length >= packDetails[packType].maxLanguages && !bookLanguages.includes(lang)}
                      className="form-checkbox text-orange-500" 
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valeurs Éducatives ({selectedValues.length}/{packDetails[packType].maxValues}) :
              </label>
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
                    <span>{value.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ÉTAPE 5: Message Spécial */}
        {step === 5 && (
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 5: Message Spécial</h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-md space-y-4">
              <h3 className="text-lg font-bold text-orange-500">Récapitulatif de votre commande :</h3>
              <p><strong>Livre :</strong> {book.title}</p>
              <p><strong>Pack :</strong> {packType} ({packDetails[packType].price} FCFA)</p>
              <p><strong>Langues :</strong> {bookLanguages.join(', ')}</p>
              <p><strong>Héros :</strong> {childName} ({heroAge} ans)</p>
              {childPhotoUrl && (
                <div>
                  <p><strong>Photo du Héros :</strong></p>
                  <Image src={childPhotoUrl} alt="Photo héros" width={100} height={100} className="rounded-md" />
                </div>
              )}
              {characters.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h3 className="font-bold text-base mb-3">Personnages secondaires</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {characters.map((char, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {char.photoUrl && (
                            <div className="flex-shrink-0">
                              <Image 
                                src={char.photoUrl} 
                                alt={`Photo de ${char.name}`} 
                                width={50} 
                                height={50} 
                                className="rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm" 
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {char.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {char.relationshipToHero}
                            </p>
                            {char.age && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {char.age}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {messageSpecial && <p><strong>Message spécial :</strong> {messageSpecial}</p>}
              <p><strong>Livraison :</strong> {deliveryAddress}, {city}, {country}</p>
            </div>
            
            <textarea 
              value={messageSpecial} 
              onChange={(e) => setMessageSpecial(e.target.value)} 
              rows={5} 
              className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200" 
              placeholder="Message spécial pour le livre (optionnel)..."
            />
          </section>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button type="button" onClick={handlePrev} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg">
              Précédent
            </button>
          ) : <div />}
          {/* SUPPRESSION du bouton Suivant pour toutes les étapes */}
          {step < totalSteps ? null : (
            <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
              {isSubmitting ? 'Ajout au panier...' : 'Ajouter au Panier'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 