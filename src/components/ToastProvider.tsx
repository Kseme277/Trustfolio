// src/components/ToastProvider.tsx
'use client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importe le CSS de Toastify

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Configuration du conteneur de toasts */}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </>
  );
}