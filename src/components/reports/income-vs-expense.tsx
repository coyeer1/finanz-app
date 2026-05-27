"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyTrend } from "@/types";

export function IncomeVsExpenseChart({
  data,
  currency = "COP",
}: {
  data: MonthlyTrend[];
  currency?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        Sin datos para este período
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
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
          <Legend
            content={({ payload }) => (
              <div className="flex items-center justify-center gap-6 mt-3">
                {payload?.map((entry) => (
                  <span
                    key={entry.value}
                    className="flex items-center gap-1.5 text-xs text-text-secondary"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: entry.color }}
                    />
                    {entry.value === "income" ? "Ingresos" : "Gastos"}
                  </span>
                ))}
              </div>
            )}
          />
          <Bar
            dataKey="income"
            fill="#22c55e"
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            fill="#ef4444"
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
