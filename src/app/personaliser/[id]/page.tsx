// Fichier : src/app/personaliser/[id]/page.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';
import { useSession } from 'next-auth/react';

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

// --- Le Composant Principal ---
export default function PersonalizePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  
  // --- États du Composant ---
  const [book, setBook] = useState<Book | null>(null);
  const [availableValues, setAvailableValues] = useState<Value[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- États du Formulaire ---
  const [step, setStep] = useState(1); 
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

  const handleNext = () => goToStep(step + 1);
  const handlePrev = () => goToStep(step - 1);

  // --- Rendu du Composant ---
  if (isLoading) return <div className="text-center p-10 text-xl text-gray-700 dark:text-gray-300">Chargement du livre...</div>;
  if (!book) return <div className="text-center p-10 text-xl text-red-500">Livre introuvable.</div>;

  const totalSteps = 5; 
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">Personnalisez "{book.title}"</h1>
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
        <form onSubmit={handleSubmit}>
          
          {/* ÉTAPE 1: Informations de l'utilisateur et livraison */}
          {step === 1 && (
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 1: Vos informations</h2>
              <div>
                <label htmlFor="userFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Nom Complet</label>
                <input type="text" id="userFullName" value={userFullName} onChange={(e) => setUserFullName(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: Jean Dupont" />
              </div>
              <div>
                <label htmlFor="userPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Numéro de Téléphone (CM)</label>
                <input type="tel" id="userPhoneNumber" value={userPhoneNumber} onChange={(e) => setUserPhoneNumber(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: 09XX XXX XXX ou 6XX XXX XXX" pattern="^(09|6)\d{8}$" title="Numéro de téléphone camerounais (09XX XXX XXX ou 6XX XXX XXX)" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold mt-6">Adresse de livraison :</p>
              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse complète</label>
                <input type="text" id="deliveryAddress" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: 123 Rue de la Joie, Quartier Nlongkak" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
                  <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: Yaoundé" />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code Postal (Optionnel)</label>
                  <input type="text" id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: 12345" />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pays</label>
                <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: Cameroun" />
              </div>
            </section>
          )}

          {/* ÉTAPE 2: Informations du héros */}
          {step === 2 && (
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Étape 2: Informations du héros</h2>
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom du héros (votre enfant)</label>
                <input type="text" id="childName" value={childName} onChange={(e) => setChildName(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: Amina, Kwadjeu..." />
              </div>
              <div>
                <label htmlFor="heroAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Âge de l'enfant (ans)</label>
                <input 
                  type="number" 
                  id="heroAge" 
                  value={heroAge} 
                  onChange={(e) => setHeroAge(Number(e.target.value))} 
                  required 
                  min="0"
                  max="12"
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" 
                  placeholder="Ex: 7" 
                />
                {heroAge !== '' && (heroAge < 0 || heroAge > 12) && (
                  <p className="text-xs text-red-500 mt-1">L'âge doit être compris entre 0 et 12 ans.</p>
                )}
              </div>
              <div>
                <label htmlFor="mainTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thème principal</label>
                <select id="mainTheme" value={mainTheme} onChange={(e) => setMainTheme(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                  <option value="">Sélectionner</option>
                  <option value="Aventure et exploration">Aventure et exploration</option>
                  <option value="Héros du quotidien et résilience">Héros du quotidien et résilience</option>
                  <option value="Contes traditionnels et sagesse africaine">Contes traditionnels et sagesse africaine</option>
                  <option value="Découverte culturelle et identité">Découverte culturelle et identité</option>
                  <option value="Amitié et solidarité">Amitié et solidarité</option>
                  <option value="Nature et environnement">Nature et environnement</option>
                </select>
              </div>
              <div>
                <label htmlFor="storyLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lieu de l'histoire</label>
                <input type="text" id="storyLocation" value={storyLocation} onChange={(e) => setStoryLocation(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" placeholder="Ex: Yaoundé, Mont Cameroun, Forêt tropicale" />
              </div>
              <div>
                <label htmlFor="residentialArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone de résidence</label>
                <select id="residentialArea" value={residentialArea} onChange={(e) => setResidentialArea(e.target.value)} required className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                  <option value="">Sélectionner</option>
                  <option value="Urbaine (ville)">Urbaine (ville)</option>
                  <option value="Rurale (village)">Rurale (village)</option>
                  <option value="Cotière (bord de mer)">Cotière (bord de mer)</option>
                  <option value="Montagneuse (plateau)">Montagneuse (plateau)</option>
                </select>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo du héros (Optionnel)</p>
              <input type="file" ref={childFileInputRef} onChange={(e) => setChildFileToUpload(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
              <button type="button" onClick={() => childFileInputRef.current?.click()} className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                {childFileToUpload ? `Fichier : ${childFileToUpload.name}` : "Cliquez pour choisir une photo"}
              </button>
              <button type="button" onClick={handleChildPhotoUpload} disabled={!childFileToUpload || isChildPhotoUploading} className="mt-4 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 w-full">
                {isChildPhotoUploading ? "Envoi en cours..." : "Téléverser la photo"}
              </button>
              {childPhotoUrl && (
                <div className="mt-6 text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Aperçu :</p>
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
            {step < totalSteps ? (
              <button type="button" onClick={handleNext} disabled={isNextDisabled} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                Suivant
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                {isSubmitting ? 'Ajout au panier...' : 'Ajouter au Panier'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}; 