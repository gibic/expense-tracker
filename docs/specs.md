## Goal

A simple expense tracker for my own use, built with Next.js, TypeScript and PostgreSQL. It lets me record expenses quickly and review spending by month and by category.

## Scope (v1)

Stack: Next.js, TypeScript, PostgreSQL. Single user. Proposed v1 features:

- Add an expense: amount, date, category, optional note
- Edit and delete an expense
- Expense list, filterable by month and category
- Categories: a seeded default set, plus add, rename and delete
- Monthly summary: total spent and a per-category breakdown

## Non-goals

Proposed exclusions for v1; strike any you want in:

- Multiple users, shared accounts or family sharing
- Bank sync or statement import
- Budgets and spending alerts
- Multiple currencies
- Receipt scanning or attachments
- A native mobile app

## Decisions

- **Auth:** Better Auth, with users stored in this app's own Postgres. Add `user_id` to every table from the start, and check the session in the data layer, not only in `proxy.ts`.
- **ORM:** Drizzle.
- **Database:** Neon free plan. Set up a periodic export (CSV or `pg_dump`), since free tiers keep backups minimal.
- **Hosting:** Vercel. The Hobby plan is limited to non-commercial personal use, so recheck the plan if others start using the app.
- **Money:** rupiah only in v1, stored as whole rupiah in a `bigint` column.
- **Mutations:** server actions. Add route handlers only if an external client is needed later.
