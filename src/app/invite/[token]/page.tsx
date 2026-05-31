import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getInvitePreview } from "@/actions/organization";
import { ROLES } from "@/lib/constants";
import { AcceptInviteClient } from "./accept-invite-client";

export const metadata = {
  title: "Invitación",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="animate-in w-full max-w-sm">
        <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-8">
          <div className="mb-6 text-center">
            <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-text-primary">
              Finanz<span className="text-accent-primary">.</span>App
            </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [session, preview] = await Promise.all([auth(), getInvitePreview(token)]);

  if (!preview.valid) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-accent-danger mx-auto" />
          <p className="text-sm text-text-primary">{preview.error}</p>
          <Link
            href="/login"
            className="inline-block text-sm text-accent-primary hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </Shell>
    );
  }

  const roleLabel =
    ROLES.find((r) => r.value === preview.role)?.label ?? preview.role;

  // No autenticado: ofrecer login/registro que regresan a esta misma página
  if (!session?.user) {
    const callback = `/invite/${token}`;
    return (
      <Shell>
        <div className="space-y-5 text-center">
          <p className="text-sm text-text-secondary">
            Te invitaron a unirte a{" "}
            <span className="text-text-primary font-medium">
              {preview.organizationName}
            </span>{" "}
            como <span className="text-accent-primary">{roleLabel}</span>.
          </p>
          <p className="text-xs text-text-muted">
            Inicia sesión o crea una cuenta con{" "}
            <span className="text-text-secondary">{preview.email}</span> para
            aceptar.
          </p>
          <div className="space-y-2">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callback)}`}
              className="block w-full rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90"
            >
              Iniciar sesión
            </Link>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(callback)}`}
              className="block w-full rounded-[var(--radius-md)] border border-border-primary px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-hover"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // Autenticado con un email distinto al de la invitación
  if (session.user.email !== preview.email) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-accent-warning mx-auto" />
          <p className="text-sm text-text-primary">
            Esta invitación es para{" "}
            <span className="font-medium">{preview.email}</span>, pero iniciaste
            sesión como{" "}
            <span className="font-medium">{session.user.email}</span>.
          </p>
          <p className="text-xs text-text-muted">
            Cierra sesión e ingresa con la cuenta correcta para aceptar.
          </p>
        </div>
      </Shell>
    );
  }

  // Autenticado con el email correcto: mostrar botón de aceptar
  return (
    <Shell>
      <AcceptInviteClient
        token={token}
        organizationName={preview.organizationName}
        roleLabel={roleLabel}
      />
    </Shell>
  );
}
