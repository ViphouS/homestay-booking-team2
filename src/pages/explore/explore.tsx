import * as React from "react"

import { useListings } from "@/hooks/use-listings"

import { ActiveFilters } from "./sections/active-filters"
import { ExploreHeader } from "./sections/explore-header"
import { FilterPanelTrigger } from "./sections/filter-panel-trigger"
import { FilterSidebar } from "./sections/filter-sidebar"
import { Pagination } from "./sections/pagination"
import { ResultsGrid } from "./sections/results-grid"
import { ResultsToolbar } from "./sections/results-toolbar"
import { SearchSummaryBar } from "./sections/search-summary-bar"
import { useExploreState } from "./use-explore-state"
import { collectFacets, filterListings, PAGE_SIZE, sortListings } from "./utils"

/**
 * Search results for the hero's homestay search.
 *
 * Composition only — every piece of behaviour lives in a section under
 * `./sections`, the query/sort/paginate rules in `./utils`, and the state in
 * `./use-explore-state` (which keeps it all in the URL, so a result set is
 * shareable and survives a refresh).
 */
export function Explore() {
  const {
    search,
    filters,
    sort,
    page,
    setSearch,
    setFilters,
    setSort,
    setPage,
    clearFilters,
    activeFilterCount,
  } = useExploreState()

  const { listings, hasError } = useListings()

  const facets = React.useMemo(() => collectFacets(listings ?? []), [listings])

  const priceBounds = React.useMemo(() => {
    if (!listings || listings.length === 0) return undefined
    const amounts = listings.map((listing) => listing.price.amount)
    return { min: Math.min(...amounts), max: Math.max(...amounts) }
  }, [listings])

  const matches = React.useMemo(() => {
    if (listings === null) return null
    return sortListings(filterListings(listings, search, filters), sort)
  }, [listings, search, filters, sort])

  const pageCount = matches
    ? Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
    : 1
  // Filters can shrink the result set out from under the current page.
  const currentPage = Math.min(page, pageCount)
  const offset = (currentPage - 1) * PAGE_SIZE

  const visibleListings = matches
    ? matches.slice(offset, offset + PAGE_SIZE)
    : null

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const sidebarProps = {
    filters,
    onFiltersChange: setFilters,
    facets,
    priceBounds,
    activeFilterCount,
    onClear: clearFilters,
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-4">
        <SearchSummaryBar value={search} onSubmit={setSearch} />
        <ActiveFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={clearFilters}
        />
      </div>

      <ExploreHeader search={search} />

      {hasError ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn’t load the homestay catalogue just now. Please refresh to
          try again.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr] lg:items-start">
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
          <FilterSidebar {...sidebarProps} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <ResultsToolbar
            total={matches?.length ?? null}
            rangeStart={offset + 1}
            rangeEnd={offset + (visibleListings?.length ?? 0)}
            sort={sort}
            onSortChange={setSort}
            filterTrigger={<FilterPanelTrigger {...sidebarProps} />}
          />

          <ResultsGrid
            listings={visibleListings}
            skeletonCount={PAGE_SIZE}
            onClearFilters={activeFilterCount > 0 ? clearFilters : undefined}
          />

          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}

export default Explore
