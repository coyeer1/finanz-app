"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardToggle({ current }: { current?: boolean }) {
  const router = useRouter();

  function handleChange(value: string) {
    if (value === "all") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?isPersonal=${value}`);
    }
  }

  const active =
    current === true ? "personal" : current === false ? "empresa" : "all";

  return (
    <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-bg-tertiary p-0.5">
      {[
        { key: "all", label: "Todo" },
        { key: "true", label: "Personal", active: "personal" },
        { key: "false", label: "Empresa", active: "empresa" },
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => handleChange(item.key)}
          className={cn(
            "px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all",
            active === (item.active ?? item.key)
              ? item.key === "false"
                ? "bg-bg-secondary text-accent-info shadow-sm"
                : "bg-bg-secondary text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
