"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrganizationId, requireAuth } from "@/lib/auth";
import {
  transactionSchema,
  transactionFilterSchema,
} from "@/schemas/transaction";

export async function getTransactions(filters: unknown) {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = transactionFilterSchema.safeParse(filters);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const {
      type,
      categoryId,
      accountId,
      isPersonal,
      dateFrom,
      dateTo,
      search,
      cursor,
      limit,
    } = parsed.data;

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
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = transactions.length > limit;
    const data = hasMore ? transactions.slice(0, limit) : transactions;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      success: true,
      data: {
        data: data.map((t: typeof transactions[number]) => ({
          ...t,
          amount: Number(t.amount),
          account: {
            ...t.account,
            initialBalance: Number(t.account.initialBalance),
            currentBalance: Number(t.account.currentBalance),
          },
        })),
        hasMore,
        nextCursor,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener transacciones",
    };
  }
}

export async function getTransaction(id: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const transaction = await prisma.transaction.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        category: true,
        account: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) {
      return { success: false, error: "Transaccion no encontrada" };
    }

    return {
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        account: {
          ...transaction.account,
          initialBalance: Number(transaction.account.initialBalance),
          currentBalance: Number(transaction.account.currentBalance),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener la transaccion",
    };
  }
}

export async function createTransaction(data: unknown) {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = transactionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { type, amount, description, notes, date, isPersonal, categoryId, accountId } =
      parsed.data;

    // Verify account belongs to org
    const account = await prisma.account.findFirst({
      where: { id: accountId, organizationId, isActive: true },
    });
    if (!account) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    // Verify category belongs to org
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!category) {
      return { success: false, error: "Categoria no encontrada" };
    }

    const balanceChange = type === "INCOME" ? amount : -amount;

    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type,
          amount,
          description,
          notes,
          date,
          isPersonal,
          categoryId,
          accountId,
          userId: user.id,
          organizationId,
        },
        include: {
          category: true,
          account: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.account.update({
        where: { id: accountId },
        data: {
          currentBalance: { increment: balanceChange },
        },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/accounts");

    return {
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        account: {
          ...transaction.account,
          initialBalance: Number(transaction.account.initialBalance),
          currentBalance: Number(transaction.account.currentBalance),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear la transaccion",
    };
  }
}

export async function updateTransaction(id: string, data: unknown) {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationId();

    const parsed = transactionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verify transaction exists and belongs to org
    const existing = await prisma.transaction.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (!existing) {
      return { success: false, error: "Transaccion no encontrada" };
    }

    const { type, amount, description, notes, date, isPersonal, categoryId, accountId } =
      parsed.data;

    // Verify new account belongs to org
    const newAccount = await prisma.account.findFirst({
      where: { id: accountId, organizationId, isActive: true },
    });
    if (!newAccount) {
      return { success: false, error: "Cuenta no encontrada" };
    }

    // Verify new category belongs to org
    const newCategory = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!newCategory) {
      return { success: false, error: "Categoria no encontrada" };
    }

    // Reverse old amount on old account
    const oldBalanceReverse =
      existing.type === "INCOME" ? -Number(existing.amount) : Number(existing.amount);

    // Apply new amount on new account
    const newBalanceChange = type === "INCOME" ? amount : -amount;

    const operations = [];

    // Reverse on old account
    operations.push(
      prisma.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: oldBalanceReverse } },
      })
    );

    // Apply new balance change (works whether account changed or not)
    operations.push(
      prisma.account.update({
        where: { id: accountId },
        data: { currentBalance: { increment: newBalanceChange } },
      })
    );

    operations.push(
      prisma.transaction.update({
        where: { id },
        data: {
          type,
          amount,
          description,
          notes,
          date,
          isPersonal,
          categoryId,
          accountId,
        },
        include: {
          category: true,
          account: true,
          user: { select: { id: true, name: true, email: true } },
        },
      })
    );

    const results = await prisma.$transaction(operations);
    const transaction = results[results.length - 1] as Awaited<
      ReturnType<typeof prisma.transaction.update>
    > & {
      category: Awaited<ReturnType<typeof prisma.category.findFirst>>;
      account: Awaited<ReturnType<typeof prisma.account.findFirst>>;
      user: { id: string; name: string | null; email: string };
    };

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/accounts");

    return {
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        account: {
          ...transaction.account!,
          initialBalance: Number(transaction.account!.initialBalance),
          currentBalance: Number(transaction.account!.currentBalance),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar la transaccion",
    };
  }
}

export async function deleteTransaction(id: string) {
  try {
    await requireAuth();
    const organizationId = await getOrganizationId();

    const existing = await prisma.transaction.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (!existing) {
      return { success: false, error: "Transaccion no encontrada" };
    }

    // Reverse the amount on the account
    const balanceReverse =
      existing.type === "INCOME" ? -Number(existing.amount) : Number(existing.amount);

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      prisma.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: balanceReverse } },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/accounts");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar la transaccion",
    };
  }
}
