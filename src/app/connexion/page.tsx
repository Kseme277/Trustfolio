'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Mail, Chrome } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'code' | 'confirm'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Format camerounais: 09 + 8 chiffres OU 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres
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

  const validateCameroonPhone = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\s/g, '');
    
    // Formats camerounais: 09 + 8 chiffres OU 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres
    const cameroonPattern = /^(09\d{8}|[6-9]\d{8}|[2-5]\d{8})$/;
    
    if (!cameroonPattern.test(cleaned)) {
      return false;
    }
    
    return true;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.replace(/\s/g, '').length < 9) {
      toast.error(t.loginPhoneInvalid || 'Veuillez entrer un numéro de téléphone valide (9 chiffres)');
      return;
    }

    // Validation spécifique pour le Cameroun
    if (!validateCameroonPhone(phoneNumber)) {
      toast.error(t.loginPhoneInvalidFormat || 'Format de numéro invalide. Utilisez un format camerounais (09, 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ''),
          action: 'send-code'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsCodeSent(true);
        setStep('code');
        toast.success(t.loginCodeSent || 'Code envoyé sur WhatsApp !');
      } else {
        toast.error(data.error || t.loginCodeError || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      toast.error(t.loginCodeError || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error(t.loginCodeInvalid || 'Veuillez entrer le code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\s/g, ''),
          action: 'verify-code',
          code: code
        })
      });

      const data = await response.json();
      console.log('LoginPage - API response:', data);
      
      if (response.ok) {
        if (data.newUser) {
          // Nouvel utilisateur - rediriger vers l'inscription avec le numéro de téléphone
          toast.info(t.loginNewUserRedirect || 'Compte non trouvé. Redirection vers l\'inscription...');
          router.push(`/inscription?phone=${phoneNumber.replace(/\s/g, '')}`);
        } else {
          // Utilisateur existant - connexion réussie
          toast.success(t.loginSuccess || 'Connexion réussie !');
          console.log('LoginPage - User data to store:', data.user);
          
          // Sauvegarder les informations de l'utilisateur dans le localStorage
          if (data.user) {
            localStorage.setItem('phoneAuth', JSON.stringify(data.user));
            window.dispatchEvent(new Event('phone-auth-updated'));
            // Récupération robuste du bookId
            let bookId = '1';
            if (typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              bookId = params.get('bookId') || localStorage.getItem('selectedBookId') || '1';
            }
            setStep('confirm');
            return;
          }
          
          // Rediriger vers la page d'accueil
          router.push('/');
        }
      } else {
        toast.error(data.error || t.loginCodeIncorrect || 'Code incorrect');
      }
    } catch (error) {
      toast.error(t.loginCodeError || 'Erreur lors de la vérification du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <img 
          src="/logo_jpg.jpg" 
          alt="Logo TrustFolio" 
          className="absolute top-0 left-0 w-80 h-80 rounded-full object-contain mt-4 ml-4"
        />
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
          {/* Logo TrustFolio au-dessus du texte principal */}
          <div className="flex justify-start mb-2">
            <img 
              src="/logo_jpg.jpg" 
              alt="Logo TrustFolio" 
              className="w-80 h-80 rounded-full object-contain"
            />
          </div>
          {/* Texte principal */}
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t.loginBooksSubtitle || 'Livres personnalisés pour enfants'}
          </p>

          {/* Carte principale */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-orange-200 dark:border-orange-800">
            
            {/* Étape 1: Numéro de téléphone */}
            {step === 'phone' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.login}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.loginPhoneSubtitle || 'Entrez votre numéro de téléphone pour continuer'}
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t.loginPhoneLabel || 'Numéro de téléphone'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder={Array.isArray(t.loginPhonePlaceholder) ? t.loginPhonePlaceholder[0] : t.loginPhonePlaceholder || 'Ex: 09 12 34 56 78 ou 6 12 34 56 78'}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t.loginPhoneFormat || 'Format camerounais: 09, 6, 2, 3, 4, 5, 7, 8, 9 + 8 chiffres'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber || phoneNumber.replace(/\s/g, '').length < 9}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t.loginPhoneSending || 'Envoi en cours...'}
                      </div>
                    ) : (
                      t.loginPhoneContinue || 'Continuer'
                    )}
                    </button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.loginFirstTime || "C'est votre première fois ici ?"}{' '}
                    <Link href="/inscription" className="text-orange-500 hover:text-orange-600 font-medium">
                      {t.loginCreateAccount || 'Créer un compte'}
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Étape 2: Code de vérification */}
            {step === 'code' && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <button
                    onClick={() => setStep('phone')}
                    className="text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">{t.loginBack || 'Retour'}</span>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.loginCheckInbox || 'Consulter votre boîte de réception'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t.loginEnterCodeSubtitle || 'Saisissez le code de sécurité à 6 chiffres que nous vous avons envoyé sur WhatsApp'}
                  </p>
                </div>

                <form onSubmit={handleCodeSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t.loginCodeLabel || 'Code de sécurité'}
                    </label>
                    <div className="flex justify-center space-x-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={code[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newCode = code.split('');
                            newCode[index] = value;
                            setCode(newCode.join(''));
                            
                            // Passer au champ suivant si une valeur est entrée
                            if (value && index < 5) {
                              const inputs = (e.target as HTMLInputElement).parentElement?.querySelectorAll('input');
                              if (inputs && inputs[index + 1]) {
                                (inputs[index + 1] as HTMLInputElement).focus();
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Permettre la navigation avec les flèches
                            if (e.key === 'ArrowLeft' && index > 0) {
                              const inputs = (e.target as HTMLInputElement).parentElement?.querySelectorAll('input');
                              if (inputs && inputs[index - 1]) {
                                (inputs[index - 1] as HTMLInputElement).focus();
                              }
                            } else if (e.key === 'ArrowRight' && index < 5) {
                              const inputs = (e.target as HTMLInputElement).parentElement?.querySelectorAll('input');
                              if (inputs && inputs[index + 1]) {
                                (inputs[index + 1] as HTMLInputElement).focus();
                              }
                            } else if (e.key === 'Backspace' && !code[index] && index > 0) {
                              // Revenir au champ précédent si on efface un champ vide
                              const inputs = (e.target as HTMLInputElement).parentElement?.querySelectorAll('input');
                              if (inputs && inputs[index - 1]) {
                                (inputs[index - 1] as HTMLInputElement).focus();
                              }
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedData = e.clipboardData.getData('text').slice(0, 6);
                            if (/^\d{1,6}$/.test(pastedData)) {
                              setCode(pastedData.padEnd(6, ''));
                              // Focus sur le dernier champ rempli
                              const inputs = (e.target as HTMLInputElement).parentElement?.querySelectorAll('input');
                              if (inputs && inputs[pastedData.length]) {
                                (inputs[pastedData.length] as HTMLInputElement).focus();
                              }
                            }
                          }}
                          className="w-12 h-12 text-center text-xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {t.loginRememberDevice || "Se souvenir de l'appareil"}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-gray-700 dark:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
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
                      setStep('phone');
                      setCode('');
                    }}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    {t.loginResendCode || 'Renvoyer le code'}
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation du compte */}
            {step === 'confirm' && (
              <div className="space-y-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.loginConfirmTitle || 'Confirmer votre numéro'}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-4">{phoneNumber}</p>
                <div className="flex flex-col gap-4">
                  <button
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => {
                      let bookId = '1';
                      if (typeof window !== 'undefined') {
                        const params = new URLSearchParams(window.location.search);
                        bookId = params.get('bookId') || localStorage.getItem('selectedBookId') || '1';
                      }
                      router.push(`/personaliser/${bookId}?step=2`);
                    }}
                  >
                    {t.loginContinueWithNumber || 'Continuer avec ce numéro'}
                  </button>
                  <button
                    className="w-full bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={() => {
                      setStep('phone');
                      setPhoneNumber('');
                      setCode('');
                    }}
                  >
                    {t.loginChangeNumber || 'Changer de compte'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Méthodes alternatives */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t.loginOtherMethods || 'Autres méthodes de connexion'}</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 flex items-center gap-2">
                <Mail size={16} />
                <span className="text-sm">{t.loginWithEmail || 'Email'}</span>
              </button>
              <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 flex items-center gap-2">
                <Chrome size={16} />
                <span className="text-sm">{t.loginWithGoogle || 'Google'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}