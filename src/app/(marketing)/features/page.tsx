import type { Metadata } from "next";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Transacciones, presupuestos, reportes, multiusuario y más. Descubre todo lo que FinanzApp puede hacer por tus finanzas.",
};

export default function FeaturesPage() {
  return (
    <>
      <section className="py-20 px-6 text-center">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-4xl md:text-5xl font-bold text-text-primary">
          Diseñado para tus finanzas
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
          Cada funcionalidad existe porque la necesitabas. Nada más.
        </p>
      </section>
      <FeaturesGrid />
      <section className="py-16 px-6 text-center">
        <Link
          href="/register"
          className="group inline-flex items-center gap-2 px-6 py-3 bg-accent-primary text-bg-primary font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity"
        >
          Empieza gratis ahora
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </>
  );
}
