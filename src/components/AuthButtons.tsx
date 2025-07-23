// src/components/AuthButtons.tsx
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { data: session, status } = useSession();
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

  const handleSignOut = () => {
    if (phoneUser) {
      // Déconnexion pour l'authentification par téléphone
      localStorage.removeItem('phoneAuth');
      window.dispatchEvent(new Event('phone-auth-updated'));
    } else {
      // Déconnexion NextAuth
      signOut();
    }
  };

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {session?.user?.name || phoneUser?.name || 'Utilisateur'}
        </span>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => signIn()}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Connexion
      </button>
    </div>
  );
}