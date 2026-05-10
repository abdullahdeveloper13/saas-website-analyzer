# AI Website Feedback Platform

Production-oriented Next.js 15 (App Router) SaaS starter: users submit a public website URL and receive structured AI feedback across eight scored dimensions. Data persists in Supabase with row level security; OpenAI powers real analyses when `OPENAI_API_KEY` is set.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- Supabase Auth (email/password + magic links) and Postgres
- OpenAI GPT-4o-mini (JSON mode) with deterministic mock fallback
- Framer Motion, Lucide, Recharts, jsPDF, Stripe Checkout + Customer Portal, next-themes 

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill at least:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (optional for mock mode)

3. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - Run `supabase/schema.sql` in the SQL editor (tables: `profiles`, `reports`, `subscriptions` + RLS + auth trigger).
   - Enable **Email** auth and (optionally) confirm email settings for your environment.
   - Add `http://localhost:3000/auth/callback` (and your production URL) to **Redirect URLs**.

4. **Dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`, sign up, then open `/dashboard`.

## Project structure (high level)

- `src/app/(marketing)` — landing, features, pricing
- `src/app/(auth)` — login & signup
- `src/app/dashboard` — protected workspace (overview, history, settings, admin)
- `src/app/api/analyze` — optional JSON API (session cookie)
- `src/app/api/webhooks/stripe` — Stripe billing webhooks (subscription sync)
- `src/lib/openai` — fetch HTML snippet + model prompt
- `src/lib/analysis/pipeline.ts` — shared URL → analysis pipeline
- `supabase/schema.sql` — database definition

## Commands

```bash
npm run dev    # local dev
npm run build  # production build
npm run start  # run production server
npm run lint   # eslint
```

## Stripe billing

1. Create **Products** and **recurring Prices** in Stripe; set `STRIPE_PRICE_PRO` (and optionally `STRIPE_PRICE_TEAM`).
2. Add `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → Settings → API) so the **webhook** can upsert `public.subscriptions` (bypasses RLS).
3. Set `NEXT_PUBLIC_SITE_URL` to your deployed origin (or `http://localhost:3000` locally).
4. Create a webhook endpoint pointing to `https://your-domain/api/webhooks/stripe` and subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Enable the **Customer portal** in Stripe Dashboard (Billing → Customer portal) so “Manage billing” works.
6. Signed-in users: **Pricing** → Pro/Team opens Checkout; after payment, **Settings** shows plan status and portal link.

## Notes

- Without `OPENAI_API_KEY`, analyses are **mocked** so UI and DB flows still work.
- PDF export and charts are client-side; large reports may need pagination for PDFs.
- Set `ADMIN_EMAILS` (comma-separated) to allow `/dashboard/admin` for those accounts.
