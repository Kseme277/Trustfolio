// Fichier : src/app/compte/mes-livres/read/[orderId]/page.tsx
'use client'; // Ce composant est interactif et s'exécute côté client

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Icônes de navigation
import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/LanguageProvider';

// Import des types depuis le fichier centralisé (app.d.ts)
import { Order, BookInfo, ValueInfo, CharacterInfo } from '@/types/app.d'; 

// La fonction generateBookContent n'est pas utilisée ici car le contenu vient de l'API/DB
// import { generateBookContent } from '@/lib/bookContentGenerator'; 

// Textes multilingues pour les actions PDF
const PDF_LABELS = {
  fr: { read: 'Lire le livre (PDF)', download: 'Télécharger le PDF', loading: 'Chargement du PDF...', error: 'Impossible d’afficher le PDF.' },
  en: { read: 'Read the book (PDF)', download: 'Download PDF', loading: 'Loading PDF...', error: 'Unable to display PDF.' },
  de: { read: 'Buch lesen (PDF)', download: 'PDF herunterladen', loading: 'PDF wird geladen...', error: 'PDF kann nicht angezeigt werden.' },
  es: { read: 'Leer el libro (PDF)', download: 'Descargar PDF', loading: 'Cargando PDF...', error: 'No se puede mostrar el PDF.' },
  ar: { read: 'قراءة الكتاب (PDF)', download: 'تحميل PDF', loading: 'جارٍ تحميل PDF...', error: 'تعذر عرض ملف PDF.' },
};

// Chargement dynamique de react-pdf (évite erreur SSR)
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false, loading: () => <div>Chargement du PDF...</div> });

export default function ReadBookPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params; // L'ID de la commande est récupéré des paramètres d'URL
  const router = useRouter(); // Hook pour la navigation
  
  // --- États du composant de lecture ---
  const [order, setOrder] = useState<Order | null>(null); // Les détails de la commande chargée
  const [isLoading, setIsLoading] = useState(true); // Indique si les données sont en cours de chargement
  const [currentProgress, setCurrentProgress] = useState(0); // Progression de lecture actuelle (0-100%)
  const [bookContentPages, setBookContentPages] = useState<string[]>([]); // Le contenu du livre, divisé en pages simulées
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // L'index de la page actuellement affichée

  // Charge les détails complets de la commande au montage du composant
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Appelle l'API /api/orders pour récupérer la commande spécifique par son ID
        // Le paramètre `status=all` est important pour s'assurer de récupérer la commande
        // même si son statut n'est pas "COMPLETED" (bien que nous la redirigions ensuite si ce n'est pas le cas).
        const res = await fetch(`/api/orders?orderId=${orderId}&status=all`); 
        if (!res.ok) throw new Error("Livre introuvable ou non autorisé.");
        
        const data: Order[] = await res.json(); // L'API renvoie un tableau, même pour un unique résultat
        const fetchedOrder = data[0]; // Prend le premier élément du tableau

        if (!fetchedOrder) throw new Error("Livre non trouvé.");

        // Vérifie si le contenu généré est présent. S'il ne l'est pas, affiche une erreur et redirige.
        if (!fetchedOrder.generatedContent) {
          toast.error("Le contenu de ce livre n'a pas encore été généré. Veuillez le générer d'abord.");
          router.push('/compte/mes-livres'); // Redirige vers l'historique des livres
          return; // Sort de la fonction
        }

        // Met à jour les états avec les données de la commande
        setOrder(fetchedOrder);
        setCurrentProgress(fetchedOrder.readProgress);
        
        // Divise le contenu généré (une longue chaîne de texte) en "pages" simulées.
        // On le divise par des doubles sauts de ligne pour simuler des paragraphes/sections de pages.
        const rawContent = fetchedOrder.generatedContent;
        const simulatedPages = rawContent.split(/\n\s*\n/).filter(p => p.trim() !== ''); // Filtre les paragraphes vides
        
        // Assure qu'il y a au moins une page
        setBookContentPages(simulatedPages.length > 0 ? simulatedPages : ["Contenu généré vide."]);

      } catch (error) {
        console.error("Erreur de chargement du livre à lire :", error);
        toast.error("Impossible de charger le livre.");
        router.push('/compte/mes-livres'); // Redirige en cas d'erreur de chargement
      } finally {
        setIsLoading(false); // Indique que le chargement est terminé
      }
    };
    fetchOrderDetails();
  }, [orderId, router]); // Déclenche l'effet quand orderId ou router change

  // Fonction pour sauvegarder la progression de lecture dans la base de données
  const saveProgress = useCallback(async (newProgress: number) => {
    if (!order) return; // Ne fait rien si la commande n'est pas chargée
    try {
      // Appelle l'API pour mettre à jour le champ readProgress de cette commande
      const res = await fetch(`/api/update-read-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, progress: newProgress }),
      });
      if (!res.ok) throw new Error("Impossible de sauvegarder la progression.");
      // toast.success("Progression sauvegardée !"); // Commenté pour ne pas spammer les notifications
    } catch (error: any) {
      toast.error(`Erreur lors de la sauvegarde de la progression : ${error.message}`);
    }
  }, [order]); // Dépend de l'objet 'order'

  // Gère le changement de page (Précédent/Suivant) et met à jour la progression
  const handlePageChange = useCallback((increment: number) => {
    // Calcule le nouvel index de page, en s'assurant qu'il reste dans les limites
    const newPageIndex = Math.max(0, Math.min(bookContentPages.length - 1, currentPageIndex + increment));
    setCurrentPageIndex(newPageIndex); // Met à jour l'index de la page

    // Calcule la progression en pourcentage basée sur la page actuelle
    const newProgress = Math.round(((newPageIndex + 1) / bookContentPages.length) * 100);
    setCurrentProgress(newProgress); // Met à jour la barre de progression

    // Sauvegarde la progression après un court délai pour éviter les appels API trop fréquents
    setTimeout(() => saveProgress(newProgress), 1000); 
  }, [currentPageIndex, bookContentPages.length, saveProgress]); // Dépendances pour useCallback

  const { lang } = useLanguage();

  // --- Conditions d'affichage initiales et de redirection ---
  if (isLoading || !order) return <div className="text-center p-10 text-xl text-gray-700 dark:text-gray-300">Chargement du livre...</div>;
  if (order.status !== 'COMPLETED') return <div className="text-center p-10 text-xl text-red-500">Ce livre n'est pas encore prêt à être lu (statut: {order.status}).</div>;

  // --- NOUVEAU : Si PDF disponible, afficher le lecteur PDF ---
  if (order.pdfUrl) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <button onClick={() => router.back()} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 mb-6 flex items-center gap-1">
            <ChevronLeft size={20} /> Retour
          </button>
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">{order.book?.title} - Pour {order.childName}</h1>
          <div className="mb-6 flex justify-center">
            <a href={order.pdfUrl} target="_blank" rel="noopener noreferrer" download className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              {PDF_LABELS[lang as keyof typeof PDF_LABELS]?.download || PDF_LABELS.fr.download}
            </a>
          </div>
          <div className="w-full min-h-[600px] flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <PDFViewer fileUrl={order.pdfUrl} lang={lang} />
          </div>
        </div>
      </div>
    );
  }

  // Détermine le contenu de la page actuelle
  const currentPageContent = bookContentPages[currentPageIndex];
  // Vérifie si c'est la première ou la dernière page pour désactiver les boutons de navigation
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === bookContentPages.length - 1;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Bouton de retour vers l'historique des livres */}
        <button onClick={() => router.back()} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 mb-6 flex items-center gap-1">
          <ChevronLeft size={20} /> Retour
        </button>

        {/* Titre du livre et nom de l'enfant */}
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">{order.book?.title} - Pour {order.childName}</h1>
        
        {/* Section d'information sur le livre et la personnalisation */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
            {order.book?.coverImage && <Image src={order.book.coverImage} alt="Couverture du livre" layout="fill" objectFit="cover" />}
          </div>
          <div className="flex-grow">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {order.book?.description || "Description non disponible. Imaginez une belle histoire ici !"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 italic">
              Ce livre a été personnalisé avec les valeurs : 
              {order.selectedValues.length > 0 ? (
                order.selectedValues.map((v: ValueInfo) => v.name).join(', ')
              ) : "aucune valeur sélectionnée."}
            </p>
            {order.childPhotoUrl && (
              <div className="mt-4 flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo de l'enfant :</p>
                <Image src={order.childPhotoUrl} alt="Photo de l'enfant" width={40} height={40} className="rounded-full object-cover" />
              </div>
            )}
            {/* Affichage des personnages secondaires si disponibles */}
            {order.characters && order.characters.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personnages secondaires :</p>
                    <div className="flex flex-wrap gap-2">
                        {order.characters.map((char, index) => (
                            <span key={index} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {char.name} ({char.relationshipToHero})
                            </span>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Contenu de la page du livre (simulé) */}
        {/* dangerouslySetInnerHTML est utilisé pour injecter le HTML généré par l'IA */}
        <div className="book-page-content border border-gray-200 dark:border-gray-700 p-6 mt-8 rounded-md min-h-[400px] max-h-[600px] overflow-y-auto leading-relaxed text-gray-700 dark:text-gray-300" 
             dangerouslySetInnerHTML={{ __html: currentPageContent }}>
        </div>

        {/* Barre de progression de lecture et navigation par pages */}
        <div className="mt-10 border-t pt-8 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Progression de Lecture</h2>
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => handlePageChange(-1)} disabled={isFirstPage} className="bg-gray-300 dark:bg-gray-600 p-2 rounded-full text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft size={20} /> Précédent
            </button>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div 
                className="bg-blue-500 h-4 rounded-full text-xs text-white flex items-center justify-center transition-all duration-300" 
                style={{ width: `${currentProgress}%` }}
              >
                {currentProgress}%
              </div>
            </div>
            <button onClick={() => handlePageChange(1)} disabled={isLastPage} className="bg-gray-300 dark:bg-gray-600 p-2 rounded-full text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">Page {currentPageIndex + 1} sur {bookContentPages.length}</p>
          {currentProgress === 100 && (
              <p className="text-center text-green-600 font-semibold mt-4">Félicitations, vous avez terminé ce livre !</p>
          )}
        </div>
      </div>
    </div>
  );
}