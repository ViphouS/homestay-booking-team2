import * as React from "react"
import { useSearchParams } from "react-router-dom"

import type { SearchValues } from "@/pages/home/hero"

import type { ExploreFilters, ExploreState, SortOption } from "./types"
import {
  countActiveFilters,
  EMPTY_FILTERS,
  parseExploreParams,
  toExploreParams,
} from "./utils"

export type UseExploreStateResult = ExploreState & {
  /** Commit an edited search bar. */
  setSearch: (search: SearchValues) => void
  setFilters: (filters: ExploreFilters) => void
  setSort: (sort: SortOption) => void
  setPage: (page: number) => void
  clearFilters: () => void
  /** How many sidebar constraints are currently applied. */
  activeFilterCount: number
}

/**
 * Owns the Explore page's state, stored entirely in the URL.
 *
 * Putting it in the query string rather than React state is what makes a set
 * of results shareable, refresh-proof and navigable with the back button —
 * and it is how the hero's search parameters arrive here in the first place.
 *
 * Every mutation except `setPage` returns to page 1, since the result set it
 * was paginating no longer exists.
 */
export function useExploreState(): UseExploreStateResult {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = React.useMemo(
    () => parseExploreParams(searchParams),
    [searchParams]
  )

  // `state` is memoised on the params, so this stays referentially stable.
  const commit = React.useCallback(
    (next: ExploreState) => {
      // `replace` keeps filter tweaking out of the back-button history; only
      // arriving at /explore from the hero should be its own history entry.
      setSearchParams(toExploreParams(next), { replace: true })
    },
    [setSearchParams]
  )

  const setSearch = React.useCallback(
    (search: SearchValues) => commit({ ...state, search, page: 1 }),
    [commit, state]
  )

  const setFilters = React.useCallback(
    (filters: ExploreFilters) => commit({ ...state, filters, page: 1 }),
    [commit, state]
  )

  const setSort = React.useCallback(
    (sort: SortOption) => commit({ ...state, sort, page: 1 }),
    [commit, state]
  )

  const setPage = React.useCallback(
    (page: number) => commit({ ...state, page }),
    [commit, state]
  )

  const clearFilters = React.useCallback(
    () => commit({ ...state, filters: EMPTY_FILTERS, page: 1 }),
    [commit, state]
  )

  return {
    ...state,
    setSearch,
    setFilters,
    setSort,
    setPage,
    clearFilters,
    activeFilterCount: countActiveFilters(state.filters),
  }
}
