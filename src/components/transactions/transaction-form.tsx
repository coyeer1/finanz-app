"use client";

import { useState, useCallback, useMemo } from "react";
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { CurrencyInput } from "@/components/shared/currency-input";
import { DatePicker } from "@/components/shared/date-picker";
import { cn } from "@/lib/utils";
import { transactionSchema, type TransactionFormData } from "@/schemas/transaction";
import type { CategoryWithCount, AccountWithBalance, TransactionType } from "@/types";

interface TransactionFormProps {
  categories: CategoryWithCount[];
  accounts: AccountWithBalance[];
  defaultValues?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onClose: () => void;
}

const typeButtons = [
  { value: "INCOME" as TransactionType, label: "Ingreso", icon: ArrowDownLeft, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { value: "EXPENSE" as TransactionType, label: "Gasto", icon: ArrowUpRight, color: "text-accent-danger", bg: "bg-accent-danger/10" },
  { value: "TRANSFER" as TransactionType, label: "Transferencia", icon: ArrowLeftRight, color: "text-accent-info", bg: "bg-accent-info/10" },
] as const;

export function TransactionForm({
  categories,
  accounts,
  defaultValues,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(defaultValues?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(defaultValues?.amount ?? 0);
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ?? "");
  const [accountId, setAccountId] = useState(defaultValues?.accountId ?? "");
  const [date, setDate] = useState<Date | null>(defaultValues?.date ? new Date(defaultValues.date) : new Date());
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [isPersonal, setIsPersonal] = useState(defaultValues?.isPersonal ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    if (type === "TRANSFER") return categories;
    const catType = type === "INCOME" ? "INCOME" : "EXPENSE";
    return categories.filter((c) => c.type === catType);
  }, [categories, type]);

  const handleTypeChange = useCallback(
    (newType: TransactionType) => {
      setType(newType);
      // Reset category when type changes since categories are filtered by type
      setCategoryId("");
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const data = {
        type,
        amount,
        description,
        categoryId,
        accountId,
        date,
        notes: notes || null,
        isPersonal,
      };

      const result = transactionSchema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit(result.data);
      } catch {
        setErrors({ form: "Error al guardar la transaccion" });
      } finally {
        setSubmitting(false);
      }
    },
    [type, amount, description, categoryId, accountId, date, notes, isPersonal, onSubmit]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg">
        <div className="animate-in rounded-t-[var(--radius-lg)] md:rounded-[var(--radius-lg)] border border-border-primary bg-bg-secondary shadow-[var(--shadow-dialog)] max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-primary">
            <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-text-primary">
              {defaultValues ? "Editar transaccion" : "Nueva transaccion"}
            </h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {typeButtons.map((tb) => {
                const Icon = tb.icon;
                const selected = type === tb.value;
                return (
                  <button
                    key={tb.value}
                    type="button"
                    onClick={() => handleTypeChange(tb.value)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] text-xs font-medium transition-all",
                      selected
                        ? `${tb.bg} ${tb.color} border border-current/20`
                        : "bg-bg-tertiary text-text-muted hover:text-text-secondary border border-transparent"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tb.label}
                  </button>
                );
              })}
            </div>

            {/* Amount */}
            <div>
              <CurrencyInput
                label="Monto"
                value={amount}
                onChange={setAmount}
                currency={accounts.find((a) => a.id === accountId)?.currency ?? "COP"}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-accent-danger">{errors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div className="input-wrapper">
              <label className="block text-xs text-text-muted mb-1 font-medium">
                Descripcion
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Almuerzo en restaurante"
                className="input-underline text-sm"
                maxLength={200}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-accent-danger">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="input-wrapper">
              <label className="block text-xs text-text-muted mb-1 font-medium">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-underline text-sm"
              >
                <option value="">Seleccionar categoria</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-accent-danger">{errors.categoryId}</p>
              )}
            </div>

            {/* Account */}
            <div className="input-wrapper">
              <label className="block text-xs text-text-muted mb-1 font-medium">
                Cuenta
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="input-underline text-sm"
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="mt-1 text-xs text-accent-danger">{errors.accountId}</p>
              )}
            </div>

            {/* Date */}
            <DatePicker
              label="Fecha"
              value={date}
              onChange={setDate}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-accent-danger">{errors.date}</p>
            )}

            {/* Notes */}
            <div className="input-wrapper">
              <label className="block text-xs text-text-muted mb-1 font-medium">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
                className="input-underline text-sm resize-none min-h-[60px]"
                maxLength={500}
                rows={2}
              />
            </div>

            {/* Personal / Empresa toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Tipo de gasto</span>
              <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
                <button
                  type="button"
                  onClick={() => setIsPersonal(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all",
                    isPersonal
                      ? "bg-bg-secondary text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setIsPersonal(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all",
                    !isPersonal
                      ? "bg-bg-secondary text-accent-info shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  Empresa
                </button>
              </div>
            </div>

            {/* Error */}
            {errors.form && (
              <p className="text-sm text-accent-danger text-center">{errors.form}</p>
            )}

            {/* Submit */}
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
              ) : defaultValues ? (
                "Actualizar transaccion"
              ) : (
                "Crear transaccion"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
