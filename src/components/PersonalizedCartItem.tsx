import React from 'react';
import Image from 'next/image';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';

export default function PersonalizedCartItem({ order, onDelete }: { order: any, onDelete?: () => void }) {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-300 dark:border-orange-600 overflow-hidden flex">
      {/* Image de l'enfant ou cover */}
      <div className="w-20 h-24 flex-shrink-0 relative">
        <Image
          src={order.childPhotoUrl || order.book?.coverImage || '/placeholder-book.jpg'}
          alt={order.book?.title || t.personalizedLabel || 'Livre personnalisé'}
          fill
          className="object-cover rounded-l-xl"
        />
        <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow">{t.personalizedLabel || 'Personnalisé'}</span>
      </div>
      {/* Contenu */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
            {order.book?.title || t.personalizedLabel || 'Livre personnalisé'}
          </h3>
          <p className="text-orange-600 dark:text-orange-400 font-bold text-base mb-1">
            {order.calculatedPrice ? `${order.calculatedPrice.toLocaleString()} FCFA` : t.personalizedUnknownPrice || 'Prix inconnu'}
          </p>
          {order.originalBookPrice && (
            <span className="text-xs text-gray-500 line-through">
              {order.originalBookPrice.toLocaleString()} FCFA
            </span>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            <strong>{t.personalizedChild || 'Enfant'} :</strong> {order.childName || '-'}<br/>
            <strong>{t.personalizedPack || 'Pack'} :</strong> {order.packType || '-'}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="mt-2 text-xs text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1 self-end"
          >
            {t.personalizedDelete || 'Supprimer'}
          </button>
        )}
      </div>
    </div>
  );
} 