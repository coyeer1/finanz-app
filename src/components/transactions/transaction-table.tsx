"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import type { TransactionWithRelations } from "@/types";

interface TransactionTableProps {
  transactions: TransactionWithRelations[];
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  currency?: string;
}

export function TransactionTable({
  transactions,
  hasMore,
  onLoadMore,
  currency = "COP",
}: TransactionTableProps) {
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      await onLoadMore();
    } finally {
      setLoading(false);
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "INCOME":
        return "text-accent-primary";
      case "EXPENSE":
        return "text-accent-danger";
      case "TRANSFER":
        return "text-accent-info";
      default:
        return "text-text-primary";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "INCOME":
        return "+";
      case "EXPENSE":
        return "-";
      default:
        return "";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "INCOME":
        return "Ingreso";
      case "EXPENSE":
        return "Gasto";
      case "TRANSFER":
        return "Transferencia";
      default:
        return type;
    }
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="animate-in animate-delay-2 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary overflow-hidden">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[100px_1fr_120px_120px_90px_120px] items-center gap-2 px-4 h-10 border-b border-border-primary">
        <span className="text-xs font-medium text-text-muted">Fecha</span>
        <span className="text-xs font-medium text-text-muted">Descripcion</span>
        <span className="text-xs font-medium text-text-muted">Categoria</span>
        <span className="text-xs font-medium text-text-muted">Cuenta</span>
        <span className="text-xs font-medium text-text-muted">Tipo</span>
        <span className="text-xs font-medium text-text-muted text-right">
          Monto
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-primary">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="transaction-row grid grid-cols-[1fr_auto] md:grid-cols-[100px_1fr_120px_120px_90px_120px] items-center gap-2 px-4"
          >
            {/* Date */}
            <span className="hidden md:block font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-secondary">
              {formatDateShort(tx.date)}
            </span>

            {/* Description + category dot (mobile: combined row) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="category-dot"
                style={{ background: tx.category.color }}
              />
              <div className="min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {tx.description}
                </p>
                <p className="md:hidden text-xs text-text-muted">
                  {tx.category.name} · {formatDateShort(tx.date)}
                </p>
              </div>
            </div>

            {/* Category (desktop) */}
            <span className="hidden md:block text-xs text-text-secondary truncate">
              {tx.category.name}
            </span>

            {/* Account (desktop) */}
            <span className="hidden md:block text-xs text-text-secondary truncate">
              {tx.account.name}
            </span>

            {/* Type tag (desktop) */}
            <div className="hidden md:flex items-center gap-1.5">
              <span
                className={cn(
                  tx.isPersonal ? "tag-personal" : "tag-empresa"
                )}
              >
                {tx.isPersonal ? "Per" : "Emp"}
              </span>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-end gap-2">
              <span className="md:hidden">
                {!tx.isPersonal && (
                  <span className="tag-empresa mr-1.5">Emp</span>
                )}
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium tabular-nums",
                  getAmountColor(tx.type)
                )}
              >
                {getAmountPrefix(tx.type)}
                {formatCurrency(Number(tx.amount), currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center py-3 border-t border-border-primary">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar mas"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
