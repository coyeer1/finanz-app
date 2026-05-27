"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth } from "@/lib/auth";
import { categorySchema } from "@/schemas/category";

export async function getCategories(type?: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const where: Record<string, unknown> = {
      organizationId,
    };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: categories };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener las categorias",
    };
  }
}

export async function createCategory(data: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, icon, color, type } = parsed.data;

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type,
        organizationId,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");

    return { success: true, data: category };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, error: "Ya existe una categoria con ese nombre" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la categoria",
    };
  }
}

export async function updateCategory(id: string, data: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verify category belongs to org
    const existing = await prisma.category.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      return { success: false, error: "Categoria no encontrada" };
    }

    const { name, icon, color } = parsed.data;

    const category = await prisma.category.update({
      where: { id },
      data: { name, icon, color },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");

    return { success: true, data: category };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { success: false, error: "Ya existe una categoria con ese nombre" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar la categoria",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const existing = await prisma.category.findFirst({
      where: { id, organizationId },
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
      return { success: false, error: "Categoria no encontrada" };
    }

    if (existing._count.transactions > 0) {
      return {
        success: false,
        error: "No puedes eliminar una categoria con transacciones asociadas",
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar la categoria",
    };
  }
}
