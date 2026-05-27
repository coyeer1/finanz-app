import { getCategories } from "@/actions/categories";
import { getBudgets } from "@/actions/budgets";
import { MONTHS } from "@/lib/constants";
import { BudgetsClient } from "./budgets-client";

export const metadata = {
  title: "Presupuestos",
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const parsedMonth = params.month ? Number(params.month) : NaN;
  const parsedYear = params.year ? Number(params.year) : NaN;
  const month = Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
    ? parsedMonth
    : now.getMonth() + 1;
  const year = Number.isFinite(parsedYear) && parsedYear >= 2020 && parsedYear <= 2100
    ? parsedYear
    : now.getFullYear();

  const [categoriesResult, budgetsResult] = await Promise.all([
    getCategories("EXPENSE"),
    getBudgets(month, year),
  ]);

  const categories = categoriesResult.success ? categoriesResult.data ?? [] : [];
  const budgets = budgetsResult.success ? (budgetsResult.data as any[]) ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Presupuestos
        </h1>
      </div>

      <BudgetsClient
        categories={categories}
        initialBudgets={budgets}
        month={month}
        year={year}
      />
    </div>
  );
}
