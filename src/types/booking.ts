import type { GuestCounts } from "@/pages/home/hero"

/**
 * Mirrors the schema's `booking_status` enum. `pending` = awaiting payment;
 * `confirmed` = paid; `completed` = the stay is over.
 */
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"

/** Where the host is with a request — no payouts or invoices, just follow-up. */
export type BookingHostStatus = "new" | "contacted"

export type Booking = {
  id: string
  userId: string
  listingId: string
  stayName: string
  checkIn: string
  checkOut: string
  guests: GuestCounts
  nights: number
  total: number
  currency: string
  createdAt: string
  /** Snapshot of the guest's contact details, so the host can follow up. */
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  /** Missing means "new" (bookings made before hosts could track them). */
  hostStatus?: BookingHostStatus
  /**
   * Missing means "confirmed" — bookings made before statuses existed all
   * went through the (demo) checkout. Read it through `getBookingStatus`.
   */
  status?: BookingStatus
  cancelledAt?: string
  /** Who cancelled — lets the host see whether it was them or the guest. */
  cancelledBy?: "guest" | "host"
  cancellationReason?: string
}

/**
 * The status to display. A confirmed stay whose check-out has passed reads
 * as `completed` — the backend does this with a scheduled
 * `complete_past_bookings()`; the mock derives it instead.
 */
export function getBookingStatus(booking: Booking, now: number): BookingStatus {
  const status = booking.status ?? "confirmed"
  if (status === "confirmed" && new Date(booking.checkOut).getTime() < now) {
    return "completed"
  }
  return status
}

/** Pending or confirmed — the only states a booking can be cancelled from. */
export function isLiveBooking(status: BookingStatus) {
  return status === "pending" || status === "confirmed"
}
