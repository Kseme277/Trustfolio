'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface WhatsAppStatus {
  connected: boolean;
  status: string;
  timestamp: string;
}

export default function WhatsAppAdminPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhoneNumber) {
      toast.error('Veuillez entrer un numéro de téléphone');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Message de test envoyé avec succès!');
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi du message de test');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de test:', error);
      toast.error('Erreur lors de l\'envoi du message de test');
    } finally {
      setSendingTest(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Administration WhatsApp
          </h1>

          {/* Statut du service */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Statut du Service
            </h2>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={checkStatus}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Vérification...' : 'Actualiser'}
              </button>
              
              {status && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {status.connected ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              )}
            </div>

            {status && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test d'envoi de message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test d'Envoi
            </h2>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de téléphone de test
                </label>
                <input
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="237 69 18 31 91"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <button
                onClick={sendTestMessage}
                disabled={sendingTest || !testPhoneNumber}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {sendingTest ? 'Envoi...' : 'Envoyer Test'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Instructions
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• <strong>MODE SIMULATION ACTIVÉ</strong> - WhatsApp simulé pour les tests</li>
              <li>• Les messages sont affichés dans la console du serveur</li>
              <li>• Le statut se met à jour automatiquement toutes les 30 secondes</li>
              <li>• Utilisez le test d'envoi pour vérifier la simulation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 