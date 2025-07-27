import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from './LanguageProvider';
import { TRANSLATIONS } from '@/i18n/translations';
import { Heart, BookOpen, Star, Users, Smile, Globe, Leaf, Handshake, Lightbulb, Shield, Award, UserCheck, UserPlus, User, Sun, ThumbsUp, MessageCircle, CheckCircle, Gift, Brain, Eye, Feather, Home, UserCircle, UserCog } from 'lucide-react';

interface Value {
  id: number;
  name_fr: string;
  name_en?: string;
  name_de?: string;
  name_es?: string;
  name_ar?: string;
}

const virtueIcons: Record<string, React.ReactNode> = {
  'Courage': <Star className="w-8 h-8" />,
  'Honnêteté': <Shield className="w-8 h-8" />,
  'Respect': <Handshake className="w-8 h-8" />,
  'Responsabilité': <UserCheck className="w-8 h-8" />,
  'Générosité': <Gift className="w-8 h-8" />,
  'Patience': <HourglassIcon className="w-8 h-8" />,
  'Créativité': <Lightbulb className="w-8 h-8" />,
  'Solidarité': <Users className="w-8 h-8" />,
  'Empathie': <Heart className="w-8 h-8" />,
  'Détermination': <Award className="w-8 h-8" />,
  'Persévérance': <ThumbsUp className="w-8 h-8" />,
  'Gentillesse': <Smile className="w-8 h-8" />,
  'Partage': <Gift className="w-8 h-8" />,
  'Famille': <Home className="w-8 h-8" />,
  'Aventure': <Globe className="w-8 h-8" />,
  'Inspiration': <Sun className="w-8 h-8" />,
  'Éducation': <BookOpen className="w-8 h-8" />,
  'Humour': <Smile className="w-8 h-8" />,
  'Animaux': <Feather className="w-8 h-8" />,
  'Découverte': <Eye className="w-8 h-8" />,
  'Nature': <Leaf className="w-8 h-8" />,
  'Légende': <MessageCircle className="w-8 h-8" />,
  'Tradition': <UserCircle className="w-8 h-8" />,
  'Culture': <Globe className="w-8 h-8" />,
  'Transmission': <UserPlus className="w-8 h-8" />,
};

function HourglassIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 2h12M6 22h12M6 2c0 7 6 7 6 7s6 0 6-7M6 22c0-7 6-7 6-7s6 0 6 7" />
    </svg>
  );
}

