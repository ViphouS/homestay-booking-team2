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

- **Entry point**: `src/main.tsx` mounts `<App />` inside `ThemeProvider` (`src/components/theme-provider.tsx`) and `BrowserRouter`. `ThemeProvider` manages light/dark theme via a `class` on `<html>`, persisted to `localStorage`, with a `d` keyboard shortcut to toggle.
- **`src/App.tsx`** is the app shell: `NavBar` → `<main>` route table → `Footer`. Routes are `/` (`Home`) and `/explore` (`Explore`), with `*` redirecting to `/`. `about` and `profile` are scaffolded but still empty — adding them means a `<Route>` each, nothing more. `NavBar` uses `Link` + `useLocation` for its active state, so nav highlighting follows the URL rather than local state.
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
- **`src/pages/explore/`** is the second such module — the search-results page, and the consumer the hero's individually-exported fields were designed for:
  - `explore.tsx` is composition only; every section lives in `sections/` and is fully controlled.
  - **State lives in the URL, not in React.** `use-explore-state.ts` wraps `useSearchParams`; `utils.ts` holds `parseExploreParams` / `toExploreParams`, which are exact inverses — change one, change the other. This is what makes a result set shareable and refresh-proof, and it is how the hero's search parameters arrive. Link to the page with `` navigate(`/explore?${toExploreSearchString(values)}`) ``.
  - `SearchSummaryBar` composes the hero's `LocationInput` / `CheckInDatePicker` / `CheckOutDatePicker` / `GuestSelector` / `SearchButton` rather than re-implementing them, holding edits as a local draft until submit.
  - `FilterSidebar` is rendered twice — as the desktop rail and inside `FilterPanelTrigger`'s popover on mobile — from one component, so the two cannot drift.
  - Dates are deliberately *not* filtered on: the static catalogue has no availability calendar, so they pass through to the UI only. Wire them up when a booking API exists.
- **`src/hooks/use-listings.ts`** is the single fetch of `/data/listings.json`, shared by `ListingSection` and `Explore`. Returns `null` listings while loading (render skeletons) and `hasError` on failure. New data-driven components should use it rather than fetching again.
- **`src/components/`** is for chrome/primitives shared across pages, not page-specific sections: `NavBar.tsx`, `Footer.tsx`, `theme-provider.tsx`, and `ui/` (shadcn/ui-managed generic primitives — `button`, `card`, `popover`, `calendar`, `avatar`, `badge`, `input`, `separator`). Add new shadcn primitives with `npx shadcn@latest add <component>` (see `components.json` for style/alias config) rather than hand-rolling them.
- **`src/types/listing.ts`** defines the `Listing` domain type. `ListingCategory` is derived from the `LISTING_CATEGORIES` runtime tuple (with an `isListingCategory` guard for values arriving from the URL or JSON) — add to that list rather than widening the type to `string`. The catalogue is served from `public/data/listings.json` and fetched at runtime rather than imported as a module; there is no backend/API layer yet, so any new data-driven component should go through `useListings` until one exists.
- **Styling**: Tailwind v4 via the `@tailwindcss/vite` plugin, configured through `src/index.css` (no `tailwind.config.js`). Utility class merging uses `cn` (the `cn` npm package, re-exported from `src/lib/utils.ts`) — use `cn(...)` for any conditional/merged className rather than template-string concatenation.
- Some hand-built sections (e.g. `NavBar.tsx`) predate the shadcn/hero conventions and use inline hex colors and template-literal class strings instead of `cn`/design tokens. Prefer the `hero/` module's conventions (typed props, `cn`, JSDoc) for new work rather than copying `NavBar.tsx`.

### Current file tree

```
src/
  main.tsx, App.tsx, index.css

  pages/
    home/                        # route "/"
      Home.tsx                   # composes the sections below
      hero/                      # index.ts, hero-section.tsx, hero-content.tsx, search-bar.tsx,
                                  # location-input.tsx, date-picker-field.tsx, guest-selector.tsx,
                                  # search-button.tsx, search-field.tsx, types.ts, utils.ts
      listing-section.tsx
      info-section.tsx
      testimonial-section.tsx
    explore/                     # route "/explore" — search results
      index.ts                   # the module's only sanctioned import surface
      explore.tsx                # composition/layout only
      use-explore-state.ts       # URL <-> page state
      types.ts, utils.ts         # filters/sort types; URL codec, query + format helpers
      sections/
        search-summary-bar.tsx   # the hero's fields, reused and still editable
        explore-header.tsx
        filter-sidebar.tsx       # desktop rail AND mobile popover body
        filter-panel-trigger.tsx # mobile entry point to the sidebar
        filter-chip-group.tsx    # one multi-select facet
        price-range-field.tsx
        active-filters.tsx       # dismissible chips for what's applied
        results-toolbar.tsx      # count + sort + mobile filter button
        sort-dropdown.tsx
        results-grid.tsx         # grid, skeletons, empty state
        listing-card.tsx
        pagination.tsx
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

  hooks/
    use-listings.ts
  types/
    listing.ts
  lib/
    utils.ts
  assets/
```

## Code style

- Prettier config: no semicolons, double quotes, 2-space tabs, trailing commas (ES5), 80-col print width, with `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes) and `cn`/`cva` recognized as class-merging functions for sorting purposes. Some existing files (e.g. `listing-section.tsx`, `NavBar.tsx`, `types/listing.ts`) still have semicolons and aren't yet reformatted. Format the files you actually touched (`npx prettier --write <paths>`) rather than running `npm run format` across the repo — a blanket run reformats those stragglers too and buries your change in hundreds of lines of unrelated churn, which conflicts with whatever teammates have in flight. Reformatting them is worth its own dedicated commit.
- TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` all on) — fix unused vars/params rather than prefixing with `_`.
