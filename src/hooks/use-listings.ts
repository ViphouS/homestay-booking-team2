import * as React from "react"

import { toListing } from "@/lib/mappers"
import { supabase } from "@/lib/supabase"
import type { Listing } from "@/types/listing"

export type UseListingsResult = {
  /** `null` while the first request is in flight — render skeletons on `null`. */
  listings: Listing[] | null
  /** True once the fetch failed; `listings` is then an empty array. */
  hasError: boolean
}

/**
 * Module-level cache. Every page reading the catalogue shows the last result
 * immediately (no "Loading..." flash when navigating between them) while a
 * fresh copy loads in the background, so newly approved stays still appear.
 */
let cachedListings: Listing[] | null = null

async function fetchApprovedListings(): Promise<Listing[]> {
  // RLS also lets hosts and admins read their unpublished listings, so the
  // public catalogue filters to `approved` explicitly.
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(toListing)
}

/**
 * The public homestay catalogue: every approved row of the `listings` table.
 *
 * Every data-driven surface (home, explore, stay details, bookings) reads it
 * through this hook rather than querying again.
 */
export function useListings(): UseListingsResult {
  const [listings, setListings] = React.useState<Listing[] | null>(
    cachedListings
  )
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    fetchApprovedListings()
      .then((data) => {
        cachedListings = data
        if (!cancelled) setListings(data)
      })
      .catch(() => {
        if (cancelled || cachedListings !== null) return
        setListings([])
        setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { listings, hasError }
}
