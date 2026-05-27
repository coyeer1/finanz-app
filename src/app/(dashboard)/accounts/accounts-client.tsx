"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, Wallet, Landmark, CreditCard, PiggyBank, TrendingUp, X, Loader2, Trash2 } from "lucide-react";
import { createAccount, deleteAccount, getAccounts, getTotalBalance } from "@/actions/accounts";
import { CurrencyInput } from "@/components/shared/currency-input";
import { cn, formatCurrency } from "@/lib/utils";
import { accountSchema, type AccountFormData } from "@/schemas/account";
import { ACCOUNT_TYPES, CURRENCIES } from "@/lib/constants";
import type { AccountWithBalance } from "@/types";

interface AccountsClientProps {
  initialAccounts: AccountWithBalance[];
  totalBalance: number;
}

const iconMap: Record<string, typeof Wallet> = {
  wallet: Wallet,
  landmark: Landmark,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  "trending-up": TrendingUp,
  banknote: Wallet,
};

function getIcon(iconName: string) {
  return iconMap[iconName] ?? Wallet;
}

export function AccountsClient({
  initialAccounts,
  totalBalance: initialBalance,
}: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [totalBalance, setTotalBalance] = useState(initialBalance);

  // Sync local state when server-provided props change (e.g. revalidation)
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);
  useEffect(() => {
    setTotalBalance(initialBalance);
  }, [initialBalance]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("BANK");
  const [formCurrency, setFormCurrency] = useState("COP");
  const [formInitialBalance, setFormInitialBalance] = useState(0);
  const [formColor, setFormColor] = useState("#6366f1");
  const [formIcon, setFormIcon] = useState("wallet");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refreshAccounts = useCallback(async () => {
    const [accountsRes, balanceRes] = await Promise.all([
      getAccounts(),
      getTotalBalance(),
    ]);
    if (accountsRes.success && accountsRes.data) {
      setAccounts(accountsRes.data as AccountWithBalance[]);
    }
    if (balanceRes.success && balanceRes.data !== undefined) {
      setTotalBalance(balanceRes.data);
    }
  }, []);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);

      const data: AccountFormData = {
        name: formName,
        type: formType as any,
        currency: formCurrency,
        initialBalance: formInitialBalance,
        color: formColor,
        icon: formIcon,
      };

      const parsed = accountSchema.safeParse(data);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        setSubmitting(false);
        return;
      }

      const result = await createAccount(parsed.data);
      if (result.success) {
        setShowForm(false);
        resetForm();
        await refreshAccounts();
      } else {
        setError(result.error ?? "Error al crear la cuenta");
      }
      setSubmitting(false);
    },
    [formName, formType, formCurrency, formInitialBalance, formColor, formIcon, refreshAccounts]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setError("");
      const result = await deleteAccount(id);
      if (result.success) {
        await refreshAccounts();
      } else {
        setError(result.error ?? "Error al eliminar la cuenta");
      }
      setDeletingId(null);
    },
    [refreshAccounts]
  );

  const resetForm = () => {
    setFormName("");
    setFormType("BANK");
    setFormCurrency("COP");
    setFormInitialBalance(0);
    setFormColor("#6366f1");
    setFormIcon("wallet");
  };

  const getTypeLabel = (type: string) => {
    return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;
  };

  return (
    <>
      {/* Total balance card */}
      <div className="animate-in animate-delay-1 rounded-[var(--radius-lg)] border border-border-primary bg-accent-surface p-6">
        <p className="text-xs text-text-muted mb-2">Balance total</p>
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-3xl md:text-4xl font-medium text-text-primary count-up-enter">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-[var(--radius-md)] border border-accent-danger/20 bg-accent-danger/5 px-4 py-3 text-sm text-accent-danger">
          {error}
        </div>
      )}

      {/* Header with new account button */}
      <div className="flex items-center justify-between animate-in animate-delay-2">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-sm font-medium text-text-secondary">
          Mis cuentas
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-accent-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva cuenta
        </button>
      </div>

      {/* Account cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in animate-delay-3">
        {accounts.map((account, i) => {
          const Icon = getIcon(account.icon);
          return (
            <div
              key={account.id}
              className={cn(
                "rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-4 group relative",
                i < 5 && `animate-in animate-delay-${i + 1}`
              )}
            >
              {/* Delete button */}
              <button
                onClick={() => handleDelete(account.id)}
                disabled={deletingId === account.id}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-accent-danger hover:bg-bg-hover transition-all"
              >
                {deletingId === account.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: `${account.color}20`, color: account.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {account.name}
                  </p>
                  <p className="text-xs text-text-muted">{getTypeLabel(account.type)}</p>
                </div>
              </div>

              <p className="font-[family-name:var(--font-jetbrains-mono)] text-lg font-medium text-text-primary">
                {formatCurrency(Number(account.currentBalance), account.currency)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {account._count.transactions} transacciones
              </p>
            </div>
          );
        })}
      </div>

      {/* New account form modal */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowForm(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md">
            <div className="animate-in rounded-t-[var(--radius-lg)] md:rounded-[var(--radius-lg)] border border-border-primary bg-bg-secondary shadow-[var(--shadow-dialog)] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border-primary">
                <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-text-primary">
                  Nueva cuenta
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-5">
                {/* Name */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Banco principal"
                    className="input-underline text-sm"
                    required
                    maxLength={50}
                  />
                </div>

                {/* Type */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Tipo
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="input-underline text-sm"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Moneda
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="input-underline text-sm"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Initial balance */}
                <CurrencyInput
                  label="Saldo inicial"
                  value={formInitialBalance}
                  onChange={setFormInitialBalance}
                  currency={formCurrency}
                />

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
                  </div>
                </div>

                {/* Icon */}
                <div className="input-wrapper">
                  <label className="block text-xs text-text-muted mb-1 font-medium">
                    Icono
                  </label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="input-underline text-sm"
                  >
                    <option value="wallet">Billetera</option>
                    <option value="landmark">Banco</option>
                    <option value="credit-card">Tarjeta</option>
                    <option value="piggy-bank">Ahorros</option>
                    <option value="trending-up">Inversion</option>
                    <option value="banknote">Efectivo</option>
                  </select>
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
                      Creando...
                    </>
                  ) : (
                    "Crear cuenta"
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
