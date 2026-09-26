import type { GuestCounts } from "@/pages/home/hero"

/**
 * Mirrors the schema's `booking_status` enum. `pending` = awaiting payment
 * (every booking until a payment server exists); `confirmed` = paid;
 * `completed` = the stay is over.
 */
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"

/** A `bookings` row plus the listing and guest details shown alongside it. */
export type Booking = {
  id: string
  guestId: string | null
  listingId: string
  /** The listing's name, or a fallback once the listing is no longer visible. */
  stayName: string
  thumbnailUrl?: string
  /** ISO date (yyyy-MM-dd). */
  checkIn: string
  /** ISO date (yyyy-MM-dd). */
  checkOut: string
  guests: GuestCounts
  nights: number
  nightlyPrice: number
  /** Worked out by the database: nightly price × nights. */
  total: number
  currency: string
  status: BookingStatus
  createdAt: string
  cancelledAt?: string
  /** User id of whoever cancelled — the guest, the host or an admin. */
  cancelledById?: string
  cancellationReason?: string
  guestName?: string
  /** Only filled in for the listing's host, and only while the booking is live. */
  guestEmail?: string
  guestPhone?: string
}

/**
 * The status to display. A confirmed stay whose check-out has passed reads
 * as `completed` even before the backend's `complete_past_bookings()` runs.
 */
export function getBookingStatus(booking: Booking, now: number): BookingStatus {
  if (
    booking.status === "confirmed" &&
    new Date(booking.checkOut).getTime() < now
  ) {
    return "completed"
  }
  return booking.status
}

/** Pending or confirmed — the only states a booking can be cancelled from. */
export function isLiveBooking(status: BookingStatus) {
  return status === "pending" || status === "confirmed"
}
