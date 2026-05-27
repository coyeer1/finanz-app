"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import {
  createBudget,
  deleteBudget,
  copyBudgetsFromPreviousMonth,
  getBudgets,
} from "@/actions/budgets";
import { CurrencyInput } from "@/components/shared/currency-input";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatCurrency, percentOf } from "@/lib/utils";
import { MONTHS } from "@/lib/constants";
import type { BudgetWithCategory, CategoryWithCount } from "@/types";

interface BudgetsClientProps {
  categories: CategoryWithCount[];
  initialBudgets: any[];
  month: number;
  year: number;
}

export function BudgetsClient({
  categories,
  initialBudgets,
  month,
  year,
}: BudgetsClientProps) {
  const router = useRouter();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [showForm, setShowForm] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const navigateMonth = useCallback(
    (direction: -1 | 1) => {
      let newMonth = month + direction;
      let newYear = year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      router.push(`/budgets?month=${newMonth}&year=${newYear}`);
    },
    [month, year, router]
  );

  const refreshBudgets = useCallback(async () => {
    const result = await getBudgets(month, year);
    if (result.success && result.data) {
      setBudgets(result.data as any[]);
    }
  }, [month, year]);

  const handleCopy = useCallback(async () => {
    setCopying(true);
    setError("");
    const result = await copyBudgetsFromPreviousMonth(month, year);
    if (result.success) {
      await refreshBudgets();
    } else {
      setError(result.error ?? "Error al copiar presupuestos");
    }
    setCopying(false);
  }, [month, year, refreshBudgets]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formCategoryId || formAmount <= 0) return;

      setSubmitting(true);
      setError("");
      const result = await createBudget({
        categoryId: formCategoryId,
        amount: formAmount,
        month,
        year,
      });

      if (result.success) {
        setShowForm(false);
        setFormCategoryId("");
        setFormAmount(0);
        await refreshBudgets();
      } else {
        setError(result.error ?? "Error al crear presupuesto");
      }
      setSubmitting(false);
    },
    [formCategoryId, formAmount, month, year, refreshBudgets]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      const result = await deleteBudget(id);
      if (result.success) {
        await refreshBudgets();
      } else {
        setError(result.error ?? "Error al eliminar presupuesto");
      }
      setDeletingId(null);
    },
    [refreshBudgets]
  );

  // Filter out categories that already have budgets
  const availableCategories = categories.filter(
    (c) => !budgets.some((b: any) => b.categoryId === c.id)
  );

  return (
    <>
      {/* Month navigator */}
      <div className="animate-in animate-delay-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-text-primary min-w-[140px] text-center">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={copying}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-primary transition-colors disabled:opacity-50"
          >
            {copying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copiar del mes anterior
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-accent-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo presupuesto
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[var(--radius-md)] border border-accent-danger/20 bg-accent-danger/5 px-4 py-3 text-sm text-accent-danger">
          {error}
        </div>
      )}

      {/* Budget cards grid */}
      {budgets.length === 0 ? (
        <EmptyState
          variant="budgets"
          action={{
            label: "Crear presupuesto",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in animate-delay-2">
          {budgets.map((budget: any, i: number) => {
            const spent = Number(budget.spent);
            const total = Number(budget.amount);
            const pct = percentOf(spent, total);
            const level =
              pct >= 100 ? "danger" : pct >= 80 ? "warning" : "normal";

            return (
              <div
                key={budget.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-4 group",
                  i < 5 && `animate-in animate-delay-${i + 1}`
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="category-dot"
                      style={{ background: budget.category.color }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {budget.category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    disabled={deletingId === budget.id}
                    className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-accent-danger hover:bg-bg-hover transition-all"
                  >
                    {deletingId === budget.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Budget bar */}
                <div className="budget-bar-track mb-2">
                  <div
                    className="budget-bar-fill"
                    data-level={level}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-secondary">
                    {formatCurrency(spent)} / {formatCurrency(total)}
                  </span>
                  <span
                    className={cn(
                      "font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium",
                      level === "danger"
                        ? "text-accent-danger"
                        : level === "warning"
                          ? "text-accent-warning"
                          : "text-text-muted"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New budget form modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md">
            <div className="animate-in rounded-t-[var(--radius-lg)] md:rounded-[var(--radius-lg)] border border-border-primary bg-bg-secondary shadow-[var(--shadow-dialog)]">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-primary">
                <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-text-primary">
                  Nuevo presupuesto
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-5">
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Categoria
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="input-underline text-sm"
                    required
                  >
                    <option value="">Seleccionar categoria</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <CurrencyInput
                  label="Monto presupuestado"
                  value={formAmount}
                  onChange={setFormAmount}
                />

                <p className="text-xs text-text-muted">
                  Para {MONTHS[month - 1]} {year}
                </p>

                <button
                  type="submit"
                  disabled={submitting || !formCategoryId || formAmount <= 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear presupuesto"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
