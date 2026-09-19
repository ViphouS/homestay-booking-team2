import { format, isValid, parseISO } from "date-fns"

import { DEFAULT_SEARCH_VALUES, type SearchValues } from "@/pages/home/hero"
import { isListingCategory, type Listing } from "@/types/listing"

import type {
  ExploreFacets,
  ExploreFilters,
  ExploreState,
  SortOption,
} from "./types"

/** Results per page. */
export const PAGE_SIZE = 6

export const EMPTY_FILTERS: ExploreFilters = {
  regions: [],
  categories: [],
  facilities: [],
  experiences: [],
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
}

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating-desc", label: "Top rated" },
]

/** Rating floors offered in the sidebar. */
export const RATING_OPTIONS = [4, 4.5, 4.8]

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value)

const isSortOption = (value: string): value is SortOption =>
  (SORT_VALUES as string[]).includes(value)

/* -------------------------------------------------------------------------
 * URL codec
 *
 * The URL is the single source of truth for the Explore page, so a search is
 * shareable and survives a refresh or a back-button press. These two
 * functions are exact inverses — change one, change the other.
 * ---------------------------------------------------------------------- */

/** `Date` → `2026-11-14`, the form we put in the query string. */
const DATE_PARAM_FORMAT = "yyyy-MM-dd"

function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

/** Reads a non-negative integer, falling back when absent or malformed. */
function parseCount(value: string | null, fallback: number) {
  if (value === null) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function parseAmount(value: string | null) {
  if (value === null) return undefined
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

/** Decodes the query string into the page's state. */
export function parseExploreParams(params: URLSearchParams): ExploreState {
  const sort = params.get("sort")
  const checkIn = parseDateParam(params.get("checkIn"))
  const checkOut = parseDateParam(params.get("checkOut"))

  return {
    search: {
      location: params.get("location") ?? "",
      checkIn,
      // A stale departure that lands before the arrival is not a real range.
      checkOut:
        checkOut && checkIn && checkOut <= checkIn ? undefined : checkOut,
      guests: {
        adults: parseCount(
          params.get("adults"),
          DEFAULT_SEARCH_VALUES.guests.adults
        ),
        children: parseCount(params.get("children"), 0),
        infants: parseCount(params.get("infants"), 0),
      },
    },
    filters: {
      regions: params.getAll("region"),
      categories: params.getAll("category").filter(isListingCategory),
      facilities: params.getAll("facility"),
      experiences: params.getAll("experience"),
      minPrice: parseAmount(params.get("minPrice")),
      maxPrice: parseAmount(params.get("maxPrice")),
      minRating: parseAmount(params.get("minRating")),
    },
    sort: sort && isSortOption(sort) ? sort : "recommended",
    page: Math.max(1, parseCount(params.get("page"), 1)),
  }
}

/**
 * Encodes state back into a query string, omitting anything at its default so
 * the URL stays readable.
 */
export function toExploreParams(state: ExploreState): URLSearchParams {
  const params = new URLSearchParams()
  const { search, filters, sort, page } = state

  if (search.location.trim()) params.set("location", search.location.trim())
  if (search.checkIn)
    params.set("checkIn", format(search.checkIn, DATE_PARAM_FORMAT))
  if (search.checkOut) {
    params.set("checkOut", format(search.checkOut, DATE_PARAM_FORMAT))
  }
  if (search.guests.adults !== DEFAULT_SEARCH_VALUES.guests.adults) {
    params.set("adults", String(search.guests.adults))
  }
  if (search.guests.children > 0) {
    params.set("children", String(search.guests.children))
  }
  if (search.guests.infants > 0) {
    params.set("infants", String(search.guests.infants))
  }

  filters.regions.forEach((region) => params.append("region", region))
  filters.categories.forEach((category) => params.append("category", category))
  filters.facilities.forEach((facility) => params.append("facility", facility))
  filters.experiences.forEach((experience) =>
    params.append("experience", experience)
  )
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice))
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice))
  }
  if (filters.minRating !== undefined) {
    params.set("minRating", String(filters.minRating))
  }

  if (sort !== "recommended") params.set("sort", sort)
  if (page > 1) params.set("page", String(page))

  return params
}

/** Builds the `/explore` query string for a hero search. */
export function toExploreSearchString(search: SearchValues): string {
  return toExploreParams({
    search,
    filters: EMPTY_FILTERS,
    sort: "recommended",
    page: 1,
  }).toString()
}

