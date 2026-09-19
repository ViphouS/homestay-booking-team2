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
 * Loads the homestay catalogue from `public/data/listings.json`.
 *
 * There is no backend yet, so every data-driven surface reads the same static
 * JSON. Centralising the fetch here keeps that assumption in one place — when
 * an API arrives, only this hook changes.
 */
export function useListings(): UseListingsResult {
  const [listings, setListings] = React.useState<Listing[] | null>(null)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
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
