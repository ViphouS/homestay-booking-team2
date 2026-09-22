import * as React from "react"

import type { Listing } from "@/types/listing"

/** Where the static catalogue lives until there is a real API. */
const LISTINGS_URL = "/data/listings.json"

export type UseListingsResult = {
  /** `null` while the request is in flight — render skeletons on `null`. */
  listings: Listing[] | null
  /** True once the fetch failed; `listings` is then an empty array. */
  hasError: boolean
}

/**
 * Module-level cache. Once the first fetch succeeds, every later call to
 * useListings() reuses this instead of hitting the network again — that's
 * what stops the "Loading..." flash when navigating between pages that all
 * read the same static catalogue.
 */
let cachedListings: Listing[] | null = null

/**
 * Loads the homestay catalogue from `public/data/listings.json`.
 *
 * There is no backend yet, so every data-driven surface reads the same static
 * JSON. Centralising the fetch here keeps that assumption in one place — when
 * an API arrives, only this hook changes.
 */
export function useListings(): UseListingsResult {
  const [listings, setListings] = React.useState<Listing[] | null>(cachedListings)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    if (cachedListings !== null) return // already have it, skip the fetch

    let cancelled = false

    fetch(LISTINGS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load listings: ${response.status}`)
        }
        return response.json() as Promise<Listing[]>
      })
      .then((data) => {
        if (cancelled) return
        cachedListings = data
        setListings(data)
      })
      .catch(() => {
        if (cancelled) return
        setListings([])
        setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { listings, hasError }
}