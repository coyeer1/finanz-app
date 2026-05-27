"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Preset = "month" | "prev" | "quarter" | "year" | "custom";

export function PeriodSelector({
  onPeriodChange,
}: {
  onPeriodChange: (from: string, to: string) => void;
}) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [preset, setPreset] = useState<Preset>("month");

  function apply(p: Preset, m = month, y = year) {
    setPreset(p);
    let from: Date;
    let to: Date;

    switch (p) {
      case "month":
        from = new Date(y, m, 1);
        to = new Date(y, m + 1, 0);
        break;
      case "prev":
        from = new Date(y, m - 1, 1);
        to = new Date(y, m, 0);
        break;
      case "quarter":
        from = new Date(y, m - 2, 1);
        to = new Date(y, m + 1, 0);
        break;
      case "year":
        from = new Date(y, 0, 1);
        to = new Date(y, 11, 31);
        break;
      default:
        from = new Date(y, m, 1);
        to = new Date(y, m + 1, 0);
    }

    onPeriodChange(from.toISOString().split("T")[0], to.toISOString().split("T")[0]);
  }

  function navigate(dir: -1 | 1) {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
    apply(preset, newMonth, newYear);
  }

  const presets: Array<{ key: Preset; label: string }> = [
    { key: "month", label: "Este mes" },
    { key: "prev", label: "Mes anterior" },
    { key: "quarter", label: "Últimos 3 meses" },
    { key: "year", label: "Este año" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-[family-name:var(--font-dm-sans)] font-medium text-sm text-text-primary min-w-[120px] text-center">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => apply(p.key)}
            className={cn(
              "px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all",
              preset === p.key
                ? "bg-bg-secondary text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