/* -------------------------------------------------------------------------
 * Querying
 * ---------------------------------------------------------------------- */

/**
 * Guests who occupy a bed. Infants are excluded, matching how the industry
 * counts them and how `capacity.maxGuests` is authored in the catalogue.
 */
export function countSleepingGuests(search: SearchValues) {
  return search.guests.adults + search.guests.children
}

/** Case-insensitive match of the destination box against name / region / area. */
function matchesLocation(listing: Listing, location: string) {
  const query = location.trim().toLowerCase()
  if (!query) return true

  return [
    listing.name,
    listing.location.region,
    listing.location.area,
    listing.category,
  ].some((field) => field.toLowerCase().includes(query))
}

const containsAll = (haystack: string[], needles: string[]) =>
  needles.every((needle) => haystack.includes(needle))

/**
 * Applies the destination, guest count and every sidebar facet.
 *
 * Dates are deliberately *not* applied: the static catalogue carries no
 * availability calendar, so filtering by them would silently drop stays that
 * are in fact bookable. They travel through to the UI and on to the booking
 * flow instead.
 */
export function filterListings(
  listings: Listing[],
  search: SearchValues,
  filters: ExploreFilters
): Listing[] {
  const sleepingGuests = countSleepingGuests(search)

  return listings.filter((listing) => {
    if (!matchesLocation(listing, search.location)) return false
    if (listing.capacity.maxGuests < sleepingGuests) return false

    if (
      filters.regions.length > 0 &&
      !filters.regions.includes(listing.location.region)
    ) {
      return false
    }
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(listing.category)
    ) {
      return false
    }
    if (!containsAll(listing.facilities, filters.facilities)) return false
    if (!containsAll(listing.experiences, filters.experiences)) return false

    if (
      filters.minPrice !== undefined &&
      listing.price.amount < filters.minPrice
    ) {
      return false
    }
    if (
      filters.maxPrice !== undefined &&
      listing.price.amount > filters.maxPrice
    ) {
      return false
    }
    if (
      filters.minRating !== undefined &&
      listing.rating.score < filters.minRating
    ) {
      return false
    }

    return true
  })
}

/** Returns a new array; never mutates the input. */
export function sortListings(listings: Listing[], sort: SortOption): Listing[] {
  const sorted = [...listings]

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price.amount - b.price.amount)
    case "price-desc":
      return sorted.sort((a, b) => b.price.amount - a.price.amount)
    case "rating-desc":
      return sorted.sort(
        (a, b) =>
          b.rating.score - a.rating.score ||
          b.rating.reviewCount - a.rating.reviewCount
      )
    case "recommended":
      // Catalogue order is the editorial order.
      return sorted
  }
}

/** The distinct facet values actually present in the catalogue. */
export function collectFacets(listings: Listing[]): ExploreFacets {
  const unique = <T>(values: T[]) => Array.from(new Set(values))

  return {
    regions: unique(listings.map((l) => l.location.region)).sort(),
    categories: unique(listings.map((l) => l.category)),
    facilities: unique(listings.flatMap((l) => l.facilities)).sort(),
    experiences: unique(listings.flatMap((l) => l.experiences)).sort(),
  }
}

/* -------------------------------------------------------------------------
 * Formatting
 * ---------------------------------------------------------------------- */

/** "Nov 14 — Nov 19", or a nudge when the range is incomplete. */
export function formatDateRange(
  checkIn: Date | undefined,
  checkOut: Date | undefined,
  placeholder = "Any dates"
) {
  if (!checkIn && !checkOut) return placeholder
  if (checkIn && !checkOut) return `${format(checkIn, "d MMM")} — Add date`
  if (!checkIn && checkOut) return `Add date — ${format(checkOut!, "d MMM")}`

  return `${format(checkIn!, "d MMM")} — ${format(checkOut!, "d MMM")}`
}

/** How many individual constraints the sidebar is currently applying. */
export function countActiveFilters(filters: ExploreFilters) {
  return (
    filters.regions.length +
    filters.categories.length +
    filters.facilities.length +
    filters.experiences.length +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0)
  )
}

/** "6 stays" / "1 stay". */
export function formatResultCount(count: number) {
  return `${count} ${count === 1 ? "stay" : "stays"}`
}
