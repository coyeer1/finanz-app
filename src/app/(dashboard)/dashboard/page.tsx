import { Suspense } from "react";
import {
  getDashboardStats,
  getMonthlyTrends,
  getRecentTransactions,
} from "@/actions/reports";
import { getBudgets } from "@/actions/budgets";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SpendingChartWrapper } from "@/components/dashboard/spending-chart-wrapper";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import {
  StatCardSkeleton,
  TableRowSkeleton,
} from "@/components/shared/loading-skeleton";
import { DashboardToggle } from "./dashboard-toggle";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isPersonalParam = params.isPersonal;
  const isPersonal =
    isPersonalParam === "true"
      ? true
      : isPersonalParam === "false"
        ? false
        : undefined;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [statsResult, trendsResult, recentResult, budgetsResult] =
    await Promise.all([
      getDashboardStats(isPersonal),
      getMonthlyTrends(6),
      getRecentTransactions(5),
      getBudgets(currentMonth, currentYear),
    ]);

  const stats = statsResult.success
    ? statsResult.data!
    : {
        totalBalance: 0,
        monthIncome: 0,
        monthExpense: 0,
        netSavings: 0,
        incomeChange: 0,
        expenseChange: 0,
      };

  const trends = trendsResult.success ? (trendsResult.data as any[]) ?? [] : [];
  const recent = recentResult.success ? (recentResult.data as any[]) ?? [] : [];
  const budgets = budgetsResult.success ? (budgetsResult.data as any[]) ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Dashboard
        </h1>
        <DashboardToggle current={isPersonal} />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-2 lg:col-span-1">
              <StatCardSkeleton />
            </div>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        }
      >
        <StatsCards stats={stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <SpendingChartWrapper data={trends} />

        <div className="space-y-6">
          <Suspense
            fallback={
              <div className="rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-5">
                <div className="skeleton h-5 w-36 rounded mb-4" />
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <RecentTransactions transactions={recent} />
          </Suspense>

          <Suspense fallback={null}>
            <BudgetProgress budgets={budgets} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
