// src/app/confirmation/page.tsx
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function ConfirmationPage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  return (
    <div className="container mx-auto p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-6">{t.confirmationTitle || 'Commande confirmée !'}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">{t.confirmationMessage || 'Merci pour votre commande. Vous recevrez un email de confirmation sous peu.'}</p>
      <Link href="/compte" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-orange-600 transition-all duration-300">
        {t.account}
      </Link>
    </div>
  );
}