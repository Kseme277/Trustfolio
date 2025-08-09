import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter/adapter';
import type { NextAuthOptions } from '@auth/core';
import { eq } from '@libsql/drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userResult = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        const user = userResult[0];

        if (!user) {
          return null;
        }

        // Vérification simple du mot de passe (à améliorer avec bcrypt)
        if (user.password === credentials.password) {
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
};