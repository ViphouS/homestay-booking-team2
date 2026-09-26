import type { GuestCounts } from "@/pages/home/hero"

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
}
