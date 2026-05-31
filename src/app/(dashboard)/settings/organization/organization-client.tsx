"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, UserPlus, Loader2 } from "lucide-react";
import {
  updateOrganization,
  createInviteToken,
  updateMemberRole,
} from "@/actions/organization";
import { CURRENCIES, ROLES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";

interface OrganizationClientProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    currency: string;
    plan: "FREE" | "PRO" | "ENTERPRISE";
  } | null;
  members: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
  }>;
}

export function OrganizationClient({
  organization,
  members,
}: OrganizationClientProps) {
  const { canManageOrg, userId } = usePermissions();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState("");

  const [orgName, setOrgName] = useState(organization?.name ?? "");
  const [currency, setCurrency] = useState(organization?.currency ?? "COP");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviting, setInviting] = useState(false);

  async function handleSave() {
    startTransition(async () => {
      const result = await updateOrganization({ name: orgName, currency });
      if (result.success) {
        setSaveMessage("Guardado");
        setSaveSuccess(true);
        setTimeout(() => setSaveMessage(""), 2000);
        router.refresh();
      } else {
        setSaveMessage(result.error ?? "Error al guardar");
        setSaveSuccess(false);
      }
    });
  }

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    const result = await createInviteToken(inviteEmail, inviteRole);
    if (result.success) {
      setInviteMessage("Invitacion creada. Comparte el link con el usuario.");
      setInviteSuccess(true);
      setInviteEmail("");
    } else {
      setInviteMessage(result.error ?? "Error al invitar");
      setInviteSuccess(false);
    }
    setInviting(false);
    setTimeout(() => setInviteMessage(""), 5000);
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setRoleUpdatingId(memberId);
    setRoleError("");
    const result = await updateMemberRole(memberId, newRole);
    if (result.success) {
      router.refresh();
    } else {
      setRoleError(result.error ?? "Error al cambiar el rol");
      setTimeout(() => setRoleError(""), 4000);
    }
    setRoleUpdatingId(null);
  }

  if (!organization) {
    return (
      <p className="text-text-muted text-sm">No se encontró la organización</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in animate-delay-1 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 space-y-5">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Datos generales
        </h2>

        <div className="space-y-4">
          <div className="input-wrapper">
            <label className="text-xs text-text-muted block mb-1">
              Nombre de la organización
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={!canManageOrg}
              className="input-underline disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!canManageOrg}
              className="input-underline bg-transparent disabled:opacity-60"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {canManageOrg ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-bg-primary text-sm font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Guardar
              </button>
              {saveMessage && (
                <span className={`text-xs ${saveSuccess ? "text-accent-primary" : "text-accent-danger"}`}>{saveMessage}</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              Solo los administradores pueden editar la organización.
            </p>
          )}
        </div>
      </div>

      <div className="animate-in animate-delay-2 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 space-y-5">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Miembros
        </h2>

        <div className="space-y-1">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-2.5 px-2 rounded-[var(--radius-sm)] hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-hover flex items-center justify-center text-xs font-medium text-text-secondary">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    getInitials(member.name ?? member.email)
                  )}
                </div>
                <div>
                  <p className="text-sm text-text-primary">
                    {member.name ?? member.email}
                  </p>
                  {member.name && (
                    <p className="text-xs text-text-muted">{member.email}</p>
                  )}
                </div>
              </div>
              {canManageOrg &&
              member.role !== "OWNER" &&
              member.id !== userId ? (
                <div className="flex items-center gap-2">
                  {roleUpdatingId === member.id && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted" />
                  )}
                  <select
                    value={member.role}
                    disabled={roleUpdatingId === member.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="input-underline bg-transparent text-xs py-1 disabled:opacity-50"
                    aria-label={`Rol de ${member.name ?? member.email}`}
                  >
                    {ROLES.filter((r) => r.value !== "OWNER").map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {ROLES.find((r) => r.value === member.role)?.label ??
                    member.role}
                </span>
              )}
            </div>
          ))}
        </div>

        {roleError && (
          <p className="text-xs text-accent-danger">{roleError}</p>
        )}
      </div>

      {canManageOrg && (
      <div className="animate-in animate-delay-3 rounded-[var(--radius-lg)] border border-border-primary bg-bg-tertiary p-6 space-y-5">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary">
          Invitar miembro
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="input-wrapper flex-1">
            <input
              type="email"
              placeholder="email@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input-underline"
            />
          </div>

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="input-underline bg-transparent w-auto sm:w-40"
          >
            {ROLES.filter((r) => r.value !== "OWNER").map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-bg-primary text-sm font-medium rounded-[var(--radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {inviting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            Invitar
          </button>
        </div>

        {inviteMessage && (
          <p className={`text-xs ${inviteSuccess ? "text-accent-primary" : "text-accent-danger"}`}>{inviteMessage}</p>
        )}
      </div>
      )}
    </div>
  );
}
