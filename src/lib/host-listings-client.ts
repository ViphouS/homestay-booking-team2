import { toHostListing } from "@/lib/mappers"
import { supabase } from "@/lib/supabase"
import type { HostListing } from "@/types/host-listing"
import type { ListingCategory } from "@/types/listing"

/**
 * A host's own listings, backed by the `listings` table.
 *
 * Hosts may write content columns only (see the column grants in
 * `schema.sql`); status changes go through `submit_listing`. New listings
 * are inserted as `draft` and submitted straight away, so they land in the
 * admin's review queue as `pending`.
 */

export type HostListingInput = {
  name: string
  tagline: string
  description: string
  category: ListingCategory
  region: string
  area: string
  pricePerNight: number
  currency: string
  maxGuests: number
  beds: number
  roomType: string
  thumbnailUrl?: string
}

function toColumns(input: HostListingInput) {
  return {
    name: input.name,
    tagline: input.tagline,
    description: input.description,
    category: input.category,
    region: input.region,
    area: input.area,
    price_amount: input.pricePerNight,
    price_currency: input.currency,
    max_guests: input.maxGuests,
    beds: input.beds,
    room_type: input.roomType,
    thumbnail_url: input.thumbnailUrl ?? "",
    images: input.thumbnailUrl ? [input.thumbnailUrl] : [],
  }
}

async function submitForReview(id: string): Promise<HostListing> {
  const { data, error } = await supabase.rpc("submit_listing", {
    p_listing_id: id,
  })
  if (error) throw new Error(error.message)
  return toHostListing(data)
}

export async function listHostListings(hostId: string): Promise<HostListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(toHostListing)
}

/** Creates the listing (owned by the signed-in host) and sends it for review. */
export async function addHostListing(
  input: HostListingInput
): Promise<HostListing> {
  const { data, error } = await supabase
    .from("listings")
    .insert(toColumns(input))
    .select("id")
    .single()
  if (error) throw new Error(error.message)
  return submitForReview(data.id)
}

/**
 * Saves a host's edits. A live listing goes back to `pending` on its own (a
 * database trigger); a draft, rejected or archived one is resubmitted here.
 */
export async function updateHostListing(
  id: string,
  input: HostListingInput
): Promise<HostListing> {
  const { data, error } = await supabase
    .from("listings")
    .update(toColumns(input))
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw new Error(error.message)

  if (["draft", "rejected", "archived"].includes(data.status)) {
    return submitForReview(id)
  }
  return toHostListing(data)
}
