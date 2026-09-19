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

- **Entry point**: `src/main.tsx` mounts `<App />` inside `ThemeProvider` (`src/components/theme-provider.tsx`), which manages light/dark theme via a `class` on `<html>`, persisted to `localStorage`, with a `d` keyboard shortcut to toggle.
- **`src/App.tsx`** is the app shell: `NavBar` → `<main><Home /></main>` → `Footer`. There is no router wired up yet (no `react-router-dom` in `package.json`) — `about` and `profile` are scaffolded but not reachable from the app; wiring up routing means swapping `<Home />` for a route table that also renders `<About />` / `<Profile />`.
- **Path alias**: `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`). Always import via `@/...` for anything outside the current directory, matching existing files.
- **`src/pages/<page>/`** — each route owns its own folder containing its page component and that page's section components:
  - `PageName.tsx` (PascalCase) — the route's entry component, composing its sections. Every page has exactly one (`Home.tsx`, `About.tsx`, `Profile.tsx`).
  - Section components live alongside it, either flat (`home/`, `profile/`) or under a `sections/` subfolder (`about/`) once a page has enough of them to warrant grouping. A section shared by more than one page graduates to `src/components/`.
- **`src/pages/home/hero/`** is the one multi-file module, structured as a public/private split:
  - `index.ts` is the only sanctioned import surface for the module (types, subcomponents, and helpers are re-exported from here).
  - `hero-section.tsx` composes `hero-content.tsx` + `search-bar.tsx`; `search-bar.tsx` composes `location-input.tsx`, `date-picker-field.tsx`, `guest-selector.tsx`, `search-button.tsx`.
  - State (search values) is owned by `SearchBar` by default but every subcomponent is independently controlled, so a future page (e.g. a results page with URL-synced filters) can compose the pieces directly instead of using the wrapper.
  - `types.ts` holds UI-agnostic shared types (`SearchValues`, `GuestCounts`); `utils.ts` holds shared constants/formatters (`DEFAULT_SEARCH_VALUES`, `formatGuests`).
  - Follow this module's pattern (barrel `index.ts`, JSDoc block at the top of each public component explaining intent/usage, controlled-component props) when adding new multi-file sections.
- **`src/components/`** is for chrome/primitives shared across pages, not page-specific sections: `NavBar.tsx`, `Footer.tsx`, `theme-provider.tsx`, and `ui/` (shadcn/ui-managed generic primitives — `button`, `card`, `popover`, `calendar`, `avatar`, `badge`, `input`, `separator`). Add new shadcn primitives with `npx shadcn@latest add <component>` (see `components.json` for style/alias config) rather than hand-rolling them.
- **`src/types/listing.ts`** defines the `Listing` domain type (category is a string literal union, not a free string — extend the union rather than widening it to `string`). `ListingSection` (`src/pages/home/listing-section.tsx`) fetches `/data/listings.json` (served from `public/data/listings.json`) at runtime rather than importing it as a module — there is no backend/API layer yet, so any new data-driven component should follow the same static-JSON-fetch pattern until one exists.
- **Styling**: Tailwind v4 via the `@tailwindcss/vite` plugin, configured through `src/index.css` (no `tailwind.config.js`). Utility class merging uses `cn` (the `cn` npm package, re-exported from `src/lib/utils.ts`) — use `cn(...)` for any conditional/merged className rather than template-string concatenation.
- Some hand-built sections (e.g. `NavBar.tsx`) predate the shadcn/hero conventions and use inline hex colors and template-literal class strings instead of `cn`/design tokens. Prefer the `hero/` module's conventions (typed props, `cn`, JSDoc) for new work rather than copying `NavBar.tsx`.

### Current file tree

```
src/
  main.tsx, App.tsx, index.css

  pages/
    home/                        # rendered today, via App.tsx
      Home.tsx                   # composes the sections below
      hero/                      # index.ts, hero-section.tsx, hero-content.tsx, search-bar.tsx,
                                  # location-input.tsx, date-picker-field.tsx, guest-selector.tsx,
                                  # search-button.tsx, search-field.tsx, types.ts, utils.ts
      listing-section.tsx
      info-section.tsx
      testimonial-section.tsx
    about/                       # scaffolded, not routed yet
      About.tsx                  # (empty)
      sections/
        company-history.tsx      # (empty)
        team-info.tsx            # (empty)
    profile/                     # scaffolded, not routed yet
      Profile.tsx                # (empty)
      profile-details.tsx        # (empty)

  components/
    NavBar.tsx, Footer.tsx, theme-provider.tsx
    ui/                          # shadcn primitives only
      avatar.tsx, badge.tsx, button.tsx, calendar.tsx, card.tsx,
      input.tsx, popover.tsx, separator.tsx

  types/
    listing.ts
  lib/
    utils.ts
  assets/
```

## Code style

- Prettier config: no semicolons, double quotes, 2-space tabs, trailing commas (ES5), 80-col print width, with `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes) and `cn`/`cva` recognized as class-merging functions for sorting purposes. Run `npm run format` before committing — some existing files (e.g. `listing-section.tsx`, `NavBar.tsx`, `types/listing.ts`) still have semicolons and aren't yet reformatted.
- TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on) — fix unused vars/params rather than prefixing with `_`.
