# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Gemini CLI, etc.) when working with code in this repository.

## Project overview

A React + TypeScript + Vite landing page for "JumRok" — a homestay booking site for Cambodia (hero search, listings, info/testimonial sections). Built on shadcn/ui components with the `base-maia` style and Tailwind CSS v4.

## Commands

```bash
npm run dev         # start Vite dev server
npm run build       # tsc -b type-check, then vite build
npm run typecheck   # tsc --noEmit only
npm run lint        # eslint .
npm run format      # prettier --write "**/*.{ts,tsx}"
npm run preview     # preview the production build
```

There is no test runner configured in this repo.

## Architecture

- **Entry point**: `src/main.tsx` mounts `<App />` inside `ThemeProvider` (`src/components/theme-provider.tsx`), `AuthProvider` and `BrowserRouter`. `ThemeProvider` manages light/dark theme via a `class` on `<html>`, persisted to `localStorage` (a per-browser preference — the only thing the app itself keeps there), with a `d` keyboard shortcut to toggle.
- **`src/App.tsx`** is the app shell: `NavBar` → `<main>` route table → `Footer`. Public routes: `/`, `/explore`, `/stay/:id`, `/blog`, `/blog/:slug`, `/login`, `/signup`, `/host/signup` (`/host/login` redirects to `/login`). `/profile` is behind `RequireAuth`; every `/admin/*` route (`/admin`, `/admin/approvals`, `/admin/bookings`, `/admin/properties`) is behind `RequireAdmin` — add new admin pages the same way. `*` redirects to `/`. `NavBar` uses `Link` + `useLocation` for its active state, so nav highlighting follows the URL rather than local state.
- **Path alias**: `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`). Always import via `@/...` for anything outside the current directory, matching existing files.
- **`src/pages/<page>/`** — each route owns its own folder containing its page component and that page's section components:
  - `PageName.tsx` (PascalCase) — the route's entry component, composing its sections.
  - Section components live alongside it, either flat (`home/`, `profile/`) or under a `sections/` subfolder (`about/`, `admin/dashboard/`) once a page has enough of them to warrant grouping. A section shared by more than one page graduates to `src/components/` (e.g. `listing-form-modal.tsx`, used by a host's My Listings and the admin's Property Management).
- **`src/pages/home/hero/`** is the one multi-file module, structured as a public/private split:
  - `index.ts` is the only sanctioned import surface for the module (types, subcomponents, and helpers are re-exported from here).
  - `hero-section.tsx` composes `hero-content.tsx` + `search-bar.tsx`; `search-bar.tsx` composes `location-input.tsx`, `date-picker-field.tsx`, `guest-selector.tsx`, `search-button.tsx`.
  - State (search values) is owned by `SearchBar` by default but every subcomponent is independently controlled, so another page can compose the pieces directly instead of using the wrapper (`SearchSummaryBar` and the stay page's booking widget do).
  - `types.ts` holds UI-agnostic shared types (`SearchValues`, `GuestCounts`); `utils.ts` holds shared constants/formatters (`DEFAULT_SEARCH_VALUES`, `formatGuests`).
  - Follow this module's pattern (barrel `index.ts`, JSDoc block at the top of each public component explaining intent/usage, controlled-component props) when adding new multi-file sections.
- **`src/pages/explore/`** is the second such module — the search-results page, and the consumer the hero's individually-exported fields were designed for:
  - `explore.tsx` is composition only; every section lives in `sections/` and is fully controlled.
  - **State lives in the URL, not in React.** `use-explore-state.ts` wraps `useSearchParams`; `utils.ts` holds `parseExploreParams` / `toExploreParams`, which are exact inverses — change one, change the other. This is what makes a result set shareable and refresh-proof, and it is how the hero's search parameters arrive. Link to the page with `` navigate(`/explore?${toExploreSearchString(values)}`) ``.
  - `SearchSummaryBar` composes the hero's `LocationInput` / `CheckInDatePicker` / `CheckOutDatePicker` / `GuestSelector` / `SearchButton` rather than re-implementing them, holding edits as a local draft until submit.
  - `FilterSidebar` is rendered twice — as the desktop rail and inside `FilterPanelTrigger`'s popover on mobile — from one component, so the two cannot drift.
  - Dates are deliberately *not* filtered on here; availability is checked when booking (`create_booking` rejects overlapping dates).
- **Data lives in Supabase.** `src/lib/supabase.ts` is the single client (configured from `.env`); nothing else calls `createClient`. The schema, RLS policies and RPCs are in `supabase/schema.sql`, starter content in `supabase/seed.sql`, and the flows behind every call in `supabase/README.md`.
  - Pages never query Supabase directly. Each domain has a client in `src/lib/` — `auth-client.ts`, `bookings-client.ts`, `host-listings-client.ts`, `payment-methods-client.ts`, `admin-client.ts` — that returns the app's own types and throws `Error`s with readable messages. `src/lib/mappers.ts` is the one place that converts database rows (snake_case) into domain types.
  - The browser only writes the columns `schema.sql` grants; anything that changes a status or prices a booking goes through an RPC (`create_booking`, `cancel_booking`, `submit_listing`, `review_listing`, …). Don't try to set `status`, `role` or totals from the client — the database refuses.
  - Keep `src/types/database.ts` in step with `schema.sql`.
- **Auth**: `AuthProvider` (`src/components/auth-provider.tsx`) follows Supabase Auth (email + password) and exposes `useAuth()` — `user` (the `profiles` row plus the owner-only `profile_private` row), `hostApplication`, and the actions. One `/login` for every role; `landingPathFor(role)` (`src/lib/landing-path.ts`) decides where each lands. Roles go `user` → `host` (an admin approves their host application) → `admin` (promoted in SQL).
- **`src/hooks/use-listings.ts`** / **`use-blog-posts.ts`** load the public catalogue and blog (approved rows only), shared by every page that shows them. They return `null` while loading (render skeletons) and `hasError` on failure, and show the last result instantly on later visits while refreshing in the background. New data-driven components should use them rather than querying again.
- **`src/components/`** is for chrome and pieces shared across pages, not page-specific sections: `NavBar`, `Footer`, `theme-provider`, `auth-provider`, the route guards, shared widgets (`pagination`, `reason-dialog`, `booking-status-badge`, `listing-status-badge`, `listing-form-modal`), and `ui/` (shadcn/ui-managed generic primitives). Add new shadcn primitives with `npx shadcn@latest add <component>` (see `components.json` for style/alias config) rather than hand-rolling them, and reuse the existing ones before building new markup.
- **`src/types/listing.ts`** defines the public `Listing` domain type (`host-listing.ts` is the host/admin view with moderation fields). `ListingCategory` is derived from the `LISTING_CATEGORIES` runtime tuple (with an `isListingCategory` guard for values arriving from the URL) — add to that list rather than widening the type to `string`, and update the matching CHECK constraint in `schema.sql`.
- **Styling**: Tailwind v4 via the `@tailwindcss/vite` plugin, configured through `src/index.css` (no `tailwind.config.js`). Utility class merging uses `cn` (the `cn` npm package, re-exported from `src/lib/utils.ts`) — use `cn(...)` for any conditional/merged className rather than template-string concatenation.
- Some hand-built sections (e.g. `NavBar.tsx`) predate the shadcn/hero conventions and use inline hex colors and template-literal class strings instead of `cn`/design tokens. Prefer the `hero/` module's conventions (typed props, `cn`, JSDoc) for new work rather than copying `NavBar.tsx`.

### Current file tree

```
src/
  main.tsx, App.tsx, index.css

  pages/
    home/                        # "/" — Home.tsx + hero/, listing, info, testimonial sections
    explore/                     # "/explore" — search results (see above)
    stay-details/                # "/stay/:id" — StayDetails.tsx, BookingModal.tsx (request to book)
    blog/, blog-post/            # "/blog", "/blog/:slug"
    login/, signup/              # one login for all roles; signup also serves /host/signup
    profile/                     # "/profile" — Profile.tsx + one file per tab:
                                 #   profile-details, my-bookings, payment-methods,
                                 #   my-listings + booking-requests (hosts only)
    admin/                       # "/admin/*" — admins only
      dashboard/                 #   stats, recent bookings, new registrations
      approvals/                 #   host applications + pending listings
      AdminBookings.tsx          #   every booking: search, filter, cancel
      property-management/       #   every listing: archive, delete, add
    about/                       # scaffolded, not routed yet

  components/                    # shared chrome + widgets; ui/ = shadcn primitives only
  hooks/                         # use-listings.ts, use-blog-posts.ts
  lib/                           # supabase.ts, *-client.ts, mappers.ts, formatters
  types/                         # domain types + database.ts (Supabase schema types)

supabase/
  schema.sql                     # tables, RLS, RPCs, storage — run first
  seed.sql                       # starter stays and blog posts — run second
  README.md                      # setup, roles and the calls behind each flow
```

## Code style

- Prettier config: no semicolons, double quotes, 2-space tabs, trailing commas (ES5), 80-col print width, with `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes) and `cn`/`cva` recognized as class-merging functions for sorting purposes. Some existing files (e.g. `listing-section.tsx`, `NavBar.tsx`, `types/listing.ts`) still have semicolons and aren't yet reformatted. Format the files you actually touched (`npx prettier --write <paths>`) rather than running `npm run format` across the repo — a blanket run reformats those stragglers too and buries your change in hundreds of lines of unrelated churn, which conflicts with whatever teammates have in flight. Reformatting them is worth its own dedicated commit.
- TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on) — fix unused vars/params rather than prefixing with `_`.
