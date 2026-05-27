"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

const updateOrgSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Maximo 100 caracteres"),
  currency: z.string().min(3).max(3),
});

const inviteSchema = z.object({
  email: z.string().email("Email invalido"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export async function getOrganization() {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return { success: false, error: "Organizacion no encontrada" };
    }

    return { success: true, data: organization };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener la organizacion",
    };
  }
}

export async function updateOrganization(data: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = updateOrgSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, currency } = parsed.data;

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: { name, currency },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: organization };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar la organizacion",
    };
  }
}

export async function getOrganizationMembers() {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const members = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: members };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener los miembros",
    };
  }
}

export async function createInviteToken(email: string, role: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = inviteSchema.safeParse({ email, role });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Check if user is already in the org
    const existingUser = await prisma.user.findFirst({
      where: { email: parsed.data.email, organizationId },
    });
    if (existingUser) {
      return {
        success: false,
        error: "Este usuario ya es miembro de la organizacion",
      };
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiry to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.inviteToken.create({
      data: {
        email: parsed.data.email,
        token,
        role: parsed.data.role as "ADMIN" | "MEMBER" | "VIEWER",
        organizationId,
        expiresAt,
      },
    });

    return { success: true, data: token };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al crear la invitacion",
    };
  }
}

export async function acceptInvite(token: string) {
  try {
    const user = await requireAuth();

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!invite) {
      return { success: false, error: "Invitacion no encontrada" };
    }

    if (invite.usedAt) {
      return { success: false, error: "Esta invitacion ya fue utilizada" };
    }

    if (new Date() > invite.expiresAt) {
      return { success: false, error: "Esta invitacion ha expirado" };
    }

    if (invite.email !== user.email) {
      return {
        success: false,
        error: "Esta invitacion no corresponde a tu email",
      };
    }

    // Assign user to the organization with the specified role
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          organizationId: invite.organizationId,
          role: invite.role,
        },
      }),
      prisma.inviteToken.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        organizationId: invite.organizationId,
        role: invite.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al aceptar la invitacion",
    };
  }
}
