"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Check } from "lucide-react";
import { acceptInvite } from "@/actions/organization";

interface AcceptInviteClientProps {
  token: string;
  organizationName: string;
  roleLabel: string;
}

export function AcceptInviteClient({
  token,
  organizationName,
  roleLabel,
}: AcceptInviteClientProps) {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAccept() {
    setLoading(true);
    setError("");

    const result = await acceptInvite(token);
    if (!result.success || !result.data) {
      setError(result.error ?? "Error al aceptar la invitación");
      setLoading(false);
      return;
    }

    // Refrescar el JWT con la nueva org/rol para evitar el loop de onboarding
    await update({
      organizationId: result.data.organizationId,
      role: result.data.role,
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-text-secondary">
        Te invitaron a unirte a{" "}
        <span className="text-text-primary font-medium">{organizationName}</span>{" "}
        como <span className="text-accent-primary">{roleLabel}</span>.
      </p>

      {error && <p className="text-sm text-accent-danger">{error}</p>}

      <button
        onClick={handleAccept}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Aceptar invitación
      </button>
    </div>
  );
}
