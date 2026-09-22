/**
 * Explore (search results) — public surface.
 *
 * Drop-in usage:
 *   <Route path="/explore" element={<Explore />} />
 *
 * The page reads its entire state from the URL, so linking to it is just a
 * matter of building the query string:
 *   navigate(`/explore?${toExploreSearchString(values)}`)
 */

export { Explore } from "./explore"

export {
  ActiveFilters,
  type ActiveFiltersProps,
} from "./sections/active-filters"
export {
  ExploreHeader,
  type ExploreHeaderProps,
} from "./sections/explore-header"
export {
  FilterChipGroup,
  type FilterChipGroupProps,
} from "./sections/filter-chip-group"
export {
  FilterPanelTrigger,
  type FilterPanelTriggerProps,
} from "./sections/filter-panel-trigger"
export {
  FilterSidebar,
  type FilterSidebarProps,
} from "./sections/filter-sidebar"
export { ListingCard, type ListingCardProps } from "./sections/listing-card"
export {
  PriceRangeField,
  type PriceRangeFieldProps,
} from "./sections/price-range-field"
export { ResultsGrid, type ResultsGridProps } from "./sections/results-grid"
export {
  ResultsToolbar,
  type ResultsToolbarProps,
} from "./sections/results-toolbar"
export {
  SearchSummaryBar,
  type SearchSummaryBarProps,
} from "./sections/search-summary-bar"
export { SortDropdown, type SortDropdownProps } from "./sections/sort-dropdown"

export {
  useExploreState,
  type UseExploreStateResult,
} from "./use-explore-state"

export type {
  ExploreFacets,
  ExploreFilters,
  ExploreState,
  SortOption,
} from "./types"
export {
  collectFacets,
  countActiveFilters,
  EMPTY_FILTERS,
  filterListings,
  formatDateRange,
  PAGE_SIZE,
  parseExploreParams,
  SORT_OPTIONS,
  sortListings,
  toExploreParams,
  toExploreSearchString,
} from "./utils"
