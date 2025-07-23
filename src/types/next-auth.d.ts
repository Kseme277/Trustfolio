// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  /**
   * On étend le type Session pour inclure l'ID de l'utilisateur.
   */
  interface Session {
    user: {
      id: string; // L'ID de notre base de données
    } & DefaultSession['user'];
  }
}