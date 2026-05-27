"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyTrend } from "@/types";

export function SpendingChart({
  data,
  currency = "COP",
}: {
  data: MonthlyTrend[];
  currency?: string;
}) {
  const chartData = useMemo(() => data, [data]);

  return (
    <div className="animate-in animate-delay-3 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
      <h3 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary mb-6">
        Ingresos vs Gastos
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return String(v);
              }}
              width={48}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-bg-tertiary border border-border-hover rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)] p-3 min-w-[160px]">
                    <p className="text-xs text-text-muted mb-2">{label}</p>
                    {payload.map((entry) => (
                      <div
                        key={entry.name}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: entry.color }}
                          />
                          {entry.name === "income" ? "Ingresos" : "Gastos"}
                        </span>
                        <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-primary">
                          {formatCurrency(Number(entry.value), currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
