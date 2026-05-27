import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-info/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="animate-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-accent-primary border border-accent-primary/20 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            Gratis para siempre
          </span>
        </div>

        <h1 className="animate-in animate-delay-1 font-[family-name:var(--font-dm-sans)] text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] tracking-tight">
          Tus finanzas,
          <br />
          <span className="text-accent-primary">bajo control.</span>
        </h1>

        <p className="animate-in animate-delay-2 mt-6 text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed">
          Separa gastos personales y de empresa. Presupuestos inteligentes.
          Reportes que importan. Todo desde cualquier dispositivo.
        </p>

        <div className="animate-in animate-delay-3 mt-10 flex flex-col sm:flex-row items-start gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2 px-6 py-3 bg-accent-primary text-bg-primary font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
          >
            Empieza gratis
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/features"
            className="flex items-center gap-2 px-6 py-3 text-text-secondary border border-border-hover rounded-[var(--radius-md)] hover:text-text-primary hover:border-text-muted transition-colors"
          >
            Ver funcionalidades
          </Link>
        </div>

        <div className="animate-in animate-delay-4 mt-16 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary shadow-[var(--shadow-elevated)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-primary">
            <div className="w-3 h-3 rounded-full bg-accent-danger/60" />
            <div className="w-3 h-3 rounded-full bg-accent-warning/60" />
            <div className="w-3 h-3 rounded-full bg-accent-primary/60" />
            <span className="ml-2 text-xs text-text-muted">FinanzApp — Dashboard</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <DemoCard
                label="Balance total"
                value="$5.500.000"
                accent
                large
              />
              <DemoCard label="Ingresos" value="$6.500.000" income />
              <DemoCard label="Gastos" value="$3.240.000" expense />
              <DemoCard label="Ahorro" value="$3.260.000" income />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { w: "100%", color: "#22c55e", label: "Salarios" },
                { w: "72%", color: "#f97316", label: "Alimentación" },
                { w: "48%", color: "#3b82f6", label: "Transporte" },
              ].map((bar) => (
                <div key={bar.label} className="space-y-1.5">
                  <span className="text-xs text-text-muted">{bar.label}</span>
                  <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: bar.w, background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="animate-in animate-delay-5 mt-6 text-center text-xs text-text-muted">
          Instala como app en tu teléfono — funciona sin conexión
        </p>
      </div>
    </section>
  );
}

function DemoCard({
  label,
  value,
  income,
  expense,
  accent,
  large,
}: {
  label: string;
  value: string;
  income?: boolean;
  expense?: boolean;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-border-primary p-4 ${
        large ? "col-span-2 md:col-span-1" : ""
      } ${accent ? "bg-accent-surface" : "bg-bg-secondary"}`}
    >
      <span className="text-xs text-text-muted">{label}</span>
      <p
        className={`mt-1 font-[family-name:var(--font-jetbrains-mono)] text-lg font-medium ${
          income
            ? "text-accent-primary"
            : expense
              ? "text-accent-danger"
              : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
