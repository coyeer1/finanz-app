import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("[auth] Zod validation failed:", parsed.error.message);
            return null;
          }

          console.log("[auth] Looking up user:", parsed.data.email);
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
          });

          if (!user) {
            console.error("[auth] User not found");
            return null;
          }

          if (!user.hashedPassword) {
            console.error("[auth] User has no password (OAuth only)");
            return null;
          }

          console.log("[auth] User found, comparing password...");
          const isValid = await bcrypt.compare(
            parsed.data.password,
            user.hashedPassword
          );

          if (!isValid) {
            console.error("[auth] Password mismatch");
            return null;
          }

          console.log("[auth] Login successful for:", user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("[auth] authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
          if (!existing.image && user.image) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { image: user.image },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { organizationId: true, role: true },
        });
        token.organizationId = dbUser?.organizationId;
        token.role = dbUser?.role;
      }

      if (trigger === "update" && session) {
        token.organizationId = session.organizationId;
        token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | null;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

export async function getOrganizationId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No organization found");
  }
  return session.user.organizationId;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
