// Fichier : src/app/layout.tsx

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Utilisation de la nouvelle police
import './globals.css'; // Import des styles globaux (Tailwind CSS)

// Import des composants de contexte et de layout
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import AuthLayout from '@/components/AuthLayout';

// Configuration de la police Poppins
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'], // Poids de police à charger
});

// Métadonnées de l'application (pour le SEO et le titre du navigateur)
export const metadata: Metadata = {
  title: {
    default: 'TrustFolio - Livres Personnalisés pour Enfants',
    template: '%s | TrustFolio', // Formatage du titre des pages
  },
  description: 'Créez des livres 100% personnalisés, éducatifs et enracinés dans la culture africaine. Faites de votre enfant le héros de sa propre histoire.',
  icons: {
    icon: '/Logo TrustFolio.png', // Chemin vers l'icône du site (dans le dossier public)
  },
};

// Composant RootLayout : la racine de votre application Next.js
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    // 'suppressHydrationWarning' est utilisé avec next-themes pour éviter un warning
    // dû à une différence de classe (dark/light) entre le rendu serveur et client.
    <html lang="fr" suppressHydrationWarning>
      <body className={poppins.className}>
        {/* AuthProvider enveloppe tout pour fournir le contexte d'authentification */}
        <AuthProvider>
          {/* ThemeProvider gère le basculement entre les thèmes clair/sombre */}
          <ThemeProvider 
            attribute="class" // Ajoute la classe 'dark' à l'élément <html> pour le thème sombre
            defaultTheme="system" // Utilise le thème du système d'exploitation par défaut
            enableSystem // Permet le basculement entre clair, sombre et le thème système
          >
            <AuthLayout>
              {children}
            </AuthLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}