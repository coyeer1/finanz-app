"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Download, Loader2 } from "lucide-react";
import { getCategoryBreakdown, getMonthlyTrends, exportTransactionsCSV } from "@/actions/reports";
import { PeriodSelector } from "@/components/reports/period-selector";
import { ChartSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import type { CategoryBreakdown, MonthlyTrend } from "@/types";

const CategoryBreakdownChart = dynamic(
  () =>
    import("@/components/reports/category-breakdown").then(
      (mod) => mod.CategoryBreakdownChart
    ),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const IncomeVsExpenseChart = dynamic(
  () =>
    import("@/components/reports/income-vs-expense").then(
      (mod) => mod.IncomeVsExpenseChart
    ),
  { loading: () => <ChartSkeleton />, ssr: false }
);

type EntityFilter = "all" | "personal" | "empresa";

export function ReportsClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [entity, setEntity] = useState<EntityFilter>("all");
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPersonal = entity === "personal" ? true : entity === "empresa" ? false : undefined;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [breakdownRes, trendsRes] = await Promise.all([
      getCategoryBreakdown(month, year, "EXPENSE", isPersonal),
      getMonthlyTrends(6),
    ]);

    if (breakdownRes.success && breakdownRes.data) {
      setBreakdown(breakdownRes.data as CategoryBreakdown[]);
    } else {
      setBreakdown([]);
    }

    if (trendsRes.success && trendsRes.data) {
      setTrends(trendsRes.data as MonthlyTrend[]);
    } else {
      setTrends([]);
    }
    setLoading(false);
  }, [month, year, isPersonal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    // Parse month/year from the "from" date
    const fromDate = new Date(from);
    setMonth(fromDate.getMonth() + 1);
    setYear(fromDate.getFullYear());
  }, []);

  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const filters: Record<string, unknown> = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (isPersonal !== undefined) filters.isPersonal = isPersonal;

      const result = await exportTransactionsCSV(filters);
      if (result.success && result.data) {
        // Trigger browser download
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transacciones_${year}-${String(month).padStart(2, "0")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }, [dateFrom, dateTo, isPersonal, month, year]);

  return (
    <>
      {/* Controls */}
      <div className="animate-in animate-delay-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PeriodSelector onPeriodChange={handlePeriodChange} />

        <div className="flex items-center gap-3">
          {/* Entity toggle */}
          <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
            {(["all", "personal", "empresa"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setEntity(v)}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all",
                  entity === v
                    ? v === "empresa"
                      ? "bg-bg-secondary text-accent-info shadow-sm"
                      : "bg-bg-secondary text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                {v === "all" ? "Todo" : v === "personal" ? "Personal" : "Empresa"}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-primary transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="animate-in animate-delay-2 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
          <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary mb-4">
            Desglose por categoria
          </h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <CategoryBreakdownChart data={breakdown} />
          )}
        </div>

        {/* Income vs Expense */}
        <div className="animate-in animate-delay-3 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
          <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary mb-4">
            Ingresos vs Gastos
          </h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <IncomeVsExpenseChart data={trends} />
          )}
        </div>
      </div>
    </>
  );
}
