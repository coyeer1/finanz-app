"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth, requireAdminAccess } from "@/lib/auth";
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

// OWNER no es asignable desde aqui (la transferencia de propiedad es aparte)
const updateRoleSchema = z.object({
  userId: z.string().min(1),
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

// Helper ligero: solo la moneda de la org (un lookup por PK). Para pasar
// la moneda correcta a los componentes que formatean montos.
export async function getOrgCurrency(): Promise<string> {
  try {
    const organizationId = await getOrganizationId();
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { currency: true },
    });
    return org?.currency ?? "COP";
  } catch {
    return "COP";
  }
}

export async function updateOrganization(data: unknown) {
  try {
    await requireAdminAccess();
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

export async function updateMemberRole(userId: string, role: string) {
  try {
    const currentUser = await requireAdminAccess();
    const organizationId = await getOrganizationId();

    const parsed = updateRoleSchema.safeParse({ userId, role });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // No puedes cambiar tu propio rol (evita auto-bloqueo)
    if (userId === currentUser.id) {
      return { success: false, error: "No puedes cambiar tu propio rol" };
    }

    // El miembro debe pertenecer a la misma organizacion
    const member = await prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: { id: true, role: true },
    });
    if (!member) {
      return { success: false, error: "Miembro no encontrado" };
    }

    // El rol del propietario no se puede cambiar desde aqui
    if (member.role === "OWNER") {
      return {
        success: false,
        error: "No se puede cambiar el rol del propietario",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
    });

    revalidatePath("/settings/organization");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al cambiar el rol",
    };
  }
}

export async function createInviteToken(email: string, role: string) {
  try {
    await requireAdminAccess();
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

// Vista previa de una invitacion (sin requerir auth ni que el email
// coincida) para renderizar la pagina /invite/[token]. El token es un
// secreto de 32 bytes, conocerlo es prueba suficiente para ver el detalle.
export async function getInvitePreview(token: string) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
  });

  if (!invite) {
    return { valid: false as const, error: "Invitacion no encontrada" };
  }
  if (invite.usedAt) {
    return { valid: false as const, error: "Esta invitacion ya fue utilizada" };
  }
  if (new Date() > invite.expiresAt) {
    return { valid: false as const, error: "Esta invitacion ha expirado" };
  }

  const organization = await prisma.organization.findUnique({
    where: { id: invite.organizationId },
    select: { name: true },
  });

  return {
    valid: true as const,
    email: invite.email,
    role: invite.role as string,
    organizationName: organization?.name ?? "la organizacion",
  };
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
