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

export type AddBookingInput = Omit<Booking, "id" | "createdAt" | "hostStatus">

export async function addBooking(input: AddBookingInput): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    hostStatus: "new",
  }

  writeBookings([...readBookings(), booking])

  return booking
}
