"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createOrganization } from "@/actions/auth";
import { CURRENCIES } from "@/lib/constants";
import { Building2, ChevronDown, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [orgName, setOrgName] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", orgName);
      formData.set("currency", currency);

      const result = await createOrganization(formData);

      if (!result.success) {
        setError(result.error ?? "Error al crear la organizacion");
        setLoading(false);
        return;
      }

      // Update the JWT token with the new organizationId so the proxy
      // doesn't redirect back to /onboarding
      await updateSession({ organizationId: result.organizationId });

      router.push("/dashboard");
    } catch {
      setError("Ocurrio un error. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12">
      <div className="animate-in w-full max-w-md">
        <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-surface">
              <Building2 className="h-6 w-6 text-accent-primary" />
            </div>
            <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-text-primary">
              Nombra tu organización
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Configura tu espacio de trabajo para empezar a gestionar tus
              finanzas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateOrganization} className="space-y-6">
            {/* Org name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Nombre de la organización
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  placeholder="Ej: Mi empresa, Personal"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="input-underline"
                />
              </div>
            </div>

            {/* Currency selector */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Moneda principal
              </label>
              <div className="input-wrapper">
                <div className="relative">
                  <select
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-underline w-full appearance-none bg-transparent pr-8"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-bg-tertiary text-text-primary">
                        {c.symbol} {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-accent-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !orgName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear organización
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
