import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
} 