import type { Booking } from "@/types/booking"

/**
 * Mock bookings "backend" — same swappable-mock pattern as `auth-client.ts`.
 * `BookingModal` writes here on a successful (demo) checkout; the Profile
 * page's "My Bookings" tab reads from here.
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

export type AddBookingInput = Omit<Booking, "id" | "createdAt">

export async function addBooking(input: AddBookingInput): Promise<Booking> {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  writeBookings([...readBookings(), booking])

  return booking
}
