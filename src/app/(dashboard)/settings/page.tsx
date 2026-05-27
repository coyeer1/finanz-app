import Link from "next/link";
import { auth } from "@/lib/auth";
import { SettingsThemeToggle } from "./settings-theme-toggle";
import { ChevronRight, Building2 } from "lucide-react";

export const metadata = {
  title: "Configuración",
};

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="animate-in">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold text-text-primary">
          Configuración
        </h1>
      </div>

      <div className="animate-in animate-delay-1 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 space-y-5">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Perfil
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Nombre</label>
            <p className="text-sm text-text-primary">{user?.name ?? "—"}</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Email</label>
            <p className="text-sm text-text-primary">{user?.email ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="animate-in animate-delay-2 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 space-y-5">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Apariencia
        </h2>
        <SettingsThemeToggle />
      </div>

      <Link
        href="/settings/organization"
        className="animate-in animate-delay-3 flex items-center justify-between rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-text-muted" />
          <div>
            <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
              Organización
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Nombre, moneda, miembros e invitaciones
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted" />
      </Link>
    </div>
  );
}
