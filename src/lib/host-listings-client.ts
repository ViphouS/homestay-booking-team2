import type { HostListing } from "@/types/host-listing"

/**
 * Mock host-listings "backend" — same swappable-mock pattern as
 * `bookings-client.ts`. The Profile page's "My Listings" tab reads and writes
 * here. Every submission lands as `pending`; approval happens server-side
 * once a real backend exists.
 */

const HOST_LISTINGS_KEY = "jumrok-mock-host-listings"
const MOCK_DELAY_MS = 600

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

function readHostListings(): HostListing[] {
  try {
    const raw = localStorage.getItem(HOST_LISTINGS_KEY)
    return raw ? (JSON.parse(raw) as HostListing[]) : []
  } catch {
    return []
  }
}

function writeHostListings(listings: HostListing[]) {
  localStorage.setItem(HOST_LISTINGS_KEY, JSON.stringify(listings))
}

export async function listHostListings(hostId: string): Promise<HostListing[]> {
  return readHostListings()
    .filter((listing) => listing.hostId === hostId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export type AddHostListingInput = Omit<
  HostListing,
  "id" | "status" | "createdAt"
>

export async function addHostListing(
  input: AddHostListingInput
): Promise<HostListing> {
  await delay()

  const listing: HostListing = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  writeHostListings([...readHostListings(), listing])

  return listing
}

export type UpdateHostListingInput = Omit<AddHostListingInput, "hostId">

/**
 * Saves a host's edits. Any change sends the listing back to `pending` so it
 * is re-reviewed before the new details go live.
 */
export async function updateHostListing(
  id: string,
  updates: UpdateHostListingInput
): Promise<HostListing> {
  await delay()

  const listings = readHostListings()
  const index = listings.findIndex((listing) => listing.id === id)
  if (index === -1) {
    throw new Error("Listing not found.")
  }

  const updated: HostListing = {
    ...listings[index],
    ...updates,
    status: "pending",
  }
  const next = [...listings]
  next[index] = updated
  writeHostListings(next)

  return updated
}
