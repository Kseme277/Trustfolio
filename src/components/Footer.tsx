// Fichier : src/components/Footer.tsx
import Link from 'next/link';
// Importe les icônes nécessaires (si vous voulez ajouter des icônes pour email, téléphone, etc.)
// import { Mail, Phone, MapPin } from 'lucide-react'; 

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Colonne 1: À propos de TrustFolio */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">À propos</h3>
            <p className="text-gray-600 dark:text-gray-300">
              TrustFolio est votre destination pour explorer la richesse de la littérature africaine à travers des livres personnalisés pour enfants.
            </p>
          </div>

          {/* Colonne 2: Liens rapides de navigation */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Accueil</Link></li>
              <li><Link href="/livres" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Livres</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">Contact</Link></li>
              <li><Link href="/a-propos" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">À Propos</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Coordonnées de contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
            <p className="text-gray-600 dark:text-gray-300">Email: contact@trustfolio.com</p>
            <p className="text-gray-600 dark:text-gray-300">Tél: +237 675667364</p>
            <p className="text-gray-600 dark:text-gray-300">Yaoundé, Capitole, Cameroun</p>
          </div>

          {/* Colonne 4: Nouveautés (Ancienne section Newsletter) */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nouveautés</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Découvrez nos dernières publications et actualités.</p>
            {/* Lien vers la page des nouveautés */}
            <Link href="/nouveautes" className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              Voir les nouveautés
            </Link>
          </div>

        </div>

        {/* Ligne de séparation et informations de copyright/mentions légales */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} TrustFolio. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-orange-500 transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-orange-500 transition-colors">Politique de confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}