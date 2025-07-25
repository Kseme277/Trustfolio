// Fichier : src/app/layout.tsx

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Utilisation de la nouvelle police
import './globals.css'; // Import des styles globaux (Tailwind CSS)

// Import des composants de contexte et de layout
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import AuthLayout from '@/components/AuthLayout';
import { LanguageProvider } from '@/components/LanguageProvider';
import { SessionProvider } from 'next-auth/react';
import ClientProviders from '@/components/ClientProviders';
import Footer from '@/components/Footer';
import FooterWrapper from '@/components/FooterWrapper';
import React from 'react';
import Header from '@/components/Header';

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
  description: 'Créez des livres 100% personnalisés, éducatifs et enracinés dans votre culture africaine. Faites de votre enfant le héros de sa propre histoire.',
  icons: {
    icon: '/logo_jpg.jpg', // Chemin vers l'icône du site (dans le dossier public)
  },
};

// Composant RootLayout : la racine de votre application Next.js
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-500">
        <ClientProviders>
          <Header />
          {children}
          <FooterWrapper />
        </ClientProviders>
      </body>
    </html>
  );
}