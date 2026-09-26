import * as React from "react"
import { format } from "date-fns"
import { Mail, Phone } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  listBookingsForListings,
  updateBookingHostStatus,
} from "@/lib/bookings-client"
import { listHostListings } from "@/lib/host-listings-client"
import { formatGuests } from "@/pages/home/hero"
import type { Booking, BookingHostStatus } from "@/types/booking"

const REQUEST_DATE_FORMAT = "dd MMM yyyy"

function RequestCard({
  booking,
  onStatusChange,
}: {
  booking: Booking
  onStatusChange: (status: BookingHostStatus) => void
}) {
  const isContacted = booking.hostStatus === "contacted"

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-base text-primary">
            {booking.guestName ?? "Guest"}
          </span>
          {isContacted ? (
            <Badge variant="secondary">Contacted</Badge>
          ) : (
            <Badge className="bg-[#F4EDE8] text-[#8C5A44]">New</Badge>
          )}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {booking.stayName} ·{" "}
          {format(new Date(booking.checkIn), REQUEST_DATE_FORMAT)} →{" "}
          {format(new Date(booking.checkOut), REQUEST_DATE_FORMAT)} ·{" "}
          {formatGuests(booking.guests)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {booking.guestEmail ? (
            <a
              href={`mailto:${booking.guestEmail}`}
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <Mail size={14} />
              {booking.guestEmail}
            </a>
          ) : null}
          {booking.guestPhone ? (
            <a
              href={`tel:${booking.guestPhone}`}
              className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
            >
              <Phone size={14} />
              {booking.guestPhone}
            </a>
          ) : null}
          {!booking.guestEmail && !booking.guestPhone ? (
            <span className="text-muted-foreground italic">
              No contact details
            </span>
          ) : null}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Requested {format(new Date(booking.createdAt), REQUEST_DATE_FORMAT)}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit shrink-0"
        onClick={() => onStatusChange(isContacted ? "new" : "contacted")}
      >
        {isContacted ? "Mark as new" : "Mark as contacted"}
      </Button>
    </div>
  )
}

/**
 * "Booking Requests" tab content — hosts only.
 *
 * Every booking a guest makes on one of this host's listings, shown as a
 * request to follow up on: who, which stay, when, and how to reach them.
 * Guests still go through the normal checkout; on the host side there are
 * no payouts or invoices, just a "contacted" flag so nothing gets missed.
 *
 * Host listings aren't bookable until the approval backend exists, so for
 * now this is usually empty.
 */
export function BookingRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = React.useState<Booking[] | null>(null)

  React.useEffect(() => {
    if (!user) return
    let cancelled = false

    listHostListings(user.id)
      .then((listings) =>
        listBookingsForListings(listings.map((listing) => listing.id))
      )
      .then((result) => {
        if (!cancelled) setRequests(result)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (requests === null) {
    return (
      <p className="text-sm text-muted-foreground">Loading booking requests…</p>
    )
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No booking requests yet. When a guest books one of your live listings,
        their request and contact details will appear here.
      </p>
    )
  }

  const handleStatusChange = async (id: string, status: BookingHostStatus) => {
    await updateBookingHostStatus(id, status)
    setRequests((current) =>
      (current ?? []).map((booking) =>
        booking.id === id ? { ...booking, hostStatus: status } : booking
      )
    )
  }

  const newCount = requests.filter(
    (booking) => booking.hostStatus !== "contacted"
  ).length

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-primary">
        {requests.length} request{requests.length === 1 ? "" : "s"}
        {newCount > 0 ? (
          <span className="font-normal text-muted-foreground">
            {" "}
            · {newCount} to follow up
          </span>
        ) : null}
      </h3>
      <div className="flex flex-col gap-3.5">
        {requests.map((booking) => (
          <RequestCard
            key={booking.id}
            booking={booking}
            onStatusChange={(status) => handleStatusChange(booking.id, status)}
          />
        ))}
      </div>
    </div>
  )
}

export default BookingRequests
