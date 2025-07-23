// Fichier : src/components/CartItem.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Order } from '@/types/app.d';

interface CartItemProps {
  order: Order & { _type?: 'PERSONALIZED' | 'STANDARD' };
  onDelete: (orderId: number) => void;
  isProcessingAction: boolean;
  onViewDetails?: (order: Order) => void;
}

export default function CartItem({ order, onDelete, isProcessingAction, onViewDetails }: CartItemProps) {
  const isPersonalized = order._type === 'PERSONALIZED';
  const displayPrice = isPersonalized ? order.calculatedPrice : order.book?.price;
  const displayTitle = isPersonalized ? `${order.book?.title} - Personnalisé` : order.book?.title;
  // Pour les personnalisés, on affiche la photo de l'enfant si dispo, sinon la cover, sinon un placeholder
  const displayImage = isPersonalized
    ? (order.childPhotoUrl || order.book?.coverImage || '/placeholder-book.jpg')
    : (order.book?.coverImage || '/placeholder-book.jpg');

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Image du livre */}
      <div className="flex-shrink-0 relative">
        <Image
          src={displayImage}
          alt={displayTitle || 'Livre'}
          width={80}
          height={120}
          className="rounded-md object-cover"
        />
        {isPersonalized && (
          <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow">Personnalisé</span>
        )}
      </div>

      {/* Informations du livre */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
          {displayTitle}
        </h3>
        
        {isPersonalized && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Enfant:</strong> {order.childName}
            </p>
            {order.packType && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Pack:</strong> {order.packType}
              </p>
            )}
            {order.mainTheme && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Thème:</strong> {order.mainTheme}
              </p>
            )}
            {order.bookLanguages && order.bookLanguages.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Langues:</strong> {order.bookLanguages.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {displayPrice?.toLocaleString()} FCFA
            </span>
            {isPersonalized && order.originalBookPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {order.originalBookPrice.toLocaleString()} FCFA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {onViewDetails && isPersonalized && (
          <button
            onClick={() => onViewDetails(order)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Voir les détails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => onDelete(order.id)}
          disabled={isProcessingAction}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          title="Supprimer"
        >
          {isProcessingAction ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}