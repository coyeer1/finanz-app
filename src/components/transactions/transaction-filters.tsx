"use client";

import { useCallback, useState, useTransition, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { DatePicker } from "@/components/shared/date-picker";
import { cn } from "@/lib/utils";
import { TRANSACTION_TYPES } from "@/lib/constants";
import type { CategoryWithCount, AccountWithBalance } from "@/types";

interface TransactionFiltersProps {
  categories: CategoryWithCount[];
  accounts: AccountWithBalance[];
}

export function TransactionFilters({
  categories,
  accounts,
}: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentType = searchParams.get("type") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? "";
  const currentAccount = searchParams.get("accountId") ?? "";
  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";
  const currentIsPersonal = searchParams.get("isPersonal") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const hasActiveFilters =
    currentType ||
    currentCategory ||
    currentAccount ||
    currentDateFrom ||
    currentDateTo ||
    currentIsPersonal ||
    currentSearch;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        // Reset cursor on filter change
        params.delete("cursor");
        router.push(`/transactions?${params.toString()}`);
      });
    },
    [searchParams, router]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push("/transactions");
    });
  }, [router]);

  const parseDateParam = (param: string): Date | null => {
    if (!param) return null;
    const [year, month, day] = param.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateForParam = (date: Date | null): string => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="animate-in animate-delay-1 space-y-3">
      {/* Top row: search + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const val = e.target.value;
              // Debounce with ref-based cleanup (onChange return value is discarded)
              if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
              searchTimeoutRef.current = setTimeout(() => updateFilter("search", val), 400);
            }}
            className="input-underline pl-6 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium transition-colors",
            showFilters || hasActiveFilters
              ? "bg-accent-primary/10 text-accent-primary"
              : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-accent-primary" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1.5 rounded-[var(--radius-sm)] text-xs text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 pb-2">
          {/* Type */}
          <div className="min-w-[130px]">
            <label className="block text-xs text-text-muted mb-1 font-medium">
              Tipo
            </label>
            <select
              value={currentType}
              onChange={(e) => updateFilter("type", e.target.value)}
              className="w-full input-underline text-sm py-2"
            >
              <option value="">Todos</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="min-w-[150px]">
            <label className="block text-xs text-text-muted mb-1 font-medium">
              Categoria
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilter("categoryId", e.target.value)}
              className="w-full input-underline text-sm py-2"
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div className="min-w-[150px]">
            <label className="block text-xs text-text-muted mb-1 font-medium">
              Cuenta
            </label>
            <select
              value={currentAccount}
              onChange={(e) => updateFilter("accountId", e.target.value)}
              className="w-full input-underline text-sm py-2"
            >
              <option value="">Todas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="min-w-[140px]">
            <DatePicker
              label="Desde"
              value={parseDateParam(currentDateFrom)}
              onChange={(d) =>
                updateFilter("dateFrom", formatDateForParam(d))
              }
            />
          </div>

          {/* Date to */}
          <div className="min-w-[140px]">
            <DatePicker
              label="Hasta"
              value={parseDateParam(currentDateTo)}
              onChange={(d) =>
                updateFilter("dateTo", formatDateForParam(d))
              }
            />
          </div>

          {/* Personal / Empresa toggle */}
          <div className="min-w-[130px]">
            <label className="block text-xs text-text-muted mb-1 font-medium">
              Entidad
            </label>
            <select
              value={currentIsPersonal}
              onChange={(e) => updateFilter("isPersonal", e.target.value)}
              className="w-full input-underline text-sm py-2"
            >
              <option value="">Todo</option>
              <option value="true">Personal</option>
              <option value="false">Empresa</option>
            </select>
          </div>
        </div>
      )}

      {isPending && (
        <div className="h-0.5 bg-accent-primary/20 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-accent-primary rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
