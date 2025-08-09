// Fichier : src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
// Configuration simplifiée de NextAuth
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
          user = await db.select().from(users).where(eq(users.email, credentials.email.toLowerCase().trim())).limit(1).then(result => result[0] || null);
        } else if (credentials.phoneNumber) {
          const cleanPhone = credentials.phoneNumber.replace(/\D/g, '');
          user = await db.select().from(users).where(eq(users.phoneNumber, cleanPhone)).limit(1).then(result => result[0] || null);
        }
        if (!user || !user.password) {
          return null;
        }
        const isPasswordValid = await bcrypt.compare(credentials.password || '', user.password);
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phoneNumber: user.phoneNumber
        };
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: '/connexion'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.phoneNumber = token.phoneNumber;
      }
      return session;
    }
  }
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };