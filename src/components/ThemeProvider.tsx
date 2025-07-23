// Fichier : src/components/ThemeProvider.tsx
'use client';

// On importe ThemeProvider ET le type ThemeProviderProps directement depuis 'next-themes'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // On passe les props directement au vrai ThemeProvider de la bibliothèque.
  // Ce code est maintenant parfaitement typé et sécurisé.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}