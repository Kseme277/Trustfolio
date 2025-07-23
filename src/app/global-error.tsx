'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur globale de l\'application:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Erreur Critique
            </h2>
            <p className="text-gray-600 mb-6">
              Une erreur critique s'est produite dans l'application.
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
      </body>
    </html>
  );
} 