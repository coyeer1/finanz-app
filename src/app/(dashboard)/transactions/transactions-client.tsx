"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/actions/transactions";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { EmptyState } from "@/components/shared/empty-state";
import type {
  TransactionWithRelations,
  CategoryWithCount,
  AccountWithBalance,
  TransactionFilters,
} from "@/types";
import type { TransactionFormData } from "@/schemas/transaction";

interface TransactionsClientWrapperProps {
  categories: CategoryWithCount[];
  accounts: AccountWithBalance[];
  initialFilters: Record<string, string>;
  currency: string;
}

export function TransactionsClientWrapper({
  categories,
  accounts,
  initialFilters,
  currency,
}: TransactionsClientWrapperProps) {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TransactionWithRelations | null>(null);
  const [loaded, setLoaded] = useState(false);

  const buildFilters = useCallback((): TransactionFilters & { limit: number; cursor?: string } => {
    const filters: TransactionFilters & { limit: number; cursor?: string } = {
      limit: 20,
    };

    const type = searchParams.get("type");
    if (type === "INCOME" || type === "EXPENSE" || type === "TRANSFER") {
      filters.type = type;
    }

    const categoryId = searchParams.get("categoryId");
    if (categoryId) filters.categoryId = categoryId;

    const accountId = searchParams.get("accountId");
    if (accountId) filters.accountId = accountId;

    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get("dateTo");
    if (dateTo) filters.dateTo = dateTo;

    const isPersonal = searchParams.get("isPersonal");
    if (isPersonal === "true") filters.isPersonal = true;
    else if (isPersonal === "false") filters.isPersonal = false;

    const search = searchParams.get("search");
    if (search) filters.search = search;

    return filters;
  }, [searchParams]);

  // Fetch transactions when filters change
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const filters = buildFilters();
      const result = await getTransactions(filters);
      if (cancelled) return;

      if (result.success && result.data) {
        setTransactions(result.data.data as TransactionWithRelations[]);
        setHasMore(result.data.hasMore);
        setNextCursor(result.data.nextCursor);
      } else {
        setTransactions([]);
        setHasMore(false);
        setNextCursor(undefined);
      }
      setLoaded(true);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [buildFilters]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;

    const filters = buildFilters();
    filters.cursor = nextCursor;

    const result = await getTransactions(filters);
    if (result.success && result.data) {
      setTransactions((prev) => [...prev, ...(result.data!.data as TransactionWithRelations[])]);
      setHasMore(result.data.hasMore);
      setNextCursor(result.data.nextCursor);
    }
  }, [nextCursor, buildFilters]);

  const handleSubmit = useCallback(
    async (data: TransactionFormData) => {
      const result = await createTransaction(data);
      if (!result.success) {
        throw new Error(result.error ?? "Error al crear la transaccion");
      }
      // Refresh list
      setShowForm(false);
      const filters = buildFilters();
      const refresh = await getTransactions(filters);
      if (refresh.success && refresh.data) {
        setTransactions(refresh.data.data as TransactionWithRelations[]);
        setHasMore(refresh.data.hasMore);
        setNextCursor(refresh.data.nextCursor);
      }
    },
    [buildFilters]
  );

  const handleUpdate = useCallback(
    async (data: TransactionFormData) => {
      if (!editing) return;
      const result = await updateTransaction(editing.id, data);
      if (!result.success) {
        throw new Error(result.error ?? "Error al actualizar la transaccion");
      }
      setEditing(null);
      const refresh = await getTransactions(buildFilters());
      if (refresh.success && refresh.data) {
        setTransactions(refresh.data.data as TransactionWithRelations[]);
        setHasMore(refresh.data.hasMore);
        setNextCursor(refresh.data.nextCursor);
      }
    },
    [editing, buildFilters]
  );

  const handleDelete = useCallback(async () => {
    if (!editing) return;
    const result = await deleteTransaction(editing.id);
    if (!result.success) {
      throw new Error(result.error ?? "Error al eliminar la transaccion");
    }
    setEditing(null);
    const refresh = await getTransactions(buildFilters());
    if (refresh.success && refresh.data) {
      setTransactions(refresh.data.data as TransactionWithRelations[]);
      setHasMore(refresh.data.hasMore);
      setNextCursor(refresh.data.nextCursor);
    }
  }, [editing, buildFilters]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      {/* New transaction button */}
      <div className="flex justify-end animate-in animate-delay-1">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva transaccion
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          variant="transactions"
          action={{
            label: "Crear transaccion",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <TransactionTable
          transactions={transactions}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onRowClick={setEditing}
          currency={currency}
        />
      )}

      {/* New transaction modal */}
      {showForm && (
        <TransactionForm
          categories={categories}
          accounts={accounts}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit transaction modal */}
      {editing && (
        <TransactionForm
          categories={categories}
          accounts={accounts}
          defaultValues={{
            type: editing.type,
            amount: Number(editing.amount),
            description: editing.description,
            categoryId: editing.categoryId,
            accountId: editing.accountId,
            date: new Date(editing.date),
            notes: editing.notes,
            isPersonal: editing.isPersonal,
          }}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
