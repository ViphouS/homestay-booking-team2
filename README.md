# JumRok

A homestay booking site for Cambodia. Guests search and book stays, hosts list their homes, and admins approve hosts and listings. It's built with React, TypeScript, Vite and shadcn/ui, and all data lives in [Supabase](https://supabase.com).

## Run it locally

1. Set up the Supabase project once by following [`supabase/README.md`](supabase/README.md): run the schema, seed the starter content, create an admin.
2. Copy `.env.example` to `.env` and add the project's URL and publishable key.
3. Install and start:

   ```bash
   npm install
   npm run dev
   ```

The other commands (`build`, `lint`, `typecheck`, `format`) are listed in [AGENTS.md](AGENTS.md#commands).

## Roles

- **Guest (user):** anyone who signs up. Books stays and saves cards.
- **Host:** a user who applied through "Become a Host" and was approved by an admin. Adds listings and sees booking requests with guests' contact details.
- **Admin:** set up by hand ([`supabase/make-admin.sql`](supabase/make-admin.sql)). Approves hosts and listings and manages bookings and properties at `/admin`.

Everyone logs in at the same `/login` and lands on the page for their role.

## Deploy to Vercel

1. Import the repo in Vercel. It detects Vite on its own; the build command is `npm run build` and the output is `dist`.
2. In **Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the same values as `.env`. Redeploy after adding them, because Vite bakes them in at build time.
3. In Supabase, go to **Authentication → URL Configuration**. Set **Site URL** to your Vercel address (e.g. `https://homestay-booking-team2.vercel.app`) and add it under **Redirect URLs**. Confirmation emails use this address.

[`vercel.json`](vercel.json) sends every path to `index.html`, so refreshing on a page like `/explore` or `/admin` works.

## Project structure

See [AGENTS.md](AGENTS.md) for the architecture and conventions: how pages, shared components, the Supabase data clients and the shadcn primitives are organised.
