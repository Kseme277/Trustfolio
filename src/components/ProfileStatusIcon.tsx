// Fichier : src/components/ProfileStatusIcon.tsx
'use client';

import Image from 'next/image';
import { User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function ProfileStatusIcon() {
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

  const isConnected = status === 'authenticated' || phoneUser;
  const statusColorClass = isConnected ? 'bg-green-500' : 'bg-red-500';
  const StatusIndicatorIcon = isConnected ? CheckCircle : XCircle;
  const currentUser = session?.user || phoneUser;

  const defaultAvatarPath = '/d.jpeg'; 

  return (
    <div className="relative p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      {currentUser?.image ? (
        <Image
          src={currentUser.image}
          alt="Avatar de l'utilisateur"
          width={32}
          height={32}
          className="rounded-full border-2 border-transparent"
        />
      ) : (
        <Image 
          src={defaultAvatarPath}
          alt="Icône de profil par défaut"
          width={32}
          height={32}
          className="rounded-full bg-gray-200 dark:bg-gray-700 p-1"
        />
      )}

      {/* L'indicateur de statut (petit cercle vert/rouge avec icône) */}
      <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full flex items-center justify-center ${statusColorClass}`}>
        <StatusIndicatorIcon size={12} color="white" fill="white" />
      </span>
    </div>
  );
}