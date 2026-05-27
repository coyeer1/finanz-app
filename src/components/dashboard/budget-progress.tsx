"use client";

import { formatCurrency, percentOf } from "@/lib/utils";
import type { BudgetWithCategory } from "@/types";

export function BudgetProgress({
  budgets,
  currency = "COP",
}: {
  budgets: BudgetWithCategory[];
  currency?: string;
}) {
  if (budgets.length === 0) return null;

  return (
    <div className="animate-in animate-delay-4 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
      <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary mb-4">
        Presupuestos activos
      </h3>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = Number(budget.spent);
          const total = Number(budget.amount);
          const pct = percentOf(spent, total);
          const level = pct >= 100 ? "danger" : pct >= 80 ? "warning" : "normal";

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="category-dot"
                    style={{ background: budget.category.color }}
                  />
                  <span className="text-sm text-text-secondary">
                    {budget.category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-secondary">
                    {formatCurrency(spent, currency)} / {formatCurrency(total, currency)}
                  </span>
                  <span
                    className={`font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium ${
                      level === "danger"
                        ? "text-accent-danger"
                        : level === "warning"
                          ? "text-accent-warning"
                          : "text-text-muted"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="budget-bar-track">
                <div
                  className="budget-bar-fill"
                  data-level={level}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
