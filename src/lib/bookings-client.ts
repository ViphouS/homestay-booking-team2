import type { Booking, BookingHostStatus } from "@/types/booking"

/**
 * Mock bookings "backend" — same swappable-mock pattern as `auth-client.ts`.
 * `BookingModal` writes here on a successful (demo) checkout; the Profile
 * page's "My Bookings" tab reads a guest's own trips, and a host's "Booking
 * Requests" tab reads the bookings made on their listings.
 */

const BOOKINGS_KEY = "jumrok-mock-bookings"

function readBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    return raw ? (JSON.parse(raw) as Booking[]) : []
  } catch {
    return []
  }
}

function writeBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export async function listBookings(userId: string): Promise<Booking[]> {
  return readBookings()
    .filter((booking) => booking.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Every booking made on any of the given listings, newest first. */
export async function listBookingsForListings(
  listingIds: string[]
): Promise<Booking[]> {
  const ids = new Set(listingIds)
  return readBookings()
    .filter((booking) => ids.has(booking.listingId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateBookingHostStatus(
  id: string,
  hostStatus: BookingHostStatus
): Promise<void> {
  writeBookings(
    readBookings().map((booking) =>
      booking.id === id ? { ...booking, hostStatus } : booking
    )
  )
}

/**
 * Mirrors the schema's `cancel_booking` RPC: only a pending or confirmed
 * booking can be cancelled, and the reason is kept for the other party.
 */
export async function cancelBooking(
  id: string,
  cancelledBy: "guest" | "host",
  reason: string
): Promise<Booking> {
  const bookings = readBookings()
  const index = bookings.findIndex((booking) => booking.id === id)
  const current = bookings[index]
  const status = current?.status ?? "confirmed"

  if (!current || (status !== "pending" && status !== "confirmed")) {
    throw new Error("Booking not found or can no longer be cancelled.")
  }

  const cancelled: Booking = {
    ...current,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancelledBy,
    cancellationReason: reason,
  }
  const next = [...bookings]
  next[index] = cancelled
  writeBookings(next)

  return cancelled
}

export type AddBookingInput = Omit<
  Booking,
  | "id"
  | "createdAt"
  | "hostStatus"
  | "status"
  | "cancelledAt"
  | "cancelledBy"
  | "cancellationReason"
>

export async function addBooking(input: AddBookingInput): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    hostStatus: "new",
    // The demo checkout always "pays", so it skips straight past `pending`.
    status: "confirmed",
  }

  writeBookings([...readBookings(), booking])

  return booking
}
