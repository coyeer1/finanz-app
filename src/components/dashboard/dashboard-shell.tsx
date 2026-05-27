"use client";

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const SIDEBAR_STORAGE_KEY = "finanzapp-sidebar-collapsed";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Sync with sidebar's collapsed state via localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setSidebarCollapsed(stored === "true");
    }

    function handleStorageChange(e: StorageEvent) {
      if (e.key === SIDEBAR_STORAGE_KEY) {
        setSidebarCollapsed(e.newValue === "true");
      }
    }

    // Poll for same-tab changes (storage event only fires cross-tab)
    const interval = setInterval(() => {
      const current = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
      setSidebarCollapsed((prev) => (prev !== current ? current : prev));
    }, 300);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />
      <Topbar onMenuToggle={openMobile} />

      {/* Main content area — shifts right for desktop sidebar, top padding for mobile topbar */}
      <main
        className="min-h-screen pt-14 md:pt-0 transition-[padding] duration-200"
        style={
          // Apply sidebar offset only for desktop (controlled by md: breakpoint via CSS class)
          // The actual padding-left is applied via md:pl- but we need dynamic values
          // so we use a CSS custom property
          { ["--sidebar-offset" as string]: sidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)" } as React.CSSProperties
        }
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
