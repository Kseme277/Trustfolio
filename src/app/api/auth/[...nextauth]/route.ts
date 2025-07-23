// Fichier : src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Configuration simplifiée de NextAuth
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        phoneNumber: { label: "Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.phoneNumber) {
          return null;
        }

        let user = null;
        
        if (credentials.email) {
          user = await prisma.user.findUnique({ 
            where: { email: credentials.email.toLowerCase().trim() } 
          });
        } else if (credentials.phoneNumber) {
          const cleanPhone = credentials.phoneNumber.replace(/\D/g, '');
          user = await prisma.user.findFirst({ 
            where: { phoneNumber: cleanPhone } 
          });
        }

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password || '', user.password);
        if (!isPasswordValid) {
          return null;
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: '/connexion'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };