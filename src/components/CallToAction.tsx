// src/components/CallToAction.tsx
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
export default function CallToAction() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  return (
    <section className="w-full py-16">
      <div className="container mx-auto">
        <div className="bg-orange-500 text-white p-12 rounded-2xl text-center">
          <h2 className="text-4xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">{t.ctaDescription}</p>
          <Link href="/livres" className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
            {t.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}