import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Charger le worker PDF.js depuis un CDN (nécessaire pour react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  lang?: string;
}

const LABELS = {
  fr: { loading: 'Chargement du PDF...', error: 'Impossible d’afficher le PDF.' },
  en: { loading: 'Loading PDF...', error: 'Unable to display PDF.' },
  de: { loading: 'PDF wird geladen...', error: 'PDF kann nicht angezeigt werden.' },
  es: { loading: 'Cargando PDF...', error: 'No se puede mostrar el PDF.' },
  ar: { loading: 'جارٍ تحميل PDF...', error: 'تعذر عرض ملف PDF.' },
};

export default function PDFViewer({ fileUrl, lang = 'fr' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const labels = LABELS[lang as keyof typeof LABELS] || LABELS.fr;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function onError() {
    setError(labels.error);
  }

  return (
    <div className="w-full flex flex-col items-center">
      {error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onError}
            loading={<div className="text-center py-8">{labels.loading}</div>}
            error={<div className="text-red-500 text-center py-8">{labels.error}</div>}
          >
            <Page pageNumber={pageNumber} width={600} />
          </Document>
          {numPages && numPages > 1 && (
            <div className="flex gap-4 mt-4 items-center">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
              >
                {lang === 'ar' ? 'التالي' : 'Précédent'}
              </button>
              <span>
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
                className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
              >
                {lang === 'ar' ? 'السابق' : 'Suivant'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 