import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border-primary bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-dm-sans)] text-lg font-bold text-text-primary"
          >
            <span className="w-2 h-2 rounded-full bg-accent-primary" />
            FinanzApp
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <Link href="/features" className="hover:text-text-primary transition-colors">
              Funcionalidades
            </Link>
            <Link href="/pricing" className="hover:text-text-primary transition-colors">
              Precios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-accent-primary text-bg-primary rounded-[var(--radius-md)] font-medium hover:opacity-90 transition-opacity"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border-primary py-12 px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-[family-name:var(--font-dm-sans)] font-bold text-text-primary mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-primary" />
              FinanzApp
            </div>
            <p className="text-sm text-text-muted">
              Control total de tus finanzas personales y de empresa.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Producto</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/features" className="hover:text-text-primary">Funcionalidades</Link></li>
              <li><Link href="/pricing" className="hover:text-text-primary">Precios</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><span className="text-text-muted">Términos de servicio</span></li>
              <li><span className="text-text-muted">Política de privacidad</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><span className="text-text-muted">Contacto</span></li>
              <li><span className="text-text-muted">FAQ</span></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-8 pt-8 border-t border-border-primary text-center text-xs text-text-muted">
          © {new Date().getFullYear()} FinanzApp. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
