"use client";

import { useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { categorySchema, type CategoryFormData } from "@/schemas/category";
import type { CategoryWithCount } from "@/types";

interface CategoriesClientProps {
  expenseCategories: CategoryWithCount[];
  incomeCategories: CategoryWithCount[];
}

type FormMode = { mode: "create"; type: "INCOME" | "EXPENSE" } | { mode: "edit"; category: CategoryWithCount };

export function CategoriesClient({
  expenseCategories: initialExpense,
  incomeCategories: initialIncome,
}: CategoriesClientProps) {
  const [expenseCategories, setExpenseCategories] = useState(initialExpense);
  const [incomeCategories, setIncomeCategories] = useState(initialIncome);
  const [formState, setFormState] = useState<FormMode | null>(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formColor, setFormColor] = useState("#6366f1");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openCreate = useCallback((type: "INCOME" | "EXPENSE") => {
    setFormState({ mode: "create", type });
    setFormName("");
    setFormIcon("circle");
    setFormColor("#6366f1");
    setError("");
  }, []);

  const openEdit = useCallback((category: CategoryWithCount) => {
    setFormState({ mode: "edit", category });
    setFormName(category.name);
    setFormIcon(category.icon);
    setFormColor(category.color);
    setError("");
  }, []);

  const refreshCategories = useCallback(async () => {
    // Re-import to get fresh data
    const { getCategories } = await import("@/actions/categories");
    const result = await getCategories();
    if (result.success && result.data) {
      setExpenseCategories(result.data.filter((c: any) => c.type === "EXPENSE"));
      setIncomeCategories(result.data.filter((c: any) => c.type === "INCOME"));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formState) return;
      setError("");
      setSubmitting(true);

      try {
        if (formState.mode === "create") {
          const data: CategoryFormData = {
            name: formName,
            icon: formIcon,
            color: formColor,
            type: formState.type,
          };

          const parsed = categorySchema.safeParse(data);
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            setSubmitting(false);
            return;
          }

          const result = await createCategory(parsed.data);
          if (!result.success) {
            setError(result.error ?? "Error al crear categoria");
            setSubmitting(false);
            return;
          }
        } else {
          const data: CategoryFormData = {
            name: formName,
            icon: formIcon,
            color: formColor,
            type: formState.category.type as "INCOME" | "EXPENSE",
          };

          const parsed = categorySchema.safeParse(data);
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            setSubmitting(false);
            return;
          }

          const result = await updateCategory(formState.category.id, parsed.data);
          if (!result.success) {
            setError(result.error ?? "Error al actualizar categoria");
            setSubmitting(false);
            return;
          }
        }

        setFormState(null);
        await refreshCategories();
      } catch {
        setError("Error inesperado");
      } finally {
        setSubmitting(false);
      }
    },
    [formState, formName, formIcon, formColor, refreshCategories]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setError("");
      const result = await deleteCategory(id);
      if (result.success) {
        await refreshCategories();
      } else {
        setError(result.error ?? "Error al eliminar categoria");
      }
      setDeletingId(null);
    },
    [refreshCategories]
  );

  const renderColumn = (
    title: string,
    items: CategoryWithCount[],
    type: "INCOME" | "EXPENSE"
  ) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-text-primary">
          {title}
        </h2>
        <button
          onClick={() => openCreate(type)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          Nueva
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          variant="categories"
          action={{ label: "Crear categoria", onClick: () => openCreate(type) }}
        />
      ) : (
        <div className="space-y-1">
          {items.map((cat, i) => (
            <div
              key={cat.id}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] group hover:bg-bg-hover transition-colors",
                i < 5 && `animate-in animate-delay-${i + 1}`
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="category-dot"
                  style={{ background: cat.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary">{cat.name}</p>
                  <p className="text-xs text-text-muted">
                    {cat.icon} · {cat._count.transactions} transacciones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-accent-danger hover:bg-bg-tertiary transition-colors"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Error banner */}
      {error && !formState && (
        <div className="rounded-[var(--radius-md)] border border-accent-danger/20 bg-accent-danger/5 px-4 py-3 text-sm text-accent-danger">
          {error}
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in animate-delay-1">
        {renderColumn("Gastos", expenseCategories, "EXPENSE")}
        {renderColumn("Ingresos", incomeCategories, "INCOME")}
      </div>

      {/* Form modal */}
      {formState && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setFormState(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md">
            <div className="animate-in rounded-t-[var(--radius-lg)] md:rounded-[var(--radius-lg)] border border-border-primary bg-bg-secondary shadow-[var(--shadow-dialog)]">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-primary">
                <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-text-primary">
                  {formState.mode === "create"
                    ? "Nueva categoria"
                    : "Editar categoria"}
                </h2>
                <button
                  onClick={() => setFormState(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                {/* Name */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Alimentacion"
                    className="input-underline text-sm"
                    required
                    maxLength={50}
                  />
                </div>

                {/* Icon */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Icono (nombre Lucide)
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="Ej: utensils, car, home"
                    className="input-underline text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    Nombres de iconos de lucide-react (ej: wallet, heart-pulse, shopping-bag)
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer border border-border-primary rounded-[var(--radius-sm)] bg-transparent"
                    />
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-text-secondary">
                      {formColor}
                    </span>
                    <span
                      className="category-dot ml-auto"
                      style={{ background: formColor }}
                    />
                  </div>
                </div>

                {/* Type (readonly) */}
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Tipo
                  </label>
                  <div className="px-0 py-2 text-sm text-text-secondary border-b border-border-primary">
                    {formState.mode === "create"
                      ? formState.type === "INCOME"
                        ? "Ingreso"
                        : "Gasto"
                      : formState.category.type === "INCOME"
                        ? "Ingreso"
                        : "Gasto"}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-accent-danger">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-md)] bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : formState.mode === "create" ? (
                    "Crear categoria"
                  ) : (
                    "Actualizar categoria"
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
