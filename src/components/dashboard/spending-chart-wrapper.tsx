"use client";

import dynamic from "next/dynamic";
import type { MonthlyTrend } from "@/types";

const SpendingChart = dynamic(
  () =>
    import("@/components/dashboard/spending-chart").then(
      (mod) => mod.SpendingChart
    ),
  {
    loading: () => <div className="skeleton h-64 rounded-[var(--radius-lg)]" />,
    ssr: false,
  }
);

export function SpendingChartWrapper({
  data,
  currency,
}: {
  data: MonthlyTrend[];
  currency?: string;
}) {
  return <SpendingChart data={data} currency={currency} />;
}
