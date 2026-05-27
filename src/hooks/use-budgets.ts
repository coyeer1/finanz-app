"use client";

import { create } from "zustand";

type BudgetModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useBudgetModal = create<BudgetModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function useBudgetPeriod() {
  const now = new Date();
  return create<{
    month: number;
    year: number;
    next: () => void;
    prev: () => void;
  }>((set) => ({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    next: () =>
      set((state) => {
        if (state.month === 12) return { month: 1, year: state.year + 1 };
        return { month: state.month + 1 };
      }),
    prev: () =>
      set((state) => {
        if (state.month === 1) return { month: 12, year: state.year - 1 };
        return { month: state.month - 1 };
      }),
  }));
}
