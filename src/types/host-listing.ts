import type { ListingCategory } from "@/types/listing"

/** New listings start `pending` until an admin reviews them (backend, later). */
export type HostListingStatus = "pending" | "approved" | "rejected"

/**
 * A listing a host has submitted — a flat subset of `Listing` so an approved
 * submission can be mapped onto the public catalogue shape later.
 */
export type HostListing = {
  id: string
  hostId: string
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
  status: HostListingStatus
  createdAt: string
}
