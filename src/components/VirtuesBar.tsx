import React, { useEffect, useState } from 'react';
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
  'Courage': <Star className="w-7 h-7" />, // Courage
  'Honnêteté': <Shield className="w-7 h-7" />, // Honesty
  'Respect': <Handshake className="w-7 h-7" />, // Respect
  'Responsabilité': <UserCheck className="w-7 h-7" />, // Responsibility
  'Générosité': <Gift className="w-7 h-7" />, // Generosity
  'Patience': <HourglassIcon className="w-7 h-7" />, // Patience
  'Créativité': <Lightbulb className="w-7 h-7" />, // Creativity
  'Solidarité': <Users className="w-7 h-7" />, // Solidarity
  'Empathie': <Heart className="w-7 h-7" />, // Empathy
  'Détermination': <Award className="w-7 h-7" />, // Determination
  'Persévérance': <ThumbsUp className="w-7 h-7" />, // Perseverance
  'Gentillesse': <Smile className="w-7 h-7" />, // Kindness
  'Partage': <Gift className="w-7 h-7" />, // Sharing
  'Famille': <Home className="w-7 h-7" />, // Family
  'Aventure': <Globe className="w-7 h-7" />, // Adventure
  'Inspiration': <Sun className="w-7 h-7" />, // Inspiration
  'Éducation': <BookOpen className="w-7 h-7" />, // Education
  'Humour': <Smile className="w-7 h-7" />, // Humor
  'Animaux': <Feather className="w-7 h-7" />, // Animals
  'Découverte': <Eye className="w-7 h-7" />, // Discovery
  'Nature': <Leaf className="w-7 h-7" />, // Nature
  'Légende': <MessageCircle className="w-7 h-7" />, // Legend
  'Tradition': <UserCircle className="w-7 h-7" />, // Tradition
  'Culture': <Globe className="w-7 h-7" />, // Culture
  'Transmission': <UserPlus className="w-7 h-7" />, // Transmission
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
  const [hovered, setHovered] = useState<number | null>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    fetch('/api/values').then(res => res.json()).then(setValues);
  }, []);

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
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-7 h-7 text-orange-400 animate-bounce" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-wide">Vertus à transmettre</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg text-center max-w-2xl">Découvrez les valeurs éducatives et humaines que nos livres mettent en avant pour chaque enfant.</p>
      </div>
      <div className="w-full flex flex-wrap justify-center items-center gap-4 py-6 bg-orange-50 border-y border-orange-200">
        {values.map(v => {
          const icon = virtueIcons[v.name_fr] || <Star className="w-7 h-7" />;
          return (
            <div
              key={v.id}
              className="relative group"
              onMouseEnter={() => setHovered(v.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-white border-2 border-orange-300 shadow transition-transform duration-200 group-hover:scale-110 group-hover:border-orange-500 group-hover:shadow-lg cursor-pointer text-orange-500`}
              >
                {icon}
              </div>
              {hovered === v.id && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-white border border-orange-300 rounded-lg px-4 py-2 shadow-lg text-orange-600 font-semibold text-sm z-20 animate-fade-in">
                  {getVirtueName(v)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
} 