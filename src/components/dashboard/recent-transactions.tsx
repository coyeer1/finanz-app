"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { TransactionWithRelations } from "@/types";

export function RecentTransactions({
  transactions,
  currency = "COP",
}: {
  transactions: TransactionWithRelations[];
  currency?: string;
}) {
  return (
    <div className="animate-in animate-delay-4 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Últimas transacciones
        </h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-0.5">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="transaction-row flex items-center justify-between px-2 rounded-[var(--radius-sm)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="category-dot"
                style={{ background: tx.category.color }}
              />
              <div className="min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-text-muted">
                  {tx.category.name} · {formatDateShort(tx.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {!tx.isPersonal && <span className="tag-empresa">Emp</span>}
              <span
                className={`font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium ${
                  tx.type === "INCOME"
                    ? "text-accent-primary"
                    : "text-accent-danger"
                }`}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatCurrency(Number(tx.amount), currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
