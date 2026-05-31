"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { User, Mail, Lock, Loader2 } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  // Si llega de una invitación, tras registrarse vuelve al link de invitación
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("email", email);
      formData.set("password", password);

      const result = await registerUser(formData);

      if (!result.success) {
        setError(result.error ?? "Error al crear la cuenta");
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl,
      });
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="animate-in w-full max-w-sm">
      <div className="bg-bg-tertiary border border-border-primary rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-[family-name:var(--font-dm-sans)] text-2xl font-bold text-text-primary">
            Finanz<span className="text-accent-primary">.</span>App
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Crea tu cuenta gratuita
          </p>
        </div>

        {/* Register form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="input-wrapper">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-text-muted" />
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-underline"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-text-muted" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-underline"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-muted" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-underline"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-text-muted" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="input-underline"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-accent-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-sm font-medium text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear cuenta
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={
              callbackUrl !== "/onboarding"
                ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/login"
            }
            className="text-accent-primary hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
