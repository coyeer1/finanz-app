"use client";

import { create } from "zustand";

type TransactionModalState = {
  isOpen: boolean;
  editId: string | null;
  open: (editId?: string) => void;
  close: () => void;
};

export const useTransactionModal = create<TransactionModalState>((set) => ({
  isOpen: false,
  editId: null,
  open: (editId) => set({ isOpen: true, editId: editId ?? null }),
  close: () => set({ isOpen: false, editId: null }),
}));
