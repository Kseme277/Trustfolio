// Fichier : src/components/PaymentModal.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { X, Banknote, CreditCard, Smartphone } from 'lucide-react'; // Icônes
import Image from 'next/image'; // Composant Image de Next.js
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // Pour la session (si nécessaire, pas utilisé directement pour le token ici)
import { Paypal, Mastercard, Visa } from 'react-payment-logos/dist/flat';

// Import des types depuis le fichier centralisé
import { PaymentMethod } from '@/types/app.d'; 

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderIds: { id: number; type: 'PERSONALIZED' | 'STANDARD' }[] | number[];
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, orderIds, onPaymentSuccess }: PaymentModalProps) {
  const [step, setStep] = useState(1); // 1: Choisir mode, 2: Infos, 3: Confirmation
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>({}); // Infos saisies par l'utilisateur
  const [isProcessing, setIsProcessing] = useState(false); // Indique si une action est en cours (ex: confirmation paiement)
  const router = useRouter();
  const { data: session } = useSession(); // Juste pour info, non utilisé pour auth token ici

  // Pour l'affichage du total, on gère les deux formats :
  const totalCount = Array.isArray(orderIds) ? orderIds.length : 0;

  // Réinitialise l'état du modal quand il s'ouvre/ferme
  useEffect(() => {
    if (!isOpen) { setStep(1); setSelectedMethod(null); setPaymentInfo({}); }
  }, [isOpen]);

  // Gère la fermeture du modal via la touche ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', handleEscape); } 
    else { document.removeEventListener('keydown', handleEscape); }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Sélectionne la méthode de paiement et passe à l'étape suivante
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentInfo({}); // Réinitialise les infos précédentes
    setStep(2); 
  };

  // Soumet les informations de paiement saisies et passe à l'étape de confirmation
  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Validation spécifique pour Mobile Money (numéro camerounais)
    if (selectedMethod === 'mobile_money') {
        const phoneNumber = paymentInfo.phoneNumber;
        if (!phoneNumber || !/^(6[5-9])\d{7}$/.test(phoneNumber)) { // Regex pour numéros 6xx xxx xxx
            toast.error("Numéro de téléphone camerounais invalide (doit commencer par 6, ex: 6XXXXXXXX).");
            return;
        }
    }
    // Validation simple pour carte bancaire (longueur)
    if (selectedMethod === 'card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.replace(/\s/g, '').length < 13 || paymentInfo.cardNumber.replace(/\s/g, '').length > 19) {
        toast.error("Numéro de carte invalide.");
        return;
      }
      if (!paymentInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        toast.error("Date d'expiration invalide (MM/AA).");
        return;
      }
      if (!paymentInfo.cvv || paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
        toast.error("CVV invalide.");
        return;
      }
    }

    setStep(3); // Passe à l'étape de confirmation
  };

  // Confirme le paiement et appelle l'API de finalisation
  const confirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Appel à l'API de finalisation de commande (src/app/api/checkout/route.ts)
      const res = await fetch('/api/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, paymentMethod: selectedMethod, paymentDetails: paymentInfo }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la finalisation du paiement.");
      }
      
      const result = await res.json();
      console.log('Paiement réussi:', result);
      
      toast.success("Paiement confirmé ! Votre commande est en cours de traitement.");
      onPaymentSuccess(); // Callback pour rafraîchir le panier et le header
      onClose(); // Ferme le modal
      router.push('/confirmation'); // Redirige vers la page de confirmation de commande

    } catch (error: any) {
      toast.error(`Erreur lors de la confirmation du paiement : ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Icône PayPal SVG inline
  const PaypalIcon = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#fff"/>
      <path d="M23.5 10.5c-.4-2.1-2.5-3.5-5.2-3.5h-6.1c-.5 0-.9.3-1 .8l-3.1 17.1c-.1.4.2.8.6.8h4.1l.8-4.5v.1c.1-.4.5-.7.9-.7h2.6c4.1 0 7.3-1.7 8.2-6.5.4-2.1.1-3.7-.8-4.7-.7-.8-1.8-1.2-3-1.2zm-1.1 5.2c-.6 3.2-2.9 4.2-6.1 4.2h-1.7l1.1-6.2c.1-.4.5-.7.9-.7h2.1c1.2 0 2.1.2 2.7.7.6.5.8 1.4.6 2zm-7.2 8.8h-2.7l2.7-15.1h6.1c2.2 0 3.7 1 4.1 2.7.2.8.1 1.7-.2 2.3-.5-.6-1.3-1-2.3-1.1-.2 0-.4-.1-.6-.1h-2.1c-1.2 0-2.2.8-2.4 2l-1.2 6.7c-.1.4.2.8.6.8h2.1c.2 0 .4 0 .6-.1.7-.1 1.3-.3 1.8-.6-.5 2.1-1.9 3.1-4.5 3.1z" fill="#003087"/>
      <path d="M25.2 12.2c-.5-.6-1.3-1-2.3-1.1-.2 0-.4-.1-.6-.1h-2.1c-1.2 0-2.2.8-2.4 2l-1.2 6.7c-.1.4.2.8.6.8h2.1c.2 0 .4 0 .6-.1.7-.1 1.3-.3 1.8-.6-.5 2.1-1.9 3.1-4.5 3.1h-2.7l2.7-15.1h6.1c2.2 0 3.7 1 4.1 2.7.2.8.1 1.7-.2 2.3z" fill="#009cde"/>
    </svg>
  );

  // Logos SVG Orange Money et MTN
  const OrangeMoneyIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#fff"/>
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#FF7900"/>
      <path d="M11 21v-7h2.5c1.5 0 2.5 1 2.5 2.5S15 19 13.5 19H13v2h-2zm2-4c.8 0 1.5-.7 1.5-1.5S13.8 14 13 14h-1v3h1z" fill="#fff"/>
    </svg>
  );
  const MTNIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#fff"/>
      <rect x="4" y="4" width="24" height="24" rx="4" fill="#FFD600"/>
      <text x="16" y="22" textAnchor="middle" fontWeight="bold" fontSize="10" fill="#003366" fontFamily="Arial, sans-serif">MTN</text>
    </svg>
  );

  // Le modal n'est pas rendu si 'isOpen' est faux
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Finaliser la Commande</h2>

        {/* ÉTAPE 1: Choisir le mode de paiement */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">Choisissez votre mode de paiement :</p>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => handleMethodSelect('bank_transfer')} className="flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Banknote size={28} /> Virement Bancaire
              </button>
              <button onClick={() => handleMethodSelect('paypal')} className="flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Paypal width={32} height={32} /> PayPal
              </button>
              <button onClick={() => handleMethodSelect('mobile_money')} className="flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="inline-flex items-center gap-1">
                  <Image src="/orange-money-logo-png_seeklogo-440383.png" alt="Orange Money" width={32} height={32} className="bg-white rounded-md p-1" />
                  <Image src="/mtn-mobile-money-logo.jpg" alt="MTN" width={32} height={32} className="bg-white rounded-md p-1" />
                </span>
                <span className="ml-2">Mobile Money (CM)</span>
              </button>
              <button onClick={() => handleMethodSelect('card')} className="flex items-center justify-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Mastercard width={32} height={32} /> <Visa width={32} height={32} /> Carte bancaire
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2: Saisie des informations de paiement */}
        {step === 2 && selectedMethod && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
              Informations pour le <span className="font-semibold">{selectedMethod.replace('_', ' ')}</span> :
            </p>
            
            {selectedMethod === 'bank_transfer' && (
              <>
                <input type="text" placeholder="Nom du compte" value={paymentInfo.accountName || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountName: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="Nom de la Banque" value={paymentInfo.bankName || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="Numéro de Compte" value={paymentInfo.accountNumber || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
              </>
            )}

            {selectedMethod === 'paypal' && (
              <input type="email" placeholder="Email PayPal" value={paymentInfo.paypalEmail || ''} 
                onChange={(e) => setPaymentInfo({ ...paymentInfo, paypalEmail: e.target.value })} 
                required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
            )}

            {selectedMethod === 'mobile_money' && (
              <>
                <input type="tel" placeholder="Numéro Mobile (ex: 67X XXX XXX)" 
                  value={paymentInfo.phoneNumber || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, phoneNumber: e.target.value })} 
                  required pattern="^6[5-9]\d{7}$" 
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
                <select value={paymentInfo.operator || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, operator: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500">
                  <option value="">Sélectionner l'opérateur</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                </select>
              </>
            )}

            {selectedMethod === 'card' && (
              <>
                <input type="text" placeholder="Numéro de carte" value={paymentInfo.cardNumber || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="Date d'expiration (MM/AA)" value={paymentInfo.expiryDate || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
                <input type="text" placeholder="CVV" value={paymentInfo.cvv || ''} 
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })} 
                  required className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-orange-500" />
              </>
            )}

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(1)} 
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400">
                Précédent
              </button>
              <button type="submit" 
                className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600">
                Continuer
              </button>
            </div>
          </form>
        )}

        {/* Étape 3: Confirmation */}
        {step === 3 && selectedMethod && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
              Veuillez confirmer les informations :
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md space-y-2 text-sm text-gray-800 dark:text-gray-200">
              <p>Mode : <span className="font-semibold">{selectedMethod.replace('_', ' ')}</span></p>
              
              {selectedMethod === 'bank_transfer' && (
                <>
                  <p>Compte : {paymentInfo.accountName} ({paymentInfo.bankName})</p>
                  <p>Numéro : {paymentInfo.accountNumber}</p>
                </>
              )}
              
              {selectedMethod === 'paypal' && <p>Email PayPal : {paymentInfo.paypalEmail}</p>}
              
              {selectedMethod === 'mobile_money' && (
                <>
                  <p>Numéro : {paymentInfo.phoneNumber}</p>
                  <p>Opérateur : {paymentInfo.operator}</p>
                </>
              )}
              
              {selectedMethod === 'card' && (
                <>
                  <p>Numéro de carte : **** **** **** {paymentInfo.cardNumber?.slice(-4)}</p>
                  <p>Expiration : {paymentInfo.expiryDate}</p>
                </>
              )}
              
              <p className="text-center font-bold text-orange-600 mt-4">
                Total : {totalCount > 0 ? `${totalCount * 15000}` : 'Calcul en cours...'} FCFA
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <button type="button" onClick={() => setStep(2)} 
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400">
                Modifier
              </button>
              <button onClick={confirmPayment} disabled={isProcessing} 
                className="bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50">
                {isProcessing ? "Confirmation..." : "Confirmer le paiement"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}