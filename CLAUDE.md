# FinanzApp

PWA de finanzas personales y empresariales.

## Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- **Lenguaje:** TypeScript strict mode
- **ORM:** Prisma v7 con PostgreSQL (Supabase) via `@prisma/adapter-pg`
- **Auth:** NextAuth v5 (Auth.js) — Google OAuth + Credentials (bcryptjs)
- **Estilos:** Tailwind CSS v4 con design system custom "Precision Finance"
- **Charts:** Recharts (lazy loaded con `dynamic()`)
- **State:** Zustand (client state mínimo)
- **Validación:** Zod v4 (schemas compartidos client/server)
- **PWA:** @ducanh2912/next-pwa
- **Deploy:** Vercel

## Comandos

```bash
npm run dev          # Dev server con Turbopack
npm run build        # prisma generate + next build
npm run db:push      # Push schema a Supabase
npm run db:seed      # Seed con datos de demo (tsx prisma/seed.ts)
npm run db:studio    # Prisma Studio (visual DB editor)
vercel deploy --prod # Deploy a producción
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/           # Login, register (sin sidebar)
│   ├── (dashboard)/      # Todas las rutas protegidas
│   │   ├── dashboard/    # Dashboard principal (KPIs, charts)
│   │   ├── transactions/ # CRUD transacciones
│   │   ├── budgets/      # Presupuestos mensuales
│   │   ├── categories/   # Gestión de categorías
│   │   ├── accounts/     # Cuentas financieras
│   │   ├── reports/      # Reportes + export CSV
│   │   └── settings/     # Config usuario + organización
│   ├── (marketing)/      # Landing, pricing, features (público)
│   ├── api/auth/         # NextAuth route handler
│   └── onboarding/       # Flujo post-registro
├── actions/              # Server Actions (todos con "use server")
├── components/
│   ├── dashboard/        # Stats, charts, sidebar, topbar
│   ├── transactions/     # Table, form, filters
│   ├── reports/          # Period selector, breakdown charts
│   ├── marketing/        # Hero, features grid, pricing
│   └── shared/           # Theme provider, skeletons, inputs
├── lib/                  # prisma.ts, auth.ts, utils.ts, constants.ts
├── schemas/              # Zod schemas (transaction, budget, category, account)
├── hooks/                # Zustand stores
├── types/                # TypeScript types + next-auth.d.ts
└── proxy.ts              # Auth middleware (Next.js 16 "proxy" convention)
```

## Arquitectura clave

### Multi-tenancy
Cada query de Prisma filtra por `organizationId`. Los helpers `getOrganizationId()` y `requireAuth()` en `lib/auth.ts` extraen la org del JWT.

### Auth flow
1. Usuario se registra → se crea `User` sin `Organization`
2. Proxy middleware redirige a `/onboarding` si no tiene org
3. En onboarding: crea org, se asigna como OWNER, se crean categorías + cuentas default
4. Redirect a `/dashboard`

### Server Actions
Todos en `src/actions/`. Cada uno:
- Empieza con `"use server"`
- Valida auth con `requireAuth()` + `getOrganizationId()`
- Valida input con Zod
- Retorna `{ success: boolean, error?: string, data?: any }`
- Llama `revalidatePath()` después de mutaciones

### Prisma v7
- Usa `@prisma/adapter-pg` (no `datasourceUrl`)
- Config en `prisma.config.ts` (no en schema)
- Connection string: transaction pooler de Supabase (puerto 6543 + `?pgbouncer=true`)

### Next.js 16 (diferencias clave)
- `middleware.ts` se renombró a `proxy.ts`, exporta `proxy()` (no default)
- `searchParams` es `Promise` — hay que hacer `await searchParams`
- `dynamic()` con `ssr: false` solo funciona en Client Components
- Turbopack es el bundler por defecto — config en `turbopack: {}` dentro de next.config.ts

## Design System "Precision Finance"

### Fonts
- **Headers:** DM Sans (weight 500-700) → `font-[family-name:var(--font-dm-sans)]`
- **Números/montos:** JetBrains Mono → `font-[family-name:var(--font-jetbrains-mono)]`
- **REGLA:** Todo monto, porcentaje y KPI DEBE usar JetBrains Mono

### Colores (dark-first)
- Fondos: `bg-bg-primary` (#0a0a0b), `bg-bg-secondary`, `bg-bg-tertiary`, `bg-bg-hover`
- Texto: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Accent: `text-accent-primary` (#22c55e verde), `text-accent-danger` (#ef4444 rojo)
- Bordes: `border-border-primary` (casi invisibles)

### Patrones CSS (en globals.css)
- `.skeleton` — shimmer loading animation
- `.animate-in` + `.animate-delay-N` — staggered page entry
- `.input-wrapper` + `.input-underline` — inputs con borde inferior animado
- `.sidebar-link.active` — borde izquierdo verde 2px
- `.transaction-row` — filas de tabla de 44px
- `.budget-bar-track` + `.budget-bar-fill[data-level]` — barras de progreso con gradiente
- `.category-dot` — círculos de 8px para categorías
- `.tag-personal` / `.tag-empresa` — tags mínimos

### Anti-patterns (NO hacer)
- NO usar Inter, Roboto, Arial, system fonts
- NO gradientes púrpura sobre blanco
- NO spinners — siempre skeleton shimmer
- NO cards idénticas en grid uniforme
- NO empty states genéricos sin personalidad

## Base de datos

### Supabase
- Proyecto: `ugrbxjpzjmyfnrxsjuio`
- Región: us-west-2
- Pooler: `aws-1-us-west-2.pooler.supabase.com`
- RLS: deshabilitado (Prisma conecta como service role)

### Tablas principales
- `Organization` — multi-tenant, plan FREE/PRO/ENTERPRISE
- `User` — con role OWNER/ADMIN/MEMBER/VIEWER
- `Account` — cuentas financieras (banco, efectivo, tarjeta, etc.)
- `Category` — categorías de ingreso/gasto con ícono y color
- `Transaction` — con soft delete (`deletedAt`), toggle personal/empresa
- `Budget` — presupuesto mensual por categoría
- `InviteToken` — invitaciones con expiración 24h

### Credenciales de demo
- Email: `demo@finanzapp.com`
- Password: `password123`

## URLs

- **Producción:** https://finanz-app-kappa.vercel.app
- **Repo:** https://github.com/coyeer1/finanz-app
- **Supabase:** https://supabase.com/dashboard/project/ugrbxjpzjmyfnrxsjuio

## Pendiente / Roadmap

- [ ] Google OAuth (requiere configurar Google Cloud Console)
- [ ] Upload de recibos (Supabase Storage)
- [ ] Stripe para plan Pro
- [ ] Notificaciones por email (Resend ya preparado)
- [ ] Analytics (Plausible/Umami placeholder)
- [ ] Rate limiting (Upstash)
- [ ] Dominio custom
