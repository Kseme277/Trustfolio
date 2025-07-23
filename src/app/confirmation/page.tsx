// src/app/confirmation/page.tsx
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="container mx-auto p-8 text-center">
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Merci pour votre commande !</h1>
        <p className="text-lg text-gray-700 mb-8">
          Votre livre personnalisé est en cours de création. Nous vous enverrons un email de confirmation très bientôt.
        </p>
        <Link 
          href="/" 
          className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
}