# FinanzApp

PWA de finanzas personales y empresariales. Controla ingresos, gastos, presupuestos y reportes. Separa finanzas personales y de empresa. Multiusuario.

**Live:** https://finanz-app-kappa.vercel.app

## Stack

Next.js 16 · TypeScript · Prisma v7 · PostgreSQL (Supabase) · NextAuth v5 · Tailwind CSS v4 · Recharts · Zustand · PWA

## Quick Start

```bash
# Clonar e instalar
git clone https://github.com/coyeer1/finanz-app.git
cd finanz-app
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Push schema a la DB
npm run db:push

# Seed con datos de demo
npm run db:seed

# Dev server
npm run dev
```

## Demo

- **Email:** demo@finanzapp.com
- **Password:** password123

## Features

- Transacciones (CRUD completo con filtros, paginación cursor-based, soft delete)
- Cuentas financieras (banco, efectivo, tarjeta, ahorros, inversión)
- Categorías personalizables con íconos y colores
- Presupuestos mensuales con barras de progreso
- Dashboard con KPIs, gráficos de tendencia y breakdown por categoría
- Reportes con export a CSV
- Toggle personal / empresa en toda la app
- Multi-tenant con roles (Owner, Admin, Member, Viewer)
- Sistema de invitaciones por email
- Auth con Google OAuth + email/password
- Dark mode por defecto, light mode disponible
- PWA instalable
- SEO completo (sitemap, robots, JSON-LD, OG tags)

## License

MIT
