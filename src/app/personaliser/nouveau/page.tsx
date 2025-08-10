'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
import { Plus, BookOpen, Users, MapPin, Palette, MessageSquare, User, Package, Languages, Heart } from 'lucide-react';
import Image from 'next/image';

export default function NouveauLivrePage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const router = useRouter();

  // États pour toutes les données du formulaire (identiques au formulaire de personnalisation)
  const [formData, setFormData] = useState({
    // Étape 1: Contact & Livraison
    userFullName: '',
    userPhoneNumber: '',
    deliveryAddress: '',
    city: '',
    postalCode: '',
    country: '',

    // Étape 2: Héros
    childName: '',
    heroAge: '',
    mainTheme: '',
    storyLocation: '',
    storyArea: '',
    childPhotoUrl: '',

    // Étape 3: Pack et Personnages
    packType: 'Basique',
    characters: [] as any[],

    // Étape 4: Langues et Valeurs
    bookLanguages: ['fr'],
    selectedValues: [] as string[],

    // Étape 5: Message Spécial
    messageSpecial: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // États pour l'upload de photos
  const [childFileToUpload, setChildFileToUpload] = useState<File | null>(null);
  const [isChildPhotoUploading, setIsChildPhotoUploading] = useState(false);
  const childFileInputRef = useRef<HTMLInputElement>(null);

  // États pour l'authentification (identiques au formulaire de personnalisation)
  const [step1Status, setStep1Status] = useState<'form' | 'confirm' | 'code'>('form');
  const [step1UserExists, setStep1UserExists] = useState(false);
  const [step1IsLoading, setStep1IsLoading] = useState(false);
  const [step1Error, setStep1Error] = useState('');
  const [step1Code, setStep1Code] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Récupérer le userId depuis le localStorage (auth téléphone)
    let userId = null;
    if (typeof window !== 'undefined') {
      const phoneAuth = localStorage.getItem('phoneAuth');
      if (phoneAuth) {
        try {
          const userData = JSON.parse(phoneAuth);
          userId = userData.id;
        } catch (e) {
          console.error('Erreur parsing phoneAuth:', e);
        }
      }
    }

    // Préparer les données complètes pour la création du livre
    const orderData = {
      // Informations utilisateur & livraison (Étape 1)
      userFullName: formData.userFullName,
      userPhoneNumber: formData.userPhoneNumber,
      deliveryAddress: formData.deliveryAddress,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,

      // Informations du héros (Étape 2)
      childName: formData.childName,
      heroAgeRange: formData.heroAge === '' ? null : String(formData.heroAge),
      mainTheme: formData.mainTheme,
      storyLocation: formData.storyLocation,
      storyArea: formData.storyArea,
      childPhotoUrl: formData.childPhotoUrl || '',

      // Pack et Personnages (Étape 3)
      packType: formData.packType,
      characters: formData.characters,

      // Langues et Valeurs (Étape 4)
      bookLanguages: formData.bookLanguages,
      valueIds: formData.selectedValues,

      // Message spécial (Étape 5)
      messageSpecial: formData.messageSpecial,

      // Marquer comme livre personnalisé créé à partir de rien
      isCustomCreation: true,

      // ID utilisateur si disponible
      ...(userId ? { userId } : {}),
    };

    // TODO: Implémenter l'API pour créer un livre personnalisé
    console.log('Données du nouveau livre:', orderData);

    // Pour l'instant, rediriger vers la page d'accueil avec un message de succès
    // TODO: Remplacer par la vraie logique de création
    alert('Livre personnalisé créé avec succès ! (Fonctionnalité en développement)');
    router.push('/');
  };

  // Fonction pour gérer l'upload de photo du héros
  const handleChildPhotoUpload = async () => {
    if (!childFileToUpload) return;

    setIsChildPhotoUploading(true);
    try {
      // TODO: Implémenter l'upload réel
      // Pour l'instant, on simule avec une URL temporaire
      const mockUrl = URL.createObjectURL(childFileToUpload);
      handleInputChange('childPhotoUrl', mockUrl);
    } catch (error) {
      console.error('Erreur upload photo:', error);
    } finally {
      setIsChildPhotoUploading(false);
    }
  };

  // Fonctions d'authentification (identiques au formulaire de personnalisation)
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      // Vérifier l'existence du compte
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.userPhoneNumber, action: 'check-user' })
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

  const sendStep1Code = async () => {
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.userPhoneNumber, action: 'send-code' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur envoi code');
    } catch (err) {
      setStep1Error('Erreur lors de l\'envoi du code.');
    } finally {
      setStep1IsLoading(false);
    }
  };

  const handleStep1CodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1IsLoading(true);
    setStep1Error('');
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.userPhoneNumber, code: step1Code, action: 'verify-code' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Code incorrect');

      if (step1UserExists) {
        // Compte existant: passer à l'étape 2
        setCurrentStep(2);
      } else {
        // Création automatique du compte
        try {
          const resRegister = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: formData.userFullName.split(' ')[0] || '',
              lastName: formData.userFullName.split(' ').slice(1).join(' ') || '',
              email: '',
              phoneNumber: formData.userPhoneNumber.replace(/\s/g, ''),
              address: formData.deliveryAddress,
              city: formData.city,
              country: formData.country
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
          setCurrentStep(2);
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

  // Validation des étapes
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Contact & Livraison
        // Pour l'étape 1, on valide seulement si on est dans le formulaire initial
        if (step1Status === 'form') {
          return formData.userFullName && formData.userPhoneNumber && formData.deliveryAddress && formData.city && formData.country;
        }
        // Si on est dans confirm ou code, on considère que l'étape est en cours
        return false;
      case 2: // Héros
        return formData.childName && formData.heroAge && formData.mainTheme && formData.storyLocation && formData.storyArea;
      case 3: // Pack et Personnages
        return formData.packType;
      case 4: // Langues et Valeurs
        return formData.bookLanguages.length > 0;
      case 5: // Message Spécial
        return true; // Optionnel
      case 6: // Récapitulatif
        return true;
      default:
        return false;
    }
  };

  // ÉTAPE 1: Contact & Livraison avec authentification
  const renderStep1 = () => {
    if (step1Status === 'form') {
      return (
        <form onSubmit={handleStep1Submit}>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User size={48} className="text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t.contact || 'Vos informations'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Informations de contact et de livraison
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="userFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.fullName || 'Nom complet'} *
                </label>
                <input
                  type="text"
                  id="userFullName"
                  value={formData.userFullName}
                  onChange={(e) => handleInputChange('userFullName', e.target.value)}
                  required
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                  placeholder={t.fullNamePlaceholder || 'Votre nom complet'}
                />
              </div>

              <div>
                <label htmlFor="userPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.phone || 'Téléphone'} *
                </label>
                <input
                  type="tel"
                  id="userPhoneNumber"
                  value={formData.userPhoneNumber}
                  onChange={(e) => handleInputChange('userPhoneNumber', e.target.value)}
                  required
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                  placeholder={t.phonePlaceholder || 'Votre numéro de téléphone'}
                  pattern="^(09|6)\d{8}$"
                  title={t.phoneTitle || 'Format: 09XXXXXXXX ou 6XXXXXXXX'}
                />
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.address || 'Adresse'} *
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  required
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                  placeholder={t.addressPlaceholder || 'Votre adresse de livraison'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.city || 'Ville'} *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                    placeholder={t.cityPlaceholder || 'Votre ville'}
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.postal || 'Code postal'}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                    placeholder={t.postalPlaceholder || 'Code postal'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.country || 'Pays'} *
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
                  placeholder={t.countryPlaceholder || 'Votre pays'}
                />
              </div>
            </div>

            {step1Error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{step1Error}</p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={step1IsLoading || !isStepValid()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step1IsLoading ? 'Vérification...' : (t.next || 'Suivant')}
              </button>
            </div>
          </div>
        </form>
      );
    }

    if (step1Status === 'confirm') {
      return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-16 h-16 text-orange-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirmer votre numéro</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{formData.userPhoneNumber}</p>
          </div>
          <div className="flex flex-col gap-4 w-full mt-4">
            <button
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-orange-600 transition-colors"
              onClick={async () => {
                await sendStep1Code();
                setStep1Status('code');
              }}
              disabled={step1IsLoading}
            >
              {step1IsLoading ? 'Envoi...' : 'Oui, envoyer le code'}
            </button>
            <button
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              onClick={() => setStep1Status('form')}
            >
              Non, modifier
            </button>
          </div>
          {step1Error && (
            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{step1Error}</p>
            </div>
          )}
        </div>
      );
    }

    if (step1Status === 'code') {
      return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-16 h-16 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code de vérification</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Entrez le code reçu par SMS au <span className="font-semibold">{formData.userPhoneNumber}</span>
            </p>
          </div>
          <form onSubmit={handleStep1CodeSubmit} className="w-full">
            <div className="mb-4">
              <input
                type="text"
                value={step1Code}
                onChange={(e) => setStep1Code(e.target.value)}
                placeholder="Code à 6 chiffres"
                className="w-full p-4 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                maxLength={6}
                required
              />
            </div>
            {step1Error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{step1Error}</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={step1IsLoading || step1Code.length !== 6}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-bold text-lg shadow hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step1IsLoading ? 'Vérification...' : 'Vérifier le code'}
              </button>
              <button
                type="button"
                onClick={sendStep1Code}
                disabled={step1IsLoading}
                className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                {step1IsLoading ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return null;
  };

  // ÉTAPE 2: Héros
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BookOpen size={48} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.hero || 'Le héros de l\'histoire'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Définissez le personnage principal de votre livre
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.heroName || 'Nom du héros'} *
          </label>
          <input
            type="text"
            id="childName"
            value={formData.childName}
            onChange={(e) => handleInputChange('childName', e.target.value)}
            required
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
            placeholder={t.heroNamePlaceholder || 'Le nom du personnage principal'}
          />
        </div>

        <div>
          <label htmlFor="heroAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.heroAge || 'Âge du héros'} *
          </label>
          <input
            type="number"
            id="heroAge"
            value={formData.heroAge}
            onChange={(e) => handleInputChange('heroAge', e.target.value)}
            required
            min="0"
            max="12"
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
            placeholder={t.heroAgePlaceholder || 'Âge entre 0 et 12 ans'}
          />
        </div>

        <div>
          <label htmlFor="mainTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.mainTheme || 'Thème principal'} *
          </label>
          <select
            id="mainTheme"
            value={formData.mainTheme}
            onChange={(e) => handleInputChange('mainTheme', e.target.value)}
            required
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
          >
            <option value="">{t.mainThemeSelect || 'Sélectionnez un thème'}</option>
            <option value="Aventure">Aventure</option>
            <option value="Amitié">Amitié</option>
            <option value="Courage">Courage</option>
            <option value="Découverte">Découverte</option>
            <option value="Famille">Famille</option>
            <option value="Nature">Nature</option>
          </select>
        </div>

        <div>
          <label htmlFor="storyLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.storyLocation || 'Lieu de l\'histoire'} *
          </label>
          <input
            type="text"
            id="storyLocation"
            value={formData.storyLocation}
            onChange={(e) => handleInputChange('storyLocation', e.target.value)}
            required
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
            placeholder={t.storyLocationPlaceholder || 'Où se déroule l\'histoire ?'}
          />
        </div>

        <div>
          <label htmlFor="storyArea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.storyArea || 'Zone de l\'histoire'} *
          </label>
          <select
            id="storyArea"
            value={formData.storyArea}
            onChange={(e) => handleInputChange('storyArea', e.target.value)}
            required
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
          >
            <option value="">{t.storyAreaSelect || 'Sélectionnez une zone'}</option>
            <option value="Ville">Ville</option>
            <option value="Campagne">Campagne</option>
            <option value="Forêt">Forêt</option>
            <option value="Mer/Océan">Mer/Océan</option>
            <option value="Montagne">Montagne</option>
            <option value="Espace">Espace</option>
            <option value="Monde imaginaire">Monde imaginaire</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.heroPhoto || 'Photo du héros'}
          </p>
          <input
            type="file"
            ref={childFileInputRef}
            onChange={(e) => setChildFileToUpload(e.target.files?.[0] || null)}
            className="hidden"
            accept="image/*"
          />
          <button
            type="button"
            onClick={() => childFileInputRef.current?.click()}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {childFileToUpload ? `Fichier : ${childFileToUpload.name}` : (t.heroPhotoChoose || 'Choisir une photo')}
          </button>
          {childFileToUpload && (
            <button
              type="button"
              onClick={handleChildPhotoUpload}
              disabled={isChildPhotoUploading}
              className="mt-4 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 w-full"
            >
              {isChildPhotoUploading ? (t.heroPhotoUploading || 'Upload en cours...') : (t.heroPhotoUpload || 'Uploader la photo')}
            </button>
          )}
          {formData.childPhotoUrl && (
            <div className="mt-6 text-center">
              <p className="font-semibold text-gray-900 dark:text-white">
                {t.heroPhotoPreview || 'Aperçu de la photo'}
              </p>
              <Image
                src={formData.childPhotoUrl}
                alt="Aperçu photo héros"
                width={150}
                height={150}
                className="rounded-md mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ÉTAPE 3: Pack et Personnages
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Package size={48} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Pack et Personnages
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choisissez votre pack et définissez les personnages secondaires
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.packTitle || 'Choix du Pack'} *
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="pack"
                value="Basique"
                checked={formData.packType === 'Basique'}
                onChange={(e) => handleInputChange('packType', e.target.value)}
                className="form-radio text-orange-500"
              />
              <span className="text-gray-800 dark:text-gray-200">Pack Basique - 1 langue, 3 personnages</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="pack"
                value="Standard"
                checked={formData.packType === 'Standard'}
                onChange={(e) => handleInputChange('packType', e.target.value)}
                className="form-radio text-orange-500"
              />
              <span className="text-gray-800 dark:text-gray-200">Pack Standard - 2 langues, 5 personnages</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="pack"
                value="Prestige"
                checked={formData.packType === 'Prestige'}
                onChange={(e) => handleInputChange('packType', e.target.value)}
                className="form-radio text-orange-500"
              />
              <span className="text-gray-800 dark:text-gray-200">Pack Prestige - 3 langues, 7 personnages</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personnages secondaires
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Les personnages secondaires seront générés automatiquement selon votre pack choisi.
            Vous pourrez les personnaliser davantage lors de la finalisation.
          </p>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            📝 Cette fonctionnalité sera disponible dans la version finale
          </div>
        </div>
      </div>
    </div>
  );

  // ÉTAPE 4: Langues et Valeurs
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Languages size={48} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.bookLanguagesTitle || 'Langues et Valeurs'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choisissez les langues du livre et les valeurs à transmettre
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.bookLanguagesOptions || 'Langues du livre'} ({formData.bookLanguages.length}/3) :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { code: 'fr', name: 'Français' },
              { code: 'en', name: 'English' },
              { code: 'de', name: 'Deutsch' },
              { code: 'es', name: 'Español' },
              { code: 'ar', name: 'العربية' }
            ].map((lang) => (
              <label key={lang.code} className="flex items-center space-x-2 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bookLanguages.includes(lang.code)}
                  onChange={(e) => {
                    const newLanguages = e.target.checked
                      ? [...formData.bookLanguages, lang.code]
                      : formData.bookLanguages.filter(l => l !== lang.code);
                    handleInputChange('bookLanguages', newLanguages);
                  }}
                  disabled={!formData.bookLanguages.includes(lang.code) && formData.bookLanguages.length >= 3}
                  className="form-checkbox text-orange-500"
                />
                <span>{lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.valuesTitle || 'Valeurs à transmettre'} (optionnel)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Respect', 'Partage', 'Courage', 'Honnêteté', 'Persévérance',
              'Empathie', 'Responsabilité', 'Tolérance', 'Générosité'
            ].map((value) => (
              <label key={value} className="flex items-center space-x-2 p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedValues.includes(value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...formData.selectedValues, value]
                      : formData.selectedValues.filter(v => v !== value);
                    handleInputChange('selectedValues', newValues);
                  }}
                  className="form-checkbox text-orange-500"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ÉTAPE 5: Message Spécial
  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MessageSquare size={48} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.messageTitle || 'Message Spécial'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ajoutez un message personnel à votre livre (optionnel)
        </p>
      </div>

      <div>
        <label htmlFor="messageSpecial" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.messageField || 'Votre message spécial'}
        </label>
        <textarea
          id="messageSpecial"
          value={formData.messageSpecial}
          onChange={(e) => handleInputChange('messageSpecial', e.target.value)}
          rows={6}
          className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500"
          placeholder={t.messagePlaceholder || 'Écrivez un message personnel qui apparaîtra dans le livre...'}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Ce message apparaîtra sur une page dédiée de votre livre personnalisé.
        </p>
      </div>
    </div>
  );

  // ÉTAPE 6: Récapitulatif
  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Palette size={48} className="text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t.recapTitle || 'Récapitulatif'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Vérifiez les informations de votre livre personnalisé
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📞 Informations de contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Nom:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.userFullName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Téléphone:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.userPhoneNumber}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Adresse:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formData.deliveryAddress}, {formData.city} {formData.postalCode}, {formData.country}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🦸 Le héros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Nom:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.childName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Âge:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.heroAge} ans</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Thème:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.mainTheme}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Lieu:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.storyLocation}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Zone:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.storyArea}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📦 Pack et Configuration
          </h3>
          <div className="text-sm space-y-2">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Pack choisi:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{formData.packType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Langues:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formData.bookLanguages.join(', ')}
              </span>
            </div>
            {formData.selectedValues.length > 0 && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Valeurs:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {formData.selectedValues.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {formData.messageSpecial && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💌 Message spécial
            </h3>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-orange-500">
              <p className="text-gray-600 dark:text-gray-300 italic">
                "{formData.messageSpecial}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Créer un livre personnalisé
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i + 1)}
                disabled={i + 1 > currentStep && !isStepValid()}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium transition-colors ${
                  i + 1 === currentStep
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : i + 1 < currentStep
                    ? 'bg-gray-300 border-gray-300 text-gray-800 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200'
                    : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center space-x-4 mb-6 text-xs">
            <span className={currentStep === 1 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Contact</span>
            <span className={currentStep === 2 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Héros</span>
            <span className={currentStep === 3 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Pack</span>
            <span className={currentStep === 4 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Langues</span>
            <span className={currentStep === 5 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Message</span>
            <span className={currentStep === 6 ? 'text-orange-500 font-medium' : 'text-gray-500'}>Aperçu</span>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-md mx-auto">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </div>

        {/* Navigation */}
        {/* Ne pas afficher la navigation normale pour l'étape 1 si on est dans le processus d'auth */}
        {!(currentStep === 1 && step1Status !== 'form') && (
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.prev || 'Précédent'}
            </button>

            {/* Pour l'étape 1, la navigation est gérée par le formulaire d'auth */}
            {currentStep === 1 ? null : (
              currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t.next || 'Suivant'}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Créer le livre
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
