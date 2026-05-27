import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "para siempre",
    description: "Todo lo esencial para controlar tus finanzas",
    features: [
      "Transacciones ilimitadas",
      "Hasta 5 cuentas",
      "Presupuestos mensuales",
      "Reportes básicos",
      "Exportar CSV",
      "1 usuario",
    ],
    cta: "Empieza gratis",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.900",
    period: "COP / mes",
    description: "Para equipos y negocios que necesitan más",
    features: [
      "Todo del plan Gratis",
      "Usuarios ilimitados",
      "Cuentas ilimitadas",
      "Reportes avanzados",
      "Adjuntar recibos",
      "Soporte prioritario",
    ],
    cta: "Próximamente",
    href: "#",
    highlighted: true,
  },
];

export function PricingCards() {
  return (
    <section className="py-24 px-6 border-t border-border-primary">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-3xl md:text-4xl font-bold text-text-primary">
            Simple y transparente
          </h2>
          <p className="mt-4 text-text-secondary">
            Sin costos ocultos. Empieza gratis, escala cuando quieras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[var(--radius-lg)] border p-8 ${
                plan.highlighted
                  ? "border-accent-primary/30 bg-accent-surface"
                  : "border-border-primary bg-bg-tertiary"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block text-[0.65rem] uppercase tracking-widest text-accent-primary font-medium mb-4 px-2 py-0.5 border border-accent-primary/30 rounded-[var(--radius-sm)]">
                  Recomendado
                </span>
              )}
              <h3 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-4xl font-bold text-text-primary">
                  {plan.price}
                </span>
                <span className="text-sm text-text-muted">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-text-secondary"
                  >
                    <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block text-center py-3 rounded-[var(--radius-md)] text-sm font-medium transition-opacity ${
                  plan.highlighted
                    ? "bg-accent-primary text-bg-primary hover:opacity-90"
                    : "border border-border-hover text-text-secondary hover:text-text-primary"
                } ${plan.href === "#" ? "pointer-events-none opacity-50" : ""}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
