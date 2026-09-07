# AGENTS.md — paisajesmineros

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui (new-york, neutral, CSS vars). Scaffold Dyad/blank, `src/app/page.tsx` es placeholder.

## Structure

- `src/app/layout.tsx` — root layout (Geist fonts, `globals.css`); `src/app/page.tsx` — única ruta `/`.
- `src/components/ui/` — shadcn/Radix (fuente primaria de UI); `src/components/made-with-dyad.tsx` — badge Dyad.
- `src/lib/utils.ts` — helpers (`cn`); `src/hooks/` — solo `use-mobile.tsx`. Sin `src/app/api/` todavía.
- Alias `@/*` → `./src/*` (`tsconfig.json`); shadcn aliases en `components.json`.

## Commands

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` (`next lint`).
- Typecheck sin script dedicado: `npx tsc --noEmit`.
- Sin tests, sin CI, sin e2e. Verificar con `build` + `tsc --noEmit` tras cambios lógicos.
- No hay `.env`; no se necesita setup local más allá de `npm install`.

## Conventions (fuentes: `AI_RULES.md`, `docs/mcode-rules.md` vía `opencode.json`)

- UI: reutilizar `src/components/ui/`; nuevo componente sobre primitivas Radix + Tailwind, en `src/components/`. Iconos `lucide-react`, toasts `Sonner`, charts `recharts`, forms `react-hook-form + zod + @hookform/resolvers`.
- Estilo solo con utilidades Tailwind; `globals.css` solo para directivas base y CSS vars. Prohibido CSS-in-JS y nuevas librerías UI sin discutir.
- Estado: `useState`/`useReducer` local, Context para compartido. Fetch nativo en cliente; Route Handlers o Server Actions en servidor.
- TS estricto, evitar `any`.
- Lint/typecheck **una sola vez al final** de todos los edits, solo ficheros tocados; máx 1 ciclo lint→fix→lint. Omitir lint si solo cambió CSS/texto/estáticos. No explicar `npm run dev` al usuario (preview lo gestiona mCode).

## Gotchas

- `next.config.ts` inyecta `@dyad-sh/nextjs-webpack-component-tagger` solo en `NODE_ENV=development`. No tocar ese bloque webpack.
- `next-env.d.ts` y `.next/` son generados; no editar.
