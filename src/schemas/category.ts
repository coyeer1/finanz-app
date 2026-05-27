import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  icon: z.string().min(1, "Selecciona un ícono"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
