"use server";

import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth } from "@/lib/auth";
import { MONTHS } from "@/lib/constants";
import { transactionFilterSchema } from "@/schemas/transaction";

export async function getDashboardStats(isPersonal?: boolean) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const baseWhere: Record<string, unknown> = {
      organizationId,
      deletedAt: null,
    };
    if (isPersonal !== undefined) {
      baseWhere.isPersonal = isPersonal;
    }

    // Total balance from all active accounts
    const balanceResult = await prisma.account.aggregate({
      where: { organizationId, isActive: true },
      _sum: { currentBalance: true },
    });
    const totalBalance = Number(balanceResult._sum.currentBalance ?? 0);

    // Current month income & expense
    const currentMonthAgg = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        ...baseWhere,
        date: { gte: currentMonthStart, lte: currentMonthEnd },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      _sum: { amount: true },
    });

    const monthIncome = Number(
      currentMonthAgg.find(
        (a: typeof currentMonthAgg[number]) => a.type === "INCOME"
      )?._sum.amount ?? 0
    );
    const monthExpense = Number(
      currentMonthAgg.find(
        (a: typeof currentMonthAgg[number]) => a.type === "EXPENSE"
      )?._sum.amount ?? 0
    );

    // Previous month income & expense
    const prevMonthAgg = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        ...baseWhere,
        date: { gte: prevMonthStart, lte: prevMonthEnd },
        type: { in: ["INCOME", "EXPENSE"] },
      },
      _sum: { amount: true },
    });

    const prevIncome = Number(
      prevMonthAgg.find(
        (a: typeof prevMonthAgg[number]) => a.type === "INCOME"
      )?._sum.amount ?? 0
    );
    const prevExpense = Number(
      prevMonthAgg.find(
        (a: typeof prevMonthAgg[number]) => a.type === "EXPENSE"
      )?._sum.amount ?? 0
    );

    const incomeChange =
      prevIncome === 0 ? 0 : Math.round(((monthIncome - prevIncome) / prevIncome) * 100);
    const expenseChange =
      prevExpense === 0
        ? 0
        : Math.round(((monthExpense - prevExpense) / prevExpense) * 100);

    return {
      success: true,
      data: {
        totalBalance,
        monthIncome,
        monthExpense,
        netSavings: monthIncome - monthExpense,
        incomeChange,
        expenseChange,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener estadisticas",
    };
  }
}

export async function getMonthlyTrends(months: number = 6) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const now = new Date();
    const results: { month: string; income: number; expense: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const agg = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          organizationId,
          deletedAt: null,
          date: { gte: monthStart, lte: monthEnd },
          type: { in: ["INCOME", "EXPENSE"] },
        },
        _sum: { amount: true },
      });

      const monthIndex = date.getMonth();
      const monthLabel = `${MONTHS[monthIndex].slice(0, 3)} ${date.getFullYear()}`;

      results.push({
        month: monthLabel,
        income: Number(
          agg.find((a: typeof agg[number]) => a.type === "INCOME")?._sum.amount ?? 0
        ),
        expense: Number(
          agg.find((a: typeof agg[number]) => a.type === "EXPENSE")?._sum.amount ?? 0
        ),
      });
    }

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener tendencias mensuales",
    };
  }
}

export async function getCategoryBreakdown(
  month: number,
  year: number,
  type?: string,
  isPersonal?: boolean
) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const where: Record<string, unknown> = {
      organizationId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
    };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    } else {
      // Default to EXPENSE if no type specified
      where.type = "EXPENSE";
    }

    if (isPersonal !== undefined) {
      where.isPersonal = isPersonal;
    }

    const grouped = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
      _count: { id: true },
    });

    if (grouped.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch category details
    const categoryIds = grouped.map(
      (g: typeof grouped[number]) => g.categoryId
    );
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds }, organizationId },
    });

    const categoryMap = new Map(
      categories.map((c: typeof categories[number]) => [c.id, c])
    );

    const totalAmount = grouped.reduce(
      (sum: number, g: typeof grouped[number]) => sum + Number(g._sum.amount ?? 0),
      0
    );

    const data = grouped
      .map((g: typeof grouped[number]) => {
        const cat = categoryMap.get(g.categoryId);
        const amount = Number(g._sum.amount ?? 0);
        return {
          name: cat?.name ?? "Sin categoria",
          icon: cat?.icon ?? "help-circle",
          color: cat?.color ?? "#6b7280",
          amount,
          percentage: totalAmount === 0 ? 0 : Math.round((amount / totalAmount) * 100),
          count: g._count.id,
        };
      })
      .sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount);

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener desglose por categoria",
    };
  }
}

export async function getRecentTransactions(limit: number = 5) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const transactions = await prisma.transaction.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return {
      success: true,
      data: transactions.map((t: typeof transactions[number]) => ({
        ...t,
        amount: Number(t.amount),
        account: {
          ...t.account,
          initialBalance: Number(t.account.initialBalance),
          currentBalance: Number(t.account.currentBalance),
        },
      })),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener transacciones recientes",
    };
  }
}

export async function exportTransactionsCSV(filters: unknown) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = transactionFilterSchema.safeParse(filters ?? {});
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { type, categoryId, accountId, isPersonal, dateFrom, dateTo, search } =
      parsed.data;

    const where: Record<string, unknown> = {
      organizationId,
      deletedAt: null,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (isPersonal !== undefined) where.isPersonal = isPersonal;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.date = dateFilter;
    }

    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });

    // Build CSV
    const headers = [
      "Fecha",
      "Tipo",
      "Descripcion",
      "Monto",
      "Categoria",
      "Cuenta",
      "Usuario",
      "Personal",
      "Notas",
    ];

    const rows = transactions.map((t: typeof transactions[number]) => {
      const date = new Date(t.date).toISOString().split("T")[0];
      const typeLabel =
        t.type === "INCOME"
          ? "Ingreso"
          : t.type === "EXPENSE"
            ? "Gasto"
            : "Transferencia";
      const amount = Number(t.amount).toFixed(2);
      const description = `"${t.description.replace(/"/g, '""')}"`;
      const category = `"${t.category.name}"`;
      const account = `"${t.account.name}"`;
      const user = `"${t.user.name ?? t.user.email}"`;
      const personal = t.isPersonal ? "Si" : "No";
      const notes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "";

      return [
        date,
        typeLabel,
        description,
        amount,
        category,
        account,
        user,
        personal,
        notes,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return { success: true, data: csv };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al exportar transacciones",
    };
  }
}
