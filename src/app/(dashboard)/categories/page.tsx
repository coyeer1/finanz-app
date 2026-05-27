import { getCategories } from "@/actions/categories";
import { CategoriesClient } from "./categories-client";

export const metadata = {
  title: "Categorias",
};

export default async function CategoriesPage() {
  const result = await getCategories();
  const categories = result.success ? result.data ?? [] : [];

  const expenseCategories = categories.filter((c: any) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c: any) => c.type === "INCOME");

  return (
    <div className="space-y-6">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Categorias
        </h1>
      </div>

      <CategoriesClient
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
      />
    </div>
  );
}
