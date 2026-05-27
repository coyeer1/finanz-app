"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="flex md:hidden items-center justify-between h-14 px-4 border-b border-border-primary bg-bg-secondary sticky top-0 z-20">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Logo centered */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent-primary" />
        <span className="font-[family-name:var(--font-dm-sans)] text-base font-bold text-text-primary">
          FinanzApp
        </span>
      </div>

      {/* Spacer to balance hamburger */}
      <div className="w-9" />
    </header>
  );
}
