'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [phoneUser, setPhoneUser] = useState<any>(null);

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

  // Redirection si non authentifié (côté client)
  useEffect(() => {
    // Ne redirige que si vraiment non authentifié (pas de session ET pas d'utilisateur téléphone)
    if (!isAuthenticated && status === 'unauthenticated' && !phoneUser) {
      router.push('/connexion?callbackUrl=/compte/profil');
    }
  }, [isAuthenticated, status, router, phoneUser]);

  if (status === 'loading' && !phoneUser) {
    return <div className="text-center p-10 text-xl text-gray-700 dark:text-gray-300">Chargement de votre profil...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mon Profil</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Gérez vos informations personnelles.</p>
      </header>

      <section className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center gap-6">
          {currentUser?.image && (
            <Image
              src={currentUser.image}
              alt="Image de profil"
              width={100}
              height={100}
              className="rounded-full border-4 border-orange-500"
            />
          )}
          <div className="text-center space-y-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentUser?.name || 'Nom non défini'}</p>
            <p className="text-gray-600 dark:text-gray-300">{currentUser?.email}</p>
            {currentUser?.phoneNumber && (
              <p className="text-gray-600 dark:text-gray-300">{currentUser.phoneNumber}</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Détails du compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ID Utilisateur</p>
              <p className="text-gray-900 dark:text-gray-200">{currentUser?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de connexion</p>
              <p className="text-gray-900 dark:text-gray-200">{phoneUser ? 'Téléphone' : 'Email'}</p>
            </div>
          </div>
        </div>
        
        {/* Ajoutez ici d'autres champs à gérer : adresse par défaut, etc. */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          (Ces informations peuvent être éditées via un formulaire ultérieurement)
        </p>
      </section>
    </div>
  );
}