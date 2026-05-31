import { z } from "zod";

export const budgetSchema = z.object({
  amount: z
    .number({ error: "El monto es requerido" })
    .positive("El presupuesto debe ser mayor a 0"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  categoryId: z
    .string({ error: "Selecciona una categoría" })
    .min(1, "Selecciona una categoría"),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