export default function VirtuesBar() {
  const [values, setValues] = useState<Value[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [position, setPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  // Détecter si on est côté client et la taille d'écran
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/values')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('VirtuesBar - Données reçues:', data);
        setValues(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('VirtuesBar - Erreur lors du chargement:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Animation du slider automatique
  useEffect(() => {
    if (values.length === 0 || !isClient) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        // Vitesse adaptative selon la taille d'écran
        const step = isMobile ? 1.5 : 2; // Plus lent sur mobile
        const itemWidth = isMobile ? 80 : 120; // Plus petit sur mobile
        const maxPosition = values.length * itemWidth;

        if (direction === 'right') {
          if (prev >= maxPosition) {
            setDirection('left');
            return prev - step;
          }
          return prev + step;
        } else {
          if (prev <= 0) {
            setDirection('right');
            return prev + step;
          }
          return prev - step;
        }
      });
    }, 50); // Mise à jour toutes les 50ms pour un mouvement fluide

    return () => clearInterval(interval);
  }, [values.length, direction, isClient, isMobile]);

  const getVirtueName = (v: Value) => {
    switch (lang) {
      case 'en': return v.name_en || v.name_fr;
      case 'de': return v.name_de || v.name_fr;
      case 'es': return v.name_es || v.name_fr;
      case 'ar': return v.name_ar || v.name_fr;
      default: return v.name_fr;
    }
  };

  return (
    <section className="w-full my-8">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-7 h-7 text-orange-400 animate-bounce" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-wide">{t.virtuesTitle || 'Vertus à transmettre'}</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg text-center max-w-2xl">
          {t.virtuesSubtitle || 'Découvrez les valeurs éducatives et humaines que nos livres mettent en avant pour chaque enfant.'}
        </p>
      </div>
      
      {loading && (
        <div className="w-full flex justify-center items-center py-12 bg-orange-50 dark:bg-orange-900/20 border-y border-orange-200 dark:border-orange-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300">{t.virtuesLoading || 'Chargement des vertus...'}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="w-full flex justify-center items-center py-12 bg-red-50 dark:bg-red-900/20 border-y border-red-200 dark:border-red-700">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{t.virtuesError || 'Erreur lors du chargement des vertus:'} {error}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && values.length === 0 && (
        <div className="w-full flex justify-center items-center py-12 bg-orange-50 dark:bg-orange-900/20 border-y border-orange-200 dark:border-orange-700">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">{t.virtuesEmpty || 'Aucune vertu trouvée'}</p>
          </div>
        </div>
      )}
      
              {!loading && !error && values.length > 0 && isClient && (
          <div className="relative w-full overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-y border-orange-200 dark:border-orange-700 virtues-slider">
            {/* Gradient overlay pour l'effet de fondu */}
            <div className="absolute left-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-r from-orange-50 dark:from-orange-900/20 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-l from-orange-50 dark:from-orange-900/20 to-transparent z-10"></div>
            
            {/* Container du slider */}
            <div 
              ref={sliderRef}
              className="flex items-center py-6 sm:py-12 transition-transform duration-100 ease-linear"
              style={{ 
                transform: isClient ? `translateX(-${position}px)` : 'translateX(0px)',
                width: isClient ? `${values.length * (isMobile ? 80 : 120)}px` : 'auto' // Largeur adaptative
              }}
            >
                         {/* Dupliquer les valeurs pour un défilement infini */}
             {[...values, ...values].map((v, index) => {
               const icon = isClient ? (virtueIcons[v.name_fr] || <Star className="w-6 h-6 sm:w-8 sm:h-8" />) : <div className="w-6 h-6 sm:w-8 sm:h-8" />;
               const isDuplicate = index >= values.length;
               const actualId = isDuplicate ? v.id + 1000 : v.id; // ID unique pour les doublons
               
               return (
                 <div
                   key={`${v.id}-${index}`}
                   className="relative group mx-3 sm:mx-6 flex-shrink-0 virtue-item flex flex-col items-center"
                   onMouseEnter={() => setHovered(actualId)}
                   onMouseLeave={() => setHovered(null)}
                 >
                   <div className={`
                     w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full 
                     bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-600 
                     shadow-lg dark:shadow-orange-900/30 
                     transition-all duration-300 ease-out
                     group-hover:scale-110 group-hover:border-orange-500 dark:group-hover:border-orange-400 
                     group-hover:shadow-xl dark:group-hover:shadow-orange-500/20 
                     cursor-pointer text-orange-500 dark:text-orange-400
                     hover:bg-orange-50 dark:hover:bg-orange-900/30
                     virtue-icon
                   `}>
                     {icon}
                   </div>
                   
                   {/* Tooltip - caché sur mobile */}
                   {hovered === actualId && (
                     <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 -top-20 
                       bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-600 
                       rounded-lg px-4 py-2 shadow-lg text-orange-600 dark:text-orange-400 
                       font-semibold text-sm z-20 animate-fade-in whitespace-nowrap">
                       {getVirtueName(v)}
                       <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-orange-300 dark:border-t-orange-600"></div>
                     </div>
                   )}
                   
                   {/* Nom affiché sur mobile */}
                   <div className="mt-3 text-center">
                     <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium truncate max-w-20 sm:max-w-24">
                       {getVirtueName(v)}
                     </p>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}
    </section>
  );
} 