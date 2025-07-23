'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur globale:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Oups ! Quelque chose s'est mal passé
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Une erreur inattendue s'est produite. Veuillez réessayer.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
} 