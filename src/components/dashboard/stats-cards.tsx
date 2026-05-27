"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export function StatsCards({ stats, currency = "COP" }: { stats: DashboardStats; currency?: string }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-2 lg:col-span-1 animate-in rounded-[var(--radius-lg)] border border-border-primary bg-accent-surface p-5">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <Wallet className="w-3.5 h-3.5" />
          Balance total
        </div>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-2xl md:text-3xl font-medium text-text-primary count-up-enter">
          {formatCurrency(stats.totalBalance, currency)}
        </p>
      </div>

      <div className="animate-in animate-delay-1 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-accent-primary" />
          Ingresos del mes
        </div>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-medium text-accent-primary count-up-enter">
          {formatCurrency(stats.monthIncome, currency)}
        </p>
        {stats.incomeChange !== 0 && (
          <span className={`mt-1 inline-flex items-center gap-0.5 text-xs ${stats.incomeChange > 0 ? "text-accent-primary" : "text-accent-danger"}`}>
            {stats.incomeChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="font-[family-name:var(--font-jetbrains-mono)]">{Math.abs(stats.incomeChange)}%</span>
            <span className="text-text-muted">vs mes anterior</span>
          </span>
        )}
      </div>

      <div className="animate-in animate-delay-2 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <TrendingDown className="w-3.5 h-3.5 text-accent-danger" />
          Gastos del mes
        </div>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xl font-medium text-accent-danger count-up-enter">
          {formatCurrency(stats.monthExpense, currency)}
        </p>
        {stats.expenseChange !== 0 && (
          <span className={`mt-1 inline-flex items-center gap-0.5 text-xs ${stats.expenseChange > 0 ? "text-accent-danger" : "text-accent-primary"}`}>
            {stats.expenseChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="font-[family-name:var(--font-jetbrains-mono)]">{Math.abs(stats.expenseChange)}%</span>
            <span className="text-text-muted">vs mes anterior</span>
          </span>
        )}
      </div>

      <div className="animate-in animate-delay-3 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
        <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
          <PiggyBank className="w-3.5 h-3.5" />
          Ahorro neto
        </div>
        <p className={`font-[family-name:var(--font-jetbrains-mono)] text-xl font-medium count-up-enter ${stats.netSavings >= 0 ? "text-accent-primary" : "text-accent-danger"}`}>
          {formatCurrency(stats.netSavings, currency)}
        </p>
      </div>
    </div>
  );
}
