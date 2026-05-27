"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

export function SettingsThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-text-primary">Modo oscuro</p>
        <p className="text-xs text-text-muted mt-0.5">
          {theme === "dark" ? "Activado" : "Desactivado"}
        </p>
      </div>
      <button
        onClick={toggleTheme}
        className="relative flex items-center w-12 h-6 rounded-full bg-bg-hover border border-border-primary transition-colors"
      >
        <span
          className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-bg-secondary shadow-sm transition-transform ${
            theme === "dark" ? "translate-x-6" : "translate-x-0.5"
          }`}
        >
          {theme === "dark" ? (
            <Moon className="w-3 h-3 text-accent-primary" />
          ) : (
            <Sun className="w-3 h-3 text-accent-warning" />
          )}
        </span>
      </button>
    </div>
  );
}
