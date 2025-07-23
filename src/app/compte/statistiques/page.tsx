'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phoneUser, setPhoneUser] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Vérifier l'authentification par téléphone
  useEffect(() => {
    const checkPhoneAuth = () => {
      const phoneAuth = localStorage.getItem('phoneAuth');
      if (phoneAuth) {
        try {
          const userData = JSON.parse(phoneAuth);
          setPhoneUser(userData);
        } catch (error) {
          console.error('Erreur parsing phoneAuth:', error);
          localStorage.removeItem('phoneAuth');
        }
      }
    };

    checkPhoneAuth();
    window.addEventListener('phone-auth-updated', checkPhoneAuth);
    
    return () => {
      window.removeEventListener('phone-auth-updated', checkPhoneAuth);
    };
  }, []);

  // Utilisateur connecté (par NextAuth ou par téléphone)
  const isAuthenticated = session || phoneUser;
  const currentUser = session?.user || phoneUser;

  // Redirection si non authentifié (côté client) - avec délai pour éviter les redirections intempestives
  useEffect(() => {
    // Attendre un peu avant de vérifier l'authentification
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
      
      // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
      if (!isAuthenticated && status === 'unauthenticated' && !phoneUser) {
        console.log('Statistiques - Redirecting to login, not authenticated');
        router.push('/connexion?callbackUrl=/compte/statistiques');
      }
    }, 2000); // Délai de 2 secondes pour laisser le temps à l'auth téléphone

    return () => clearTimeout(timer);
  }, [isAuthenticated, status, router, phoneUser]);

  useEffect(() => {
    // Attendre que l'authentification soit vérifiée
    if (!hasCheckedAuth) return;
    
    if (status === 'loading') return;
    
    // Ne redirige que si vraiment non authentifié ET que le statut est déterminé
    if (!isAuthenticated && status === 'unauthenticated' && !phoneUser) {
      router.push('/connexion?callbackUrl=/compte/statistiques');
      return;
    }
  }, [isAuthenticated, status, hasCheckedAuth, phoneUser, router]);

  // Afficher un loader pendant la vérification
  if (!hasCheckedAuth || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Chargement de vos statistiques...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mes Statistiques</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Consultez vos statistiques d'utilisation.</p>
      </header>

      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Livres commandés</div>
          </div>
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">8</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Livres personnalisés</div>
          </div>
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Livres standard</div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Détails par mois</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">Janvier 2024</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">3 commandes</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">Février 2024</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">5 commandes</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">Mars 2024</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">4 commandes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}