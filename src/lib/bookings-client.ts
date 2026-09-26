import { format } from "date-fns"

import { supabase } from "@/lib/supabase"
import type { GuestCounts } from "@/pages/home/hero"
import type { Booking } from "@/types/booking"
import type { Database } from "@/types/database"

/**
 * Bookings, backed by the `bookings` table.
 *
 * The browser can only read bookings (RLS: the guest, the listing's host, or
 * an admin). Creating and cancelling go through the `create_booking` and
 * `cancel_booking` RPCs, which price the stay and check permissions
 * server-side — the client never sends a total.
 */

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"]

/** The listing's name/photo and the guest's name, joined onto each booking. */
export const BOOKING_SELECT =
  "*, listing:listings(name, thumbnail_url), guest:profiles!bookings_guest_id_fkey(full_name)"

/** Only a host's own listings — `!inner` drops bookings on anyone else's. */
const HOST_BOOKING_SELECT =
  "*, listing:listings!inner(name, thumbnail_url, host_id), guest:profiles!bookings_guest_id_fkey(full_name)"

export type JoinedBookingRow = BookingRow & {
  listing: { name: string; thumbnail_url: string } | null
  guest: { full_name: string } | null
}

export function toBooking(row: JoinedBookingRow): Booking {
  return {
    id: row.id,
    guestId: row.guest_id,
    listingId: row.listing_id,
    // Archived listings drop out of the join for anyone but their host/admins.
    stayName: row.listing?.name ?? "Stay no longer listed",
    thumbnailUrl: row.listing?.thumbnail_url || undefined,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: {
      adults: row.adults,
      children: row.children,
      infants: row.infants,
    },
    nights: row.nights,
    nightlyPrice: Number(row.nightly_price),
    total: Number(row.total_amount),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelledById: row.cancelled_by ?? undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    guestName: row.guest?.full_name || undefined,
  }
}

/** A guest's own trips, newest first. */
export async function listMyBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("guest_id", userId)
    .order("created_at", { ascending: false })
    .overrideTypes<JoinedBookingRow[], { merge: false }>()
  if (error) throw new Error(error.message)
  return data.map(toBooking)
}

/**
 * Every booking on this host's listings, newest first, with each live
 * booking's contact details from `host_booking_contacts()` — the only way a
 * host can see a guest's email and phone.
 */
export async function listHostBookings(hostId: string): Promise<Booking[]> {
  const [bookingsResult, contactsResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(HOST_BOOKING_SELECT)
      .eq("listing.host_id", hostId)
      .order("created_at", { ascending: false })
      .overrideTypes<JoinedBookingRow[], { merge: false }>(),
    supabase.rpc("host_booking_contacts"),
  ])
  if (bookingsResult.error) throw new Error(bookingsResult.error.message)
  if (contactsResult.error) throw new Error(contactsResult.error.message)

  const contacts = new Map(
    contactsResult.data.map((contact) => [contact.booking_id, contact])
  )

  return bookingsResult.data.map((row) => {
    const contact = contacts.get(row.id)
    return {
      ...toBooking(row),
      guestEmail: contact?.email || undefined,
      guestPhone: contact?.phone || undefined,
    }
  })
}

export type CreateBookingInput = {
  listingId: string
  checkIn: Date
  checkOut: Date
  guests: GuestCounts
}

/**
 * Books a stay. The database checks availability and capacity, prices it,
 * and creates it as `pending` (awaiting payment).
 */
export async function createBooking({
  listingId,
  checkIn,
  checkOut,
  guests,
}: CreateBookingInput): Promise<void> {
  const { error } = await supabase.rpc("create_booking", {
    p_listing_id: listingId,
    p_check_in: format(checkIn, "yyyy-MM-dd"),
    p_check_out: format(checkOut, "yyyy-MM-dd"),
    p_adults: guests.adults,
    p_children: guests.children,
    p_infants: guests.infants,
  })
  if (error) throw new Error(error.message)
}

/**
 * Cancels a pending or confirmed booking. Allowed for the guest (before
 * check-in), the listing's host, or an admin; the reason is kept on the row.
 */
export async function cancelBooking(id: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: id,
    p_reason: reason,
  })
  if (error) throw new Error(error.message)
}
