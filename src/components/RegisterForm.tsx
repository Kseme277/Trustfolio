// Fichier : src/components/RegisterForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { Mail, Lock, User as UserIcon } from 'lucide-react'; 
import { FcGoogle } from 'react-icons/fc'; 
import { FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa'; 
import Link from 'next/link';

interface RegisterFormProps {
  onToggleLogin: () => void;
}

export default function RegisterForm({ onToggleLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const evaluatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score += 20; if (pwd.length >= 12) score += 20;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
    if (/\d/.test(pwd)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
    return Math.min(score, 100);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(evaluatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      setIsSubmitting(false);
      return;
    }
    if (passwordStrength < 60) {
        toast.error("Mot de passe trop faible. Veuillez le renforcer.");
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de l\'inscription.');
      }

      toast.success("Compte créé ! Vous pouvez maintenant vous connecter.");
      onToggleLogin(); 
    } catch (error: any) {
      toast.error(`Erreur : ${error.message}`);
      console.error("Erreur d'inscription :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6"> {/* Padding réduit (p-6) */}
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Inscription</h2> {/* Taille titre réduite (text-2xl) */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4"> {/* Espacement réduit (space-y-4) */}
        <div> 
          <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
          <div className="relative">
            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> {/* Icône plus petite (size-18) */}
            <input type="text" id="register-name" value={name} onChange={(e) => setName(e.target.value)} required
                   className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" // Padding vertical et gauche ajustés
                   placeholder="Votre nom" disabled={isSubmitting} />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse e-mail</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> {/* Icône plus petite */}
            <input type="email" id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} required
                   className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" // Padding vertical et gauche ajustés
                   placeholder="votre.email@exemple.com" disabled={isSubmitting} />
          </div>
        </div>
        
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> {/* Icône plus petite */}
            <input type="password" id="register-password" value={password} onChange={handlePasswordChange} required
                   className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" // Padding vertical et gauche ajustés
                   placeholder="********" disabled={isSubmitting} />
            {password.length > 0 && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"> {/* Hauteur barre réduite (h-1.5) */}
                    <div className={`h-full rounded-full ${getStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength}%` }}></div>
                </div>
            )}
            {password.length > 0 && passwordStrength < 100 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Solidité : {passwordStrength < 40 ? 'Faible' : passwordStrength < 80 ? 'Moyenne' : 'Forte'}.
                    Pour un mot de passe fort : au moins 8 caractères, majuscules, minuscules, chiffres et symboles.
                </p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> {/* Icône plus petite */}
            <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                   className="w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" // Padding vertical et gauche ajustés
                   placeholder="********" disabled={isSubmitting} />
          </div>
          {password !== confirmPassword && confirmPassword.length > 0 && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
          )}
        </div>
        
        <button type="submit" disabled={isSubmitting || password !== confirmPassword || passwordStrength < 60}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Création du compte...' : 'S\'inscrire'}
        </button>
      </form>

      {/* Séparateur pour les connexions sociales */}
      <div className="relative flex items-center w-full max-w-xs my-6">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-sm">ou s'inscrire avec</span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
      </div>

      {/* Icônes de connexion sociale */}
      <div className="flex justify-center gap-3 w-full max-w-xs"> {/* Espacement réduit (gap-3) */}
        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="S'inscrire avec Google"><FcGoogle size={20} /></button> {/* Icônes plus petites (size-20) */}
        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="S'inscrire avec Facebook"><FaFacebook size={20} /></button>
        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="S'inscrire avec GitHub"><FaGithub size={20} /></button>
        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="S'inscrire avec LinkedIn"><FaLinkedin size={20} /></button>
      </div>

      <div className="md:hidden mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Déjà un compte ?{' '}
          <button onClick={onToggleLogin} className="text-orange-500 hover:underline font-semibold">
            Connectez-vous ici
          </button>
        </p>
      </div>
    </div>
  );
}