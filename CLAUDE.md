# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager: pnpm.

- `pnpm dev` — dev server
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm format` — Prettier on `**/*.{ts,tsx}` (uses `prettier-plugin-tailwindcss`)

- `pnpm test` — Vitest (node env), `*.test.ts` colocated next to source

## Product and design docs

Planned app: single-user expense tracker (rupiah only). Read before building features:

- `docs/specs.md` — scope, non-goals, stack decisions: Better Auth, Drizzle, Postgres (Neon), Vercel, server actions (no route handlers unless external client needed).
- `docs/data-model.md` — `expenses` + `categories` tables, indexes, month queries, seeding via Better Auth `databaseHooks.user.create.after`.
- `docs/user-flow.md` — flows and validation rules.
- `docs/wireframes.html` — look to match. Canonical canvas: https://claude.ai/artifact/5xbQbbBLfzUy2Gh9qvmGzx (read with Artifact tool).

Rules that span files:

- Money = whole rupiah in `bigint`, `amount > 0`. Display `Rp 2.557.000` (dot thousands).
- Every table has `user_id` (text FK to Better Auth `user.id`). Check session in the data layer, not only in `proxy.ts`.
- `expenses.category_id` is `on delete restrict`: deleting a used category must be blocked in UI too.
- `expenses.date` is a plain `date`; month filters use `[first of month, first of next month)`.
- Only route handler: `app/api/auth/[...all]/route.ts`, Better Auth's HTTP endpoint. App forms use server actions. Sign-in and sign-up actions call `auth.handler` (see `app/sign-in/actions.ts`), not `auth.api.*`, because only the HTTP router applies Better Auth's rate limit.
- `lib/auth.ts` and `db/` are server code. Shared constants that client components need go in `lib/` files without server imports (e.g. `lib/categories.ts`).

## Architecture

Early-stage Next.js 16 (App Router, React 19, Tailwind v4) app, scaffolded from shadcn/ui template. Currently only placeholder `app/page.tsx`. Auth, Drizzle and DB not installed yet (see `docs/specs.md`).

- `app/` — routes. `layout.tsx` wraps children in `ThemeProvider` (`next-themes`, `components/theme-provider.tsx`); fonts via `next/font/google` (Inter → `--font-sans`, Geist Mono → `--font-mono`). Styles/theme tokens in `app/globals.css`.
- `components/ui/` — shadcn components. Style `base-nova`, built on `@base-ui/react` (not Radix). Base color `stone`, icons `lucide-react`. `rsc: true`.
- `lib/utils.ts` — `cn()` helper. `hooks/` — shared hooks (empty).
- Path alias `@/*` maps to repo root.
- Add components with `npx shadcn@latest add <name>`; `components.json` holds aliases. Use `shadcn` skill for component work.
- Next.js docs for this version are in `node_modules/next/dist/docs/` — read before writing Next code (see AGENTS.md).
