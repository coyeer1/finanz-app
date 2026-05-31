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
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
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

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

// Roles con permiso de escritura sobre datos financieros (no VIEWER)
export const WRITE_ROLES: Role[] = ["OWNER", "ADMIN", "MEMBER"];
// Roles con permiso de gestion de la organizacion (ajustes, invitaciones)
export const ADMIN_ROLES: Role[] = ["OWNER", "ADMIN"];

export async function requireRole(allowed: Role[]) {
  const user = await requireAuth();
  const role = (user.role ?? "VIEWER") as Role;
  if (!allowed.includes(role)) {
    throw new Error("No tienes permiso para realizar esta accion");
  }
  return user;
}

// Bloquea a los VIEWER de crear/editar/eliminar datos
export async function requireWriteAccess() {
  return requireRole(WRITE_ROLES);
}

// Solo OWNER/ADMIN pueden gestionar la organizacion
export async function requireAdminAccess() {
  return requireRole(ADMIN_ROLES);
}

// Rol del usuario actual (para gating en server components)
export async function getUserRole(): Promise<Role> {
  const session = await auth();
  return (session?.user?.role ?? "VIEWER") as Role;
}
