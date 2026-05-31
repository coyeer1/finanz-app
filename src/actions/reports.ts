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

    // Las 3 agregaciones en paralelo (1 round-trip en vez de 3 en serie)
    const [balanceResult, currentMonthAgg, prevMonthAgg] = await Promise.all([
      prisma.account.aggregate({
        where: { organizationId, isActive: true },
        _sum: { currentBalance: true },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          ...baseWhere,
          date: { gte: currentMonthStart, lte: currentMonthEnd },
          type: { in: ["INCOME", "EXPENSE"] },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: {
          ...baseWhere,
          date: { gte: prevMonthStart, lte: prevMonthEnd },
          type: { in: ["INCOME", "EXPENSE"] },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalBalance = Number(balanceResult._sum.currentBalance ?? 0);

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
    const rangeStart = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1),
      1
    );

    // Una sola query agrupada por mes en vez de N round-trips a la DB
    const rows = await prisma.$queryRaw<
      { ym: string; type: string; total: number }[]
    >`
      SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS ym,
             "type",
             COALESCE(SUM("amount"), 0)::float8 AS total
      FROM "Transaction"
      WHERE "organizationId" = ${organizationId}
        AND "deletedAt" IS NULL
        AND "type" IN ('INCOME', 'EXPENSE')
        AND "date" >= ${rangeStart}
      GROUP BY 1, 2
    `;

    const byMonth = new Map<string, { income: number; expense: number }>();
    for (const r of rows) {
      const entry = byMonth.get(r.ym) ?? { income: 0, expense: 0 };
      if (r.type === "INCOME") entry.income = Number(r.total);
      else entry.expense = Number(r.total);
      byMonth.set(r.ym, entry);
    }

    const results: { month: string; income: number; expense: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const entry = byMonth.get(key) ?? { income: 0, expense: 0 };
      results.push({
        month: `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`,
        income: entry.income,
        expense: entry.expense,
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
