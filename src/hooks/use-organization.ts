"use client";

import { create } from "zustand";

type PersonalFilter = {
  isPersonal: boolean | undefined;
  setPersonal: () => void;
  setEmpresa: () => void;
  setAll: () => void;
};

export const usePersonalFilter = create<PersonalFilter>((set) => ({
  isPersonal: undefined,
  setPersonal: () => set({ isPersonal: true }),
  setEmpresa: () => set({ isPersonal: false }),
  setAll: () => set({ isPersonal: undefined }),
}));
