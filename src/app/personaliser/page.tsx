// Fichier : src/app/personaliser/page.tsx
'use client';
import BookSelectModal from '@/components/BookSelectModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function PersonaliserRootPage() {
  const [open, setOpen] = useState(true);
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 mb-8 text-center">{t.customizeBook || 'Personnaliser un livre'}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">Choisissez le livre que vous souhaitez personnaliser parmi notre sélection.</p>
      <div className="w-full max-w-2xl">
        <BookSelectModal open={open} onClose={() => router.push('/')} />
      </div>
    </div>
  );
} 