import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";

import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.hashedPassword) {
          return null;
        }

        const isValidPassword = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userWithRole = user as { id?: string; role?: string; email?: string; name?: string };
        return {
          ...token,
          id: userWithRole.id,
          role: userWithRole.role,
          email: userWithRole.email,
          name: userWithRole.name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const sessionUser = session.user as Record<string, unknown>;
        sessionUser.id = token.id as string;
        sessionUser.role = token.role as string;
        sessionUser.email = token.email as string;
        sessionUser.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
};
