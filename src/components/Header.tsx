// Fichier : src/components/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // <-- IMPORTE useRouter
import { usePathname } from 'next/navigation';
// Importe les icônes nécessaires depuis Lucide React pour le sous-menu
import { User as UserIcon, LogOut, BookText, BarChart } from 'lucide-react'; 
// Import du nouveau composant d'icône de profil avec statut
import ProfileStatusIcon from './ProfileStatusIcon'; 

export default function Header() {
  const { toggleCart } = useCartStore();
  const [hasMounted, setHasMounted] = useState(false);
  const { data: session, status } = useSession();
  const [itemCount, setItemCount] = useState(0);
  const [phoneUser, setPhoneUser] = useState<any>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- Ajout état menu burger
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter(); // <-- INITIALISE useRouter ICI
  const pathname = usePathname();

  // Vérifier si l'utilisateur est connecté par téléphone
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
    // Écouter les changements de localStorage
    window.addEventListener('storage', checkPhoneAuth);
    window.addEventListener('phone-auth-updated', checkPhoneAuth);
    
    return () => {
      window.removeEventListener('storage', checkPhoneAuth);
      window.removeEventListener('phone-auth-updated', checkPhoneAuth);
    };
  }, []);

  // Utilisateur connecté (par NextAuth ou par téléphone)
  const isAuthenticated = session || phoneUser;
  const currentUser = session?.user || phoneUser;

  useEffect(() => {
    async function fetchCartCount() {
      let cartUrl = '/api/cart-orders?';
      let persUrl = '/api/orders?';
      if (isAuthenticated) {
        if (session?.user?.id) {
          cartUrl += `userId=${session.user.id}`;
          persUrl += `userId=${session.user.id}`;
        } else if (phoneUser?.id) {
          cartUrl += `phoneUserId=${phoneUser.id}`;
          persUrl += `phoneUserId=${phoneUser.id}`;
        }
      } else {
        let guestToken = localStorage.getItem('guestToken');
        if (!guestToken) {
          setItemCount(0);
          return;
        }
        cartUrl += `guestToken=${guestToken}`;
        persUrl += `guestToken=${guestToken}`;
      }
      const [cartRes, persRes] = await Promise.all([fetch(cartUrl), fetch(persUrl)]);
      let total = 0;
      if (cartRes.ok) {
        const cartOrders = await cartRes.json();
        total += cartOrders.reduce((sum: number, order: any) => sum + (order.quantity || 1), 0);
      }
      if (persRes.ok) {
        const persOrders = await persRes.json();
        total += persOrders.reduce((sum: number, order: any) => sum + (order.quantity || 1), 0);
      }
      setItemCount(total);
    }
    fetchCartCount();
    function handleCartUpdate() { fetchCartCount(); }
    window.addEventListener('cart-updated', handleCartUpdate);
    // Ajout : refetch à chaque navigation
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [isAuthenticated, session, phoneUser, pathname]);

  useEffect(() => { setHasMounted(true); }, []);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [profileMenuRef]);

  // Si le composant n'est pas encore monté, affiche un skeleton de Header pour éviter les problèmes d'hydratation
  if (!hasMounted) {
    return (
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 py-3">
        <nav className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </nav>
      </header>
    );
  }

  // Gère le clic sur l'icône de profil
  const handleProfileIconClick = () => {
    if (status === 'loading') return; // Ne fait rien si le statut de session est en chargement
    if (isAuthenticated) {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    } else {
      router.push('/connexion'); 
    }
  };

  // Fonction de déconnexion
  const handleSignOut = () => {
    if (phoneUser) {
      // Déconnexion par téléphone
      localStorage.removeItem('phoneAuth');
      setPhoneUser(null);
      window.dispatchEvent(new Event('phone-auth-updated'));
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
      router.push('/');
    } else {
      // Déconnexion NextAuth
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo avec image ronde */}
        <Link href="/" className="flex items-center gap-2 select-none">
          {/* Image ronde visible partout */}
          <img 
            src="/Logo TrustFolio.png" 
            alt="Logo TrustFolio" 
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm"
          />
          {/* Texte TrustFolio visible seulement sur desktop */}
          <span className="text-3xl font-bold text-orange-500 hover:opacity-80 transition-opacity hidden sm:inline">TrustFolio</span>
        </Link>
        {/* Liens de navigation et actions à droite */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Menu burger pour mobile */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Ouvrir le menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            {/* Menu déroulant mobile */}
            {isMobileMenuOpen && (
              <div className="absolute right-4 top-16 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 flex flex-col">
                <Link href="/" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Accueil</Link>
                <Link href="/livres" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Livres</Link>
                <Link href="/a-propos" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">À Propos</Link>
                <Link href="/contact" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Contact</Link>
                {/* Connexion/Inscription sur mobile si déconnecté */}
                {!isAuthenticated && (
                  <>
                    <Link href="/connexion" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Connexion</Link>
                    <Link href="/inscription" className="px-4 py-2 text-orange-500 font-semibold hover:bg-orange-100 dark:hover:bg-orange-900">Inscription</Link>
                  </>
                )}
                {/* Profil et menu sur mobile si connecté */}
                {isAuthenticated && (
                  <>
                    <Link href="/compte" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Mon Profil</Link>
                    <Link href="/compte/mes-livres" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Mes Livres</Link>
                    <Link href="/compte/statistiques" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Statistiques</Link>
                    <button onClick={handleSignOut} className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-left">Déconnexion</button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Liens de navigation principaux (cachés sur mobile) */}
          <div className="hidden sm:flex items-center space-x-5">
            <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors">Accueil</Link>
            <Link href="/livres" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors">Livres</Link>
            <Link href="/a-propos" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors">À Propos</Link>
            <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors">Contact</Link>
          </div>

          {/* Séparateur visuel */}
          <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Icônes et boutons d'action (Thème, Profil, Panier) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <ThemeSwitcher />
            
            {/* Icône de profil : visible uniquement si connecté */}
            {isAuthenticated && (
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={handleProfileIconClick}
                  className="relative p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menu du profil"
                  aria-expanded={isProfileMenuOpen}
                  disabled={status === 'loading'}
                >
                  <ProfileStatusIcon />
                </button>
                {/* Sous-menu du profil (desktop) */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                      <p className="font-semibold truncate">{currentUser?.name || 'Utilisateur'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <Link 
                      href="/compte" 
                      onClick={() => { setIsProfileMenuOpen(false); router.push('/compte'); }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <UserIcon size={16} className="mr-2"/> Mon Profil
                    </Link>
                    <Link 
                      href="/compte/mes-livres" 
                      onClick={() => { setIsProfileMenuOpen(false); router.push('/compte/mes-livres'); }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <BookText size={16} className="mr-2"/> Mes Livres Personnels
                    </Link>
                    <Link 
                      href="/compte/statistiques" 
                      onClick={() => { setIsProfileMenuOpen(false); router.push('/compte/statistiques'); }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <BarChart size={16} className="mr-2"/> Mes Statistiques
                    </Link>
                    <button 
                      onClick={handleSignOut} 
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <LogOut size={16} className="mr-2"/> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Liens Connexion/Inscription (desktop) si déconnecté */}
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/connexion" className="font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                  Connexion
                </Link>
                <Link href="/inscription" className="bg-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                  Inscription
                </Link>
              </div>
            )}
            {/* Bouton Panier avec compteur dynamique */}
            <button 
              onClick={() => {
                console.log('Header - Toggle cart clicked');
                toggleCart();
              }}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" 
              aria-label="Voir le panier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {hasMounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-800 animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}