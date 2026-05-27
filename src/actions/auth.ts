"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  email: z
    .string({ error: "El email es requerido" })
    .email("Email inválido"),
  password: z
    .string({ error: "La contraseña es requerida" })
    .min(6, "Mínimo 6 caracteres"),
});

const organizationSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(1, "El nombre de la organización es requerido")
    .max(100, "Máximo 100 caracteres"),
  currency: z.string().default("COP"),
});

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      success: false,
      error: "Ya existe una cuenta con este email",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  return { success: true };
}

export async function createOrganization(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name"),
    currency: formData.get("currency") ?? "COP",
  };

  const parsed = organizationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, currency } = parsed.data;

  // Generate unique slug
  let slug = slugify(name);
  const existingOrg = await prisma.organization.findUnique({
    where: { slug },
  });
  if (existingOrg) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Create org, set user as OWNER, create defaults in a transaction
  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        slug,
        currency,
      },
    });

    // Set user as OWNER of this organization
    await tx.user.update({
      where: { id: user.id },
      data: {
        organizationId: org.id,
        role: "OWNER",
      },
    });

    // Create default categories
    const categoryData = [
      ...DEFAULT_CATEGORIES.EXPENSE.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "EXPENSE" as const,
        isDefault: true,
        organizationId: org.id,
      })),
      ...DEFAULT_CATEGORIES.INCOME.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "INCOME" as const,
        isDefault: true,
        organizationId: org.id,
      })),
    ];

    await tx.category.createMany({ data: categoryData });

    // Create 2 default accounts: Efectivo + Banco
    await tx.account.createMany({
      data: [
        {
          name: "Efectivo",
          type: "CASH",
          currency,
          icon: "banknote",
          color: "#22c55e",
          organizationId: org.id,
        },
        {
          name: "Banco",
          type: "BANK",
          currency,
          icon: "landmark",
          color: "#3b82f6",
          organizationId: org.id,
        },
      ],
    });

    return org;
  });

  revalidatePath("/dashboard");

  return { success: true, organizationId: organization.id };
}
