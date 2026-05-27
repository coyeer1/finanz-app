import {
  ArrowLeftRight,
  Target,
  BarChart3,
  Users,
  Smartphone,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: ArrowLeftRight,
    title: "Transacciones detalladas",
    description:
      "Registra ingresos y gastos con categorías, cuentas y notas. Filtra por personal o empresa.",
  },
  {
    icon: Target,
    title: "Presupuestos inteligentes",
    description:
      "Define límites por categoría. Alertas cuando te acercas al tope. Copia del mes anterior en un click.",
  },
  {
    icon: BarChart3,
    title: "Reportes visuales",
    description:
      "Gráficos de tendencia, breakdown por categoría, comparativo personal vs empresa. Exporta a CSV.",
  },
  {
    icon: Users,
    title: "Multiusuario",
    description:
      "Invita a tu equipo con roles (admin, miembro, viewer). Cada uno ve lo que necesita.",
  },
  {
    icon: Smartphone,
    title: "PWA instalable",
    description:
      "Instala en tu teléfono como app nativa. Funciona rápido desde cualquier dispositivo.",
  },
  {
    icon: Shield,
    title: "Datos seguros",
    description:
      "Tu información financiera cifrada y protegida. Autenticación con Google o email.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 px-6 border-t border-border-primary">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-3xl md:text-4xl font-bold text-text-primary">
            Todo lo que necesitas
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            Sin funciones de relleno. Cada feature resuelve un problema real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border-primary rounded-[var(--radius-lg)] overflow-hidden border border-border-primary">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`animate-in bg-bg-primary p-8 hover:bg-bg-tertiary transition-colors`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <feature.icon className="w-5 h-5 text-accent-primary mb-4" />
              <h3 className="font-[family-name:var(--font-dm-sans)] font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
