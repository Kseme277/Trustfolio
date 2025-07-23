// Fichier : src/components/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react'; // Icônes pour les champs
import { FcGoogle } from 'react-icons/fc'; // Icône Google
import { FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa'; // Autres icônes sociales
import Link from 'next/link'; // <-- AJOUTEZ CETTE LIGNE

interface LoginFormProps {
  onToggleRegister: () => void;
}

export default function LoginForm({ onToggleRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/compte';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl,
    });

    if (result?.error) {
      toast.error("Erreur de connexion. Vérifiez vos identifiants.");
      console.error("Erreur de connexion :", result.error);
    } else if (result?.ok) {
      toast.success("Connexion réussie !");
      router.push(result.url || callbackUrl);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Connexion</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
        <div> {/* Conteneur pour le label et l'input */}
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse e-mail</label>
          <div className="relative">
            <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required
                   className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="votre.email@exemple.com" disabled={isSubmitting} />
          </div>
        </div>
        
        <div> {/* Conteneur pour le label et l'input */}
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required
                   className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                   placeholder="********" disabled={isSubmitting} />
          </div>
          <Link href="#" className="block text-right text-xs text-orange-500 hover:underline mt-1">Mot de passe oublié ?</Link>
        </div>
        
        <button type="submit" disabled={isSubmitting}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      {/* Séparateur pour les connexions sociales */}
      <div className="relative flex items-center w-full max-w-xs my-6">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-sm">ou se connecter avec</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Icônes de connexion sociale */}
      <div className="flex justify-center gap-4 w-full max-w-xs">
        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Se connecter avec Google"><FcGoogle size={24} /></button>
        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Se connecter avec Facebook"><FaFacebook size={24} /></button>
        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Se connecter avec GitHub"><FaGithub size={24} /></button>
        <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Se connecter avec LinkedIn"><FaLinkedin size={24} /></button>
      </div>

      {/* Lien vers l'inscription (visible sur petits écrans pour le basculement) */}
      <div className="md:hidden mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Pas encore de compte ?{' '}
          <button onClick={onToggleRegister} className="text-orange-500 hover:underline font-semibold">
            Inscrivez-vous ici
          </button>
        </p>
      </div>
    </div>
  );
}