# FinanzApp

PWA de finanzas personales y empresariales.

## Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions, Turbopack)
- **Lenguaje:** TypeScript strict mode
- **ORM:** Prisma v7 con PostgreSQL (Supabase) via `@prisma/adapter-pg`
- **Auth:** NextAuth v5 (Auth.js) — Google OAuth + Credentials (bcryptjs v3, import como `import * as bcrypt from "bcryptjs"`)
- **Estilos:** Tailwind CSS v4 con design system custom "Precision Finance"
- **Charts:** Recharts (lazy loaded con `dynamic()` — SOLO en Client Components)
- **State:** Zustand (client state mínimo)
- **Validación:** Zod v4 (usa `{ error: "..." }` en vez de `{ required_error: "..." }`)
- **PWA:** @ducanh2912/next-pwa
- **Deploy:** Vercel
- **MCPs configurados:** Supabase, Playwright (Firefox), Vercel — config en `~/.mcp.json`

## Comandos

```bash
npm run dev          # Dev server con Turbopack
npm run build        # prisma generate + next build
npm run db:push      # Push schema a Supabase
npm run db:seed      # Seed con datos de demo (tsx prisma/seed.ts)
npm run db:studio    # Prisma Studio (visual DB editor)
vercel deploy --prod # Deploy a producción
git push origin main # Push a GitHub (auto-deploy NO configurado)
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
│   └── onboarding/       # Flujo post-registro (protegido, requiere auth)
├── actions/              # Server Actions (todos con "use server")
├── components/
│   ├── dashboard/        # Stats, charts, sidebar, topbar, dashboard-shell
│   ├── transactions/     # Table, form, filters
│   ├── reports/          # Period selector, breakdown charts
│   ├── marketing/        # Hero, features grid, pricing
│   └── shared/           # Providers, theme-provider, skeletons, inputs
├── lib/                  # prisma.ts, auth.ts, utils.ts, constants.ts
├── schemas/              # Zod schemas (transaction, budget, category, account)
├── hooks/                # Zustand stores
├── types/                # TypeScript types + next-auth.d.ts
└── proxy.ts              # Auth proxy (Next.js 16 convention, protege TODAS las rutas dashboard)
```

## Arquitectura clave

### Multi-tenancy
Cada query de Prisma filtra por `organizationId`. Los helpers `getOrganizationId()` y `requireAuth()` en `lib/auth.ts` extraen la org del JWT.

### Auth flow
1. Usuario se registra → se crea `User` sin `Organization`
2. Proxy redirige a `/onboarding` si no tiene org (protege /dashboard, /transactions, /budgets, /categories, /accounts, /reports, /settings)
3. En onboarding: crea org, se asigna como OWNER, se crean categorías + cuentas default
4. Se actualiza el JWT con `updateSession({ organizationId })` para evitar redirect loop
5. Redirect a `/dashboard`

### Providers (root layout)
`src/components/shared/providers.tsx` envuelve la app con:
- `SessionProvider` (next-auth/react) — necesario para `useSession()` y `signOut()` en client components
- `ThemeProvider` — dark/light mode con localStorage

### Server Actions
Todos en `src/actions/`. Cada uno:
- Empieza con `"use server"`
- Valida auth con `requireAuth()` + `getOrganizationId()`
- Valida input con Zod
- Retorna `{ success: boolean, error?: string, data?: any }`
- Llama `revalidatePath()` después de mutaciones

### Client Components con datos del server
Patrón: Server Component fetch → pasa data a Client Component via props → Client Component usa `useEffect` para sincronizar state cuando props cambian. No usar solo `useState(initialValue)` porque React no lo re-inicializa en re-renders.

### Prisma v7
- Usa `@prisma/adapter-pg` (no `datasourceUrl` — eliminado en v7)
- Config en `prisma.config.ts` (no en schema, sin `earlyAccess`)
- Datasource en schema: solo `provider = "postgresql"` (sin url/directUrl)
- Connection string: transaction pooler de Supabase (puerto 6543 + `?pgbouncer=true`)

### Next.js 16 (diferencias clave)
- `middleware.ts` se renombró a `proxy.ts`, exporta `export async function proxy(request)` (no default export)
- `searchParams` es `Promise` — hay que hacer `const params = await searchParams`
- `dynamic()` con `ssr: false` solo funciona en Client Components — usar wrapper component
- Turbopack es el bundler por defecto — necesita `turbopack: {}` en next.config.ts si hay config webpack (PWA plugin)
- `suppressHydrationMismatch` no existe en `<html>` — no usarlo

### Sidebar
- Collapsed state se guarda en localStorage (`finanzapp-sidebar-collapsed`)
- `dashboard-shell.tsx` lee ese valor y ajusta `--sidebar-offset` CSS var
- En mobile: sidebar es overlay con backdrop, topbar visible con hamburguesa
- Main content tiene `pt-14 md:pt-0` para no quedar oculto bajo topbar mobile

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
- Pooler host: `aws-1-us-west-2.pooler.supabase.com` (NO us-east-1)
- Transaction mode: puerto 6543, Session mode: puerto 5432
- RLS: deshabilitado (Prisma conecta como service role)
- Direct connection: solo IPv6 (no funciona desde máquinas sin IPv6)

### Tablas principales
- `Organization` — multi-tenant, plan FREE/PRO/ENTERPRISE, campo `currency`
- `User` — con role OWNER/ADMIN/MEMBER/VIEWER, `organizationId` nullable (null hasta onboarding)
- `Account` — cuentas financieras (banco, efectivo, tarjeta, etc.), `currentBalance` se actualiza automáticamente
- `Category` — categorías de ingreso/gasto con ícono lucide y color hex
- `Transaction` — con soft delete (`deletedAt`), toggle `isPersonal`
- `Budget` — presupuesto mensual por categoría, `spent` se calcula dinámicamente
- `InviteToken` — invitaciones con expiración 24h

### Usuarios
- **Owner:** thenshikibi@gmail.com (org: Finanzas Personales)
- **Miembros:** theroutke@gmail.com (Twixper), juangonarias@gmail.com (Juanito)
- **Demo:** demo@finanzapp.com / password123 (org: Demo Company)

## URLs

- **Producción:** https://finanz-app-kappa.vercel.app
- **Repo:** https://github.com/coyeer1/finanz-app
- **Supabase:** https://supabase.com/dashboard/project/ugrbxjpzjmyfnrxsjuio
- **Vercel:** https://vercel.com/cristhianjuan123-2913s-projects/finanz-app

## Bugs conocidos resueltos

- bcryptjs v3: importar como `import * as bcrypt from "bcryptjs"` (no default import)
- Onboarding redirect loop: después de crear org, llamar `updateSession()` para refrescar JWT
- Supabase pooler: host es `aws-1-us-west-2`, NO `aws-0-us-east-1`
- Client state stale: usar `useEffect` para sincronizar props del server, no solo `useState(initial)`
- Chart Y-axis: usar formato adaptativo (M/k/plain) para soportar diferentes monedas

## Pendiente / Roadmap

- [ ] Google OAuth (requiere configurar Google Cloud Console + GOOGLE_CLIENT_ID/SECRET en Vercel)
- [ ] Upload de recibos (Supabase Storage)
- [ ] Stripe para plan Pro (webhook endpoint ya existe en /api/webhooks/stripe)
- [ ] Notificaciones por email (Resend preparado, falta RESEND_API_KEY)
- [ ] Analytics (Plausible/Umami placeholder)
- [ ] Rate limiting (Upstash)
- [ ] Dominio custom (configurar en Vercel + actualizar NEXTAUTH_URL y NEXT_PUBLIC_APP_URL)
- [ ] Tests (unit + e2e con Playwright)
- [ ] PWA icons reales (actualmente son placeholders 1x1px)
- [ ] OG image real para SEO
