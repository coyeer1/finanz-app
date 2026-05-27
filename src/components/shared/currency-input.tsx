"use client";

import { useCallback, useRef, type ChangeEvent } from "react";
import { CURRENCIES } from "@/lib/constants";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
}

function getCurrencySymbol(currencyCode: string): string {
  const found = CURRENCIES.find((c) => c.code === currencyCode);
  return found?.symbol ?? "$";
}

function formatDisplay(amount: number, currencyCode: string): string {
  if (amount === 0) return "";
  const isWholeNumber = currencyCode === "COP";
  if (isWholeNumber) {
    return amount.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  // Handle both comma and period as decimal separators
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function CurrencyInput({
  value,
  onChange,
  currency = "COP",
  placeholder = "0",
  label,
  id,
  className = "",
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const symbol = getCurrencySymbol(currency);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "" || raw === "0") {
        onChange(0);
        return;
      }
      const parsed = parseInput(raw);
      onChange(parsed);
    },
    [onChange]
  );

  const displayValue = formatDisplay(value, currency);

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
      <div className="relative flex items-center">
        <span className="absolute left-0 text-text-muted text-sm font-[family-name:var(--font-jetbrains-mono)] select-none pointer-events-none">
          {symbol}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          className="input-underline font-[family-name:var(--font-jetbrains-mono)] text-base pl-5"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
