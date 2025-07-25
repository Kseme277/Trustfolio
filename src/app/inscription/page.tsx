'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Mail, Chrome, Facebook } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function RegisterPage() {
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    country: 'Cameroun',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pré-remplissage depuis query params ou localStorage (à compléter selon logique projet)
  useEffect(() => {
    const phoneFromUrl = searchParams.get('phone');
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';
    const address = searchParams.get('address') || '';
    const city = searchParams.get('city') || '';
    const country = searchParams.get('country') || 'Cameroun';

    // Pré-remplissage depuis localStorage (registerPrefill)
    if (typeof window !== 'undefined') {
      const prefill = localStorage.getItem('registerPrefill');
      if (prefill) {
        try {
          const data = JSON.parse(prefill);
          setFormData(prev => ({
            ...prev,
            phoneNumber: data.userPhoneNumber ? formatPhoneNumber(data.userPhoneNumber) : (phoneFromUrl ? formatPhoneNumber(phoneFromUrl) : prev.phoneNumber),
            address: data.deliveryAddress || address,
            city: data.city || city,
            country: data.country || country,
          }));
        } catch {}
      } else {
        setFormData(prev => ({
          ...prev,
          phoneNumber: phoneFromUrl ? formatPhoneNumber(phoneFromUrl) : prev.phoneNumber,
          address,
          city,
          country,
        }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    } else {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 9)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formatted
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error(t.registerFormNameError || 'Veuillez remplir votre nom et prénom');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      toast.error(t.registerFormEmailError || 'Veuillez entrer une adresse email valide');
      return false;
    }
    if (!formData.phoneNumber || formData.phoneNumber.replace(/\s/g, '').length < 9) {
      toast.error(t.registerFormPhoneError || 'Veuillez entrer un numéro de téléphone valide (9 chiffres)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
          address: formData.address,
          city: formData.city,
          country: formData.country,
        })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        // Stocker l'utilisateur dans localStorage pour auto-login (phoneAuth)
        localStorage.setItem('phoneAuth', JSON.stringify({
          id: data.user.id,
          phoneNumber: data.user.phoneNumber,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        }));
        setCreatedUser(data.user);
        setShowModal(true);
      } else {
        toast.error(data.error || t.registerFormError || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      toast.error(t.registerFormError || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Sélecteur de langue */}
        <div className="flex justify-end mb-4">
          <select value={lang} onChange={e => setLang(e.target.value as any)} className="border rounded p-2">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        {/* Logo TrustFolio */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo_jpg.jpg" 
            alt="Logo TrustFolio" 
            className="w-80 h-80 rounded-full object-contain"
          />
        </div>
        {/* Texte principal */}
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {t.customBooks}
        </p>

        {/* Carte principale */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-orange-200 dark:border-orange-800">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t.register}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t.registerFormSubtitle || 'Remplissez vos informations pour créer votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.registerFormFirstName || 'Prénom'} *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={Array.isArray(t.registerFormFirstNamePlaceholder) ? t.registerFormFirstNamePlaceholder[0] : t.registerFormFirstNamePlaceholder || 'Votre prénom'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.registerFormLastName || 'Nom'} *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={Array.isArray(t.registerFormLastNamePlaceholder) ? t.registerFormLastNamePlaceholder[0] : t.registerFormLastNamePlaceholder || 'Votre nom'}
                  required
                />
              </div>
            </div>

            {/* Email (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.registerFormEmail || 'Adresse email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={Array.isArray(t.registerFormEmailPlaceholder) ? t.registerFormEmailPlaceholder[0] : t.registerFormEmailPlaceholder || 'votre@email.com'}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.registerFormPhone || 'Numéro de téléphone'} *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={Array.isArray(t.registerFormPhonePlaceholder) ? t.registerFormPhonePlaceholder[0] : t.registerFormPhonePlaceholder || '09 12 34 56 78 ou 6 12 34 56 78'}
                required
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.registerFormAddress || 'Adresse'}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={Array.isArray(t.registerFormAddressPlaceholder) ? t.registerFormAddressPlaceholder[0] : t.registerFormAddressPlaceholder || 'Votre adresse'}
              />
            </div>

            {/* Ville et Pays */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.registerFormCity || 'Ville'}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={Array.isArray(t.registerFormCityPlaceholder) ? t.registerFormCityPlaceholder[0] : t.registerFormCityPlaceholder || 'Votre ville'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.registerFormCountry || 'Pays'}
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Cameroun">Cameroun</option>
                  <option value="Sénégal">Sénégal</option>
                  <option value="Mali">Mali</option>
                  <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Niger">Niger</option>
                  <option value="Togo">Togo</option>
                  <option value="Bénin">Bénin</option>
                  <option value="Guinée">Guinée</option>
                  <option value="Guinée-Bissau">Guinée-Bissau</option>
                  <option value="Cap-Vert">Cap-Vert</option>
                  <option value="Mauritanie">Mauritanie</option>
                  <option value="Gambie">Gambie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t.registerFormLoading || 'Création en cours...'}
                </div>
              ) : (
                t.registerFormSubmit || 'Créer mon compte'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t.registerFormAlreadyAccount || 'Vous avez déjà un compte ?'}{' '}
              <Link href="/connexion" className="text-orange-500 hover:text-orange-600 font-medium">
                {t.login}
              </Link>
            </p>
          </div>
        </div>

        {/* Méthodes alternatives */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t.registerFormOtherMethods || 'Autres méthodes d\'inscription'}</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 flex items-center gap-2">
              <Chrome size={16} />
              <span className="text-sm">Google</span>
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 flex items-center gap-2">
              <Facebook size={16} />
              <span className="text-sm">Facebook</span>
            </button>
          </div>
        </div>

        {/* Modal de confirmation après inscription */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold mb-4 text-orange-500">{t.registerFormSuccessTitle || 'Compte créé !'}</h2>
              <p className="mb-6 text-gray-700 dark:text-gray-200">{t.registerFormSuccessMessage || 'Votre compte a bien été créé et vous êtes maintenant connecté.'}</p>
              <button
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  let bookId = searchParams.get('bookId') || (typeof window !== 'undefined' ? localStorage.getItem('selectedBookId') : null) || '1';
                  router.push(`/personaliser/${bookId}?step=2`);
                }}
              >
                {t.registerFormGoToAccount || 'Accéder à mon compte'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}