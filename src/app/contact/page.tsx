// Fichier : src/app/contact/page.tsx
'use client';

import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaClock, FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '@/components/LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t.contactTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="book-page-left bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">{t.contactInfoTitle}</h2>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">{t.contactAddress}</strong><br/>
                  <span className="text-gray-600 dark:text-gray-300">Yaoundé, Capitole<br/>Cameroun</span>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">{t.contactEmail}</strong><br/>
                  <a href="mailto:contact@trustfolio.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    contact@trustfolio.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">{t.contactPhone}</strong><br/>
                  <a href="tel:+237675667364" className="text-green-600 dark:text-green-400 hover:underline">
                    +237 675667364
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaClock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">{t.contactHours}</strong><br/>
                  <span className="text-gray-600 dark:text-gray-300">
                    {t.contactHoursWeek}<br/>
                    {t.contactHoursSat}<br/>
                    {t.contactHoursSun}
                  </span>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaWhatsapp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <strong className="text-gray-900 dark:text-white">{t.contactWhatsapp}</strong><br/>
                  <a href="https://wa.me/237675667364" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                    +237 675667364
                  </a>
                </div>
              </li>
            </ul>
            {/* Réseaux sociaux */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.contactFollowUs}</span>
                <div className="flex space-x-3">
                  <a href="https://facebook.com/TrustfolioAfrica" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition duration-200">
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                  <a href="https://instagram.com/TrustfolioAfrica" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white transition duration-200">
                    <FaInstagram className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/237675667364" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition duration-200">
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* Formulaire de contact */}
          <div className="book-page-right bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900 dark:text-white">{t.contactSendMessage}</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.contactFormName}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder={Array.isArray(t.contactFormNamePlaceholder) ? t.contactFormNamePlaceholder[0] : t.contactFormNamePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.contactFormEmail}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={Array.isArray(t.contactFormEmailPlaceholder) ? t.contactFormEmailPlaceholder[0] : t.contactFormEmailPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.contactFormMessage}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder={Array.isArray(t.contactFormMessagePlaceholder) ? t.contactFormMessagePlaceholder[0] : t.contactFormMessagePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-md transition duration-200"
              >
                {t.contactFormSubmit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}