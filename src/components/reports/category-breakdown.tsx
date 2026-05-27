"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdown as CategoryBreakdownType } from "@/types";

export function CategoryBreakdownChart({
  data,
  currency = "COP",
}: {
  data: CategoryBreakdownType[];
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
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return String(v);
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as CategoryBreakdownType;
                return (
                  <div className="bg-bg-tertiary border border-border-hover rounded-[var(--radius-md)] shadow-[var(--shadow-elevated)] p-3">
                    <p className="text-xs text-text-muted mb-1">{item.name}</p>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-text-primary">
                      {formatCurrency(item.amount, currency)}
                    </p>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-muted">
                      {item.percentage}% · {item.count} transacciones
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="amount" radius={[0, 2, 2, 0]} maxBarSize={24}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="category-dot"
                style={{ background: item.color }}
              />
              <span className="text-sm text-text-secondary">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-text-primary">
                {formatCurrency(item.amount, currency)}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-muted w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
