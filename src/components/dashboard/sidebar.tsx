"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart3,
  Tags,
  Wallet,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const STORAGE_KEY = "finanzapp-sidebar-collapsed";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: Target },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/accounts", label: "Cuentas", icon: Wallet },
];

const bottomLinks = [
  { href: "/settings", label: "Configuracion", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";
  const userInitials = getInitials(userName);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-bg-secondary border-r border-border-primary transition-all duration-200",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
          {!collapsed && (
            <span className="font-[family-name:var(--font-dm-sans)] text-lg font-bold text-text-primary truncate">
              FinanzApp
            </span>
          )}
          {collapsed && (
            <span className="font-[family-name:var(--font-dm-sans)] text-lg font-bold text-text-primary">
              F
            </span>
          )}
        </Link>
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        {/* Close button (mobile only) */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="flex md:hidden h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Cerrar menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-3 pt-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={cn("sidebar-link", active && "active")}
              title={collapsed ? link.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-3 border-t border-border-primary" />

        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={cn("sidebar-link", active && "active")}
              title={collapsed ? link.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-primary px-3 py-3 space-y-2">
        {/* User */}
        <div className="flex items-center gap-2 px-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-xs font-medium text-text-secondary">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {userName}
              </p>
              <p className="truncate text-xs text-text-muted">
                {userEmail}
              </p>
            </div>
          )}
        </div>

        {/* Theme toggle + sign out */}
        <div className={cn("flex gap-1", collapsed ? "flex-col items-center" : "items-center")}>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-text-muted hover:text-accent-danger hover:bg-bg-hover transition-colors"
            aria-label="Cerrar sesion"
            title="Cerrar sesion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Slide-in sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 md:hidden animate-in">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
