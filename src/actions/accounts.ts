"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth } from "@/lib/auth";
import { accountSchema } from "@/schemas/account";

export async function getAccounts() {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const accounts = await prisma.account.findMany({
      where: { organizationId, isActive: true },
      include: {
        _count: {
          select: {
            transactions: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: accounts.map((a: typeof accounts[number]) => ({
        ...a,
        initialBalance: Number(a.initialBalance),
        currentBalance: Number(a.currentBalance),
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener las cuentas",
    };
  }
}

export async function getAccount(id: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const account = await prisma.account.findFirst({
      where: { id, organizationId, isActive: true },
    });

    if (!account) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    return {
      success: true,
      data: {
        ...account,
        initialBalance: Number(account.initialBalance),
        currentBalance: Number(account.currentBalance),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener la cuenta",
    };
  }
}

export async function createAccount(data: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = accountSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, type, currency, initialBalance, color, icon } = parsed.data;

    const account = await prisma.account.create({
      data: {
        name,
        type,
        currency,
        initialBalance,
        currentBalance: initialBalance,
        color,
        icon,
        organizationId,
      },
    });

    revalidatePath("/accounts");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...account,
        initialBalance: Number(account.initialBalance),
        currentBalance: Number(account.currentBalance),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la cuenta",
    };
  }
}

export async function updateAccount(id: string, data: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = accountSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verify account belongs to org
    const existing = await prisma.account.findFirst({
      where: { id, organizationId, isActive: true },
    });
    if (!existing) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    const { name, type, color, icon, currency } = parsed.data;

    const account = await prisma.account.update({
      where: { id },
      data: { name, type, color, icon, currency },
    });

    revalidatePath("/accounts");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...account,
        initialBalance: Number(account.initialBalance),
        currentBalance: Number(account.currentBalance),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar la cuenta",
    };
  }
}

export async function deleteAccount(id: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const existing = await prisma.account.findFirst({
      where: { id, organizationId, isActive: true },
      include: {
        _count: {
          select: {
            transactions: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    if (existing._count.transactions > 0) {
      return {
        success: false,
        error: "No puedes eliminar una cuenta con transacciones asociadas",
      };
    }

    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/accounts");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar la cuenta",
    };
  }
}

export async function getTotalBalance() {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const result = await prisma.account.aggregate({
      where: { organizationId, isActive: true },
      _sum: { currentBalance: true },
    });

    return {
      success: true,
      data: Number(result._sum.currentBalance ?? 0),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener el balance total",
    };
  }
}
