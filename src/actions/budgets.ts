"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth, requireWriteAccess } from "@/lib/auth";
import { budgetSchema } from "@/schemas/budget";

export async function getBudgets(month: number, year: number) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const budgets = await prisma.budget.findMany({
      where: { organizationId, month, year },
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });

    // Calculate actual spent per category for the given month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const categoryIds = budgets.map((b: typeof budgets[number]) => b.categoryId);

    const spentByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        organizationId,
        type: "EXPENSE",
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
        categoryId: { in: categoryIds },
      },
      _sum: { amount: true },
    });

    const spentMap = new Map(
      spentByCategory.map((s: typeof spentByCategory[number]) => [
        s.categoryId,
        Number(s._sum.amount ?? 0),
      ])
    );

    const data = budgets.map((b: typeof budgets[number]) => ({
      ...b,
      amount: Number(b.amount),
      spent: spentMap.get(b.categoryId) ?? 0,
    }));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener los presupuestos",
    };
  }
}

export async function createBudget(data: unknown) {
  try {
    await requireWriteAccess();
    const organizationId = await getOrganizationId();

    const parsed = budgetSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { amount, month, year, categoryId } = parsed.data;

    // Verify category belongs to org
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!category) {
      return { success: false, error: "Categoria no encontrada" };
    }

    // Upsert: if budget already exists for same category/month/year, update it
    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year_organizationId: {
          categoryId,
          month,
          year,
          organizationId,
        },
      },
      update: { amount },
      create: {
        amount,
        month,
        year,
        categoryId,
        organizationId,
      },
      include: { category: true },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...budget,
        amount: Number(budget.amount),
        spent: Number(budget.spent),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el presupuesto",
    };
  }
}

export async function deleteBudget(id: string) {
  try {
    await requireWriteAccess();
    const organizationId = await getOrganizationId();

    const existing = await prisma.budget.findFirst({
      where: { id, organizationId },
    });
    if (!existing) {
      return { success: false, error: "Presupuesto no encontrado" };
    }

    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el presupuesto",
    };
  }
}

export async function copyBudgetsFromPreviousMonth(month: number, year: number) {
  try {
    await requireWriteAccess();
    const organizationId = await getOrganizationId();

    // Calculate previous month
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const previousBudgets = await prisma.budget.findMany({
      where: { organizationId, month: prevMonth, year: prevYear },
    });

    if (previousBudgets.length === 0) {
      return {
        success: false,
        error: "No se encontraron presupuestos del mes anterior",
      };
    }

    // Create budgets for the target month using upsert to avoid duplicates
    const created = await prisma.$transaction(
      previousBudgets.map((b: typeof previousBudgets[number]) =>
        prisma.budget.upsert({
          where: {
            categoryId_month_year_organizationId: {
              categoryId: b.categoryId,
              month,
              year,
              organizationId,
            },
          },
          update: { amount: b.amount },
          create: {
            amount: b.amount,
            month,
            year,
            categoryId: b.categoryId,
            organizationId,
          },
          include: { category: true },
        })
      )
    );

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: created.map((b: typeof created[number]) => ({
        ...b,
        amount: Number(b.amount),
        spent: Number(b.spent),
      })),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al copiar los presupuestos",
    };
  }
}
