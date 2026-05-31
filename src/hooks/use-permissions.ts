"use client";

import { useSession } from "next-auth/react";

/**
 * Permisos derivados del rol del usuario en sesion.
 * Mientras la sesion carga (role undefined) asumimos escritura permitida
 * para no ocultar botones a usuarios legitimos (la seguridad real esta en
 * el servidor); solo ocultamos cuando el rol es explicitamente restringido.
 */
export function usePermissions() {
  const { data } = useSession();
  const role = data?.user?.role;

  return {
    role,
    // VIEWER no puede crear/editar/eliminar datos
    canWrite: role !== "VIEWER",
    // Solo OWNER/ADMIN gestionan la organizacion (ajustes, invitaciones)
    canManageOrg: role === "OWNER" || role === "ADMIN",
  };
}
