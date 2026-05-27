"use client";

import { useCallback, type ChangeEvent } from "react";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  id?: string;
  className?: string;
  min?: string;
  max?: string;
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  label,
  id,
  className = "",
  min,
  max,
}: DatePickerProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!raw) {
        onChange(null);
        return;
      }
      // Parse as local date to avoid timezone issues
      const [year, month, day] = raw.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      onChange(date);
    },
    [onChange]
  );

  const displayValue = value ? toISODateString(value) : "";

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs text-text-muted mb-1 font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        className="input-underline font-[family-name:var(--font-jetbrains-mono)] text-sm [color-scheme:dark] dark:[color-scheme:dark] [color-scheme:light]:not(.dark *)"
        value={displayValue}
        onChange={handleChange}
        min={min}
        max={max}
      />
    </div>
  );
}
