import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "SAVINGS", "INVESTMENT", "OTHER"]),
  currency: z.string().default("COP"),
  initialBalance: z.number().default(0),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6366f1"),
  icon: z.string().default("wallet"),
});

export type AccountFormData = z.infer<typeof accountSchema>;
