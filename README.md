# expens

Single-user expense tracker. Amounts are whole rupiah (IDR only). Built with Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, Drizzle ORM and PostgreSQL.

Design and product docs are in `docs/`: `specs.md`, `data-model.md`, `user-flow.md`, `wireframes.html`.

## Requirements

- Node.js 20 or later
- pnpm
- Docker (for local Postgres)

## Setup

```bash
pnpm install
cp .env.example .env.local
docker compose up -d
pnpm db:migrate
pnpm dev
```

The app runs at http://localhost:3000.

`docker compose up -d` starts Postgres 17 as `expens-db` on port 5432 (user, password and database are all `expens`). Data persists in the `expens_pgdata` volume. Run `docker compose down -v` to wipe it.

## Environment variables

Set these in `.env.local`. `.env.example` lists the defaults.

| Variable             | Description                                              | Local default                                      |
| -------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`       | Postgres connection string                               | `postgresql://expens:expens@localhost:5432/expens` |
| `BETTER_AUTH_SECRET` | Session signing secret (`openssl rand -base64 32`)       | none, must set                                     |
| `BETTER_AUTH_URL`    | App base URL                                             | `http://localhost:3000`                            |
| `OWNER_EMAIL`        | The only email allowed to create the first account       | none, must set                                     |
| `ALLOW_SIGN_UP`      | `true` lets anyone sign up, even after the first account | unset (closed)                                     |

In production, point `DATABASE_URL` at the hosted database (Neon, per `docs/specs.md`).

## Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Start the dev server                         |
| `pnpm build`       | Production build                             |
| `pnpm start`       | Serve the production build                   |
| `pnpm lint`        | Run ESLint                                   |
| `pnpm typecheck`   | Run `tsc --noEmit`                           |
| `pnpm format`      | Format `**/*.{ts,tsx}` with Prettier         |
| `pnpm test`        | Run Vitest (`*.test.ts` next to source)      |
| `pnpm db:generate` | Generate a SQL migration from `db/schema.ts` |
| `pnpm db:migrate`  | Apply pending migrations in `drizzle/`       |
| `pnpm db:studio`   | Open Drizzle Studio                          |

## Database workflow

1. Edit `db/schema.ts`.
2. Run `pnpm db:generate` to create a migration in `drizzle/`.
3. Run `pnpm db:migrate` to apply it.
4. Commit the generated SQL and `drizzle/meta/`.

`db/auth-schema.ts` holds the Better Auth tables.

## Project layout

- `app/`: routes and global styles
- `components/ui/`: shadcn components (style `base-nova`, built on `@base-ui/react`)
- `db/`: Drizzle client and schema
- `drizzle/`: generated migrations
- `lib/`, `hooks/`: shared helpers
- `docs/`: specs, data model, user flows, wireframes

Add a shadcn component with `npx shadcn@latest add <name>`.
