'use client';

import React from 'react';
import Link from 'next/link';

export default function TestInscriptionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Test d'accès à l'inscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Cette page teste l'accès direct à l'inscription
        </p>
        <div className="space-y-4">
          <Link 
            href="/inscription" 
            className="block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Aller à l'inscription
          </Link>
          <Link 
            href="/connexion" 
            className="block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
} 