import type { SearchValues } from "@/pages/home/hero"
import type { ListingCategory } from "@/types/listing"

/**
 * Explore-page types.
 *
 * Deliberately UI-agnostic: the sidebar, the chips row and the URL codec all
 * speak this shape, so none of them need to know about each other.
 */

export type SortOption =
  "recommended" | "price-asc" | "price-desc" | "rating-desc"

/**
 * Everything the sidebar can narrow by.
 *
 * Multi-select facets are arrays (empty = "no constraint"); ranges are
 * `undefined` when open-ended.
 */
export type ExploreFilters = {
  regions: string[]
  categories: ListingCategory[]
  facilities: string[]
  experiences: string[]
  minPrice: number | undefined
  maxPrice: number | undefined
  /** Keep listings rated at or above this score. */
  minRating: number | undefined
}

/** The complete, URL-serialisable state of the Explore page. */
export type ExploreState = {
  /** Carried over from the hero search bar. */
  search: SearchValues
  filters: ExploreFilters
  sort: SortOption
  /** 1-based. */
  page: number
}

/** The distinct values present in the catalogue, for building filter chips. */
export type ExploreFacets = {
  regions: string[]
  categories: ListingCategory[]
  facilities: string[]
  experiences: string[]
}
