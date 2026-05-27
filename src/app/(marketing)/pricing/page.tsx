import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "FinanzApp es gratis para siempre. Plan Pro para equipos y negocios.",
};

export default function PricingPage() {
  return (
    <>
      <section className="py-20 px-6 text-center">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-4xl md:text-5xl font-bold text-text-primary">
          Precios
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
          Empieza gratis. Escala cuando tu negocio lo necesite.
        </p>
      </section>
      <PricingCards />
    </>
  );
}
