// Fichier : src/components/ThemeSwitcher.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect ne s'exécute que sur le client, après le montage.
  // Cela évite les erreurs d'hydratation où le serveur et le client
  // pourraient avoir des thèmes différents au premier rendu.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si le composant n'est pas encore monté, on ne rend rien (ou un placeholder)
  // pour s'assurer que l'icône correcte s'affiche.
  if (!mounted) {
    return null;
  }

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Changer de thème"
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}