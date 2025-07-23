// Fichier : src/app/confirmation/[transactionId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';

export default function ConfirmationPage() {
  const { transactionId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { clear } = useCartStore();

  useEffect(() => {
    // Réinitialiser le panier
    clear();

    // Récupérer les détails de la commande
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/confirmation/${transactionId}`);
        if (!res.ok) throw new Error("Erreur lors de la récupération de la commande");
        const data = await res.json();
        setOrderDetails(data);
      } catch (error) {
        toast.error("Impossible de charger les détails de la commande");
      }
    };

    fetchOrderDetails();
  }, [transactionId, clear]);

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Confirmation de commande</h1>
      {orderDetails ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-green-600 text-center mb-4">Merci pour votre commande !</p>
          <p>Numéro de transaction: {transactionId}</p>
          {/* Affichez ici les détails de la commande */}
        </div>
      ) : (
        <p className="text-center">Chargement des détails de la commande...</p>
      )}
    </div>
  );
}