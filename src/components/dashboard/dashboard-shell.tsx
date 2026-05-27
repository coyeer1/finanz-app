"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />
      <Topbar onMenuToggle={openMobile} />

      {/* Main content area — shifts right for desktop sidebar */}
      <main className="min-h-screen md:pl-[var(--sidebar-width)] transition-all duration-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </>
  );
}
