import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z
    .number({ error: "El monto es requerido" })
    .positive("El monto debe ser mayor a 0"),
  description: z
    .string({ error: "La descripción es requerida" })
    .min(1, "La descripción es requerida")
    .max(200, "Máximo 200 caracteres"),
  notes: z.string().max(500).optional().nullable(),
  date: z.coerce.date({ error: "La fecha es requerida" }),
  isPersonal: z.boolean().default(true),
  categoryId: z.string({ error: "Selecciona una categoría" }).cuid(),
  accountId: z.string({ error: "Selecciona una cuenta" }).cuid(),
});

export const transactionFilterSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
  categoryId: z.string().cuid().optional(),
  accountId: z.string().cuid().optional(),
  isPersonal: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type TransactionFilterData = z.infer<typeof transactionFilterSchema>;
