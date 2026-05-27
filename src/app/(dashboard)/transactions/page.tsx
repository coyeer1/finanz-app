import { Suspense } from "react";
import { getCategories } from "@/actions/categories";
import { getAccounts } from "@/actions/accounts";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TableRowSkeleton } from "@/components/shared/loading-skeleton";
import { TransactionsClientWrapper } from "./transactions-client";

export const metadata = {
  title: "Transacciones",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const [categoriesResult, accountsResult] = await Promise.all([
    getCategories(),
    getAccounts(),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data ?? [] : [];
  const accounts = accountsResult.success ? accountsResult.data ?? [] : [];

  // Build initial filters from search params
  const initialFilters: Record<string, string> = {};
  const filterKeys = ["type", "categoryId", "accountId", "dateFrom", "dateTo", "isPersonal", "search"];
  for (const key of filterKeys) {
    const val = params[key];
    if (typeof val === "string" && val) {
      initialFilters[key] = val;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Transacciones
        </h1>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-12 skeleton rounded-[var(--radius-md)]" />}>
        <TransactionFilters categories={categories} accounts={accounts} />
      </Suspense>

      {/* Table + modal wrapper */}
      <Suspense
        fallback={
          <div className="rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary overflow-hidden">
            <div className="divide-y divide-border-primary">
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <TransactionsClientWrapper
          categories={categories}
          accounts={accounts}
          initialFilters={initialFilters}
        />
      </Suspense>
    </div>
  );
}
