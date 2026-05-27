import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, Target, Tags } from "lucide-react";

const variants = {
  transactions: {
    icon: ArrowLeftRight,
    title: "Sin transacciones aun",
    description:
      "Tu historial esta limpio como una hoja en blanco. Registra tu primer ingreso o gasto para empezar.",
  },
  budgets: {
    icon: Target,
    title: "Sin presupuestos",
    description:
      "Sin presupuestos, cada gasto es una sorpresa. Crea uno para tomar el control.",
  },
  categories: {
    icon: Tags,
    title: "Sin categorias",
    description:
      "Las categorias son la columna vertebral de tus finanzas. Crea la primera para organizar tus movimientos.",
  },
} as const;

type Variant = keyof typeof variants;

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  variant?: Variant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyIllustration() {
  return (
    <svg
      width="120"
      height="96"
      viewBox="0 0 120 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-text-muted"
      aria-hidden="true"
    >
      {/* Box base */}
      <path
        d="M20 40L60 56L100 40L60 24L20 40Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.4"
      />
      {/* Box left face */}
      <path
        d="M20 40V64L60 80V56L20 40Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.25"
      />
      {/* Box right face */}
      <path
        d="M100 40V64L60 80V56L100 40Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.25"
      />
      {/* Dashed opening flap left */}
      <path
        d="M20 40L40 20"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.3"
      />
      {/* Dashed opening flap right */}
      <path
        d="M100 40L80 20"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.3"
      />
      {/* Small chart bars hint */}
      <rect x="50" y="10" width="4" height="12" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="58" y="6" width="4" height="16" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="66" y="12" width="4" height="10" rx="1" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

export function EmptyState({
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  variant,
  action,
}: EmptyStateProps) {
  const preset = variant ? variants[variant] : null;
  const Icon = CustomIcon || preset?.icon;
  const title = customTitle || preset?.title || "Sin datos";
  const description =
    customDescription ||
    preset?.description ||
    "No hay informacion disponible todavia.";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in">
      <EmptyIllustration />

      {Icon && (
        <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary">
          <Icon size={20} className="text-text-muted" />
        </div>
      )}

      <h3 className="mt-4 text-base font-semibold text-text-primary font-[family-name:var(--font-dm-sans)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
