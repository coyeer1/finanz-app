export const APP_NAME = "FinanzApp";
export const DEFAULT_CURRENCY = "COP";

export const CURRENCIES = [
  { code: "COP", name: "Peso Colombiano", symbol: "$" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "MXN", name: "Peso Mexicano", symbol: "$" },
  { code: "ARS", name: "Peso Argentino", symbol: "$" },
] as const;

export const DEFAULT_CATEGORIES = {
  EXPENSE: [
    { name: "Alimentación", icon: "utensils", color: "#f97316" },
    { name: "Transporte", icon: "car", color: "#3b82f6" },
    { name: "Vivienda", icon: "home", color: "#8b5cf6" },
    { name: "Salud", icon: "heart-pulse", color: "#ef4444" },
    { name: "Entretenimiento", icon: "gamepad-2", color: "#ec4899" },
    { name: "Educación", icon: "graduation-cap", color: "#06b6d4" },
    { name: "Servicios", icon: "zap", color: "#f59e0b" },
    { name: "Otros gastos", icon: "more-horizontal", color: "#6b7280" },
  ],
  INCOME: [
    { name: "Salarios", icon: "banknote", color: "#22c55e" },
    { name: "Ventas", icon: "shopping-bag", color: "#10b981" },
    { name: "Inversiones", icon: "trending-up", color: "#14b8a6" },
    { name: "Freelance", icon: "laptop", color: "#6366f1" },
    { name: "Otros ingresos", icon: "plus-circle", color: "#84cc16" },
  ],
} as const;

export const ACCOUNT_TYPES = [
  { value: "CASH", label: "Efectivo", icon: "banknote" },
  { value: "BANK", label: "Banco", icon: "landmark" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito", icon: "credit-card" },
  { value: "SAVINGS", label: "Ahorros", icon: "piggy-bank" },
  { value: "INVESTMENT", label: "Inversión", icon: "trending-up" },
  { value: "OTHER", label: "Otro", icon: "wallet" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "INCOME", label: "Ingreso", color: "#22c55e" },
  { value: "EXPENSE", label: "Gasto", color: "#ef4444" },
  { value: "TRANSFER", label: "Transferencia", color: "#3b82f6" },
] as const;

export const ROLES = [
  { value: "OWNER", label: "Propietario" },
  { value: "ADMIN", label: "Administrador" },
  { value: "MEMBER", label: "Miembro" },
  { value: "VIEWER", label: "Visualizador" },
] as const;

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;
