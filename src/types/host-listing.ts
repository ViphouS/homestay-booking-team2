import type { ListingCategory } from "@/types/listing"

/**
 * Mirrors the schema's `moderation_status` enum. Listings are created as
 * `draft` and submitted straight to `pending`; an admin approves (live) or
 * rejects them, and hosts or admins can archive them.
 */
export type HostListingStatus =
  "draft" | "pending" | "approved" | "rejected" | "archived"

/**
 * A listing as its host (or an admin) sees it — every status, plus the
 * moderation trail the public catalogue's `Listing` type leaves out.
 */
export type HostListing = {
  id: string
  hostId: string | null
  hostName: string
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
  /** When it last went into review. */
  submittedAt?: string
  /** When an admin last approved or rejected it. */
  reviewedAt?: string
  /** An admin's reason for rejecting — required by the backend to reject. */
  rejectionReason?: string
}
