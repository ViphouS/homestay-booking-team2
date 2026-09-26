import * as React from "react"
import { cn } from "cn"
import { CircleAlert, Mail, Phone } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { ReasonDialog } from "@/components/reason-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cancelBooking, listHostBookings } from "@/lib/bookings-client"
import { cancelBookingCopy } from "@/lib/cancel-booking-copy"
import { formatDay } from "@/lib/format-date"
import { formatGuests } from "@/pages/home/hero"
import { getBookingStatus, isLiveBooking } from "@/types/booking"
import type { Booking, BookingStatus } from "@/types/booking"

const CONTACT_LINK_CLASS = cn(
  buttonVariants({ variant: "link", size: "sm" }),
  "h-auto p-0"
)

/** A booking plus its display status, worked out once when the data loads. */
type Request = { booking: Booking; status: BookingStatus }

function ContactLinks({ booking }: { booking: Booking }) {
  if (!booking.guestEmail && !booking.guestPhone) {
    return (
      <span className="text-muted-foreground italic">No contact details</span>
    )
  }

  return (
    <>
      {booking.guestEmail ? (
        <a href={`mailto:${booking.guestEmail}`} className={CONTACT_LINK_CLASS}>
          <Mail data-icon="inline-start" />
          {booking.guestEmail}
        </a>
      ) : null}
      {booking.guestPhone ? (
        <a href={`tel:${booking.guestPhone}`} className={CONTACT_LINK_CLASS}>
          <Phone data-icon="inline-start" />
          {booking.guestPhone}
        </a>
      ) : null}
    </>
  )
}

function cancelledByLabel(booking: Booking, hostId: string) {
  if (booking.cancelledById === hostId) return "you"
  if (booking.cancelledById === booking.guestId) return "the guest"
  return "JumRok"
}

function RequestCard({
  request: { booking, status },
  hostId,
  onCancel,
}: {
  request: Request
  hostId: string
  onCancel: () => void
}) {
  const isLive = isLiveBooking(status)

  return (
    <Card size="sm" className={isLive ? undefined : "opacity-75"}>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base text-primary">
              {booking.guestName ?? "Guest"}
            </span>
            <BookingStatusBadge status={status} />
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {booking.stayName} · {formatDay(booking.checkIn)} →{" "}
            {formatDay(booking.checkOut)} · {formatGuests(booking.guests)}
          </div>

          {/* The backend's `host_booking_contacts()` only hands over contact
              details while the booking is live. */}
          {isLive ? (
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <ContactLinks booking={booking} />
            </div>
          ) : null}

          {status === "cancelled" ? (
            <Alert variant="destructive" className="mt-3">
              <CircleAlert />
              <AlertDescription>
                Cancelled by {cancelledByLabel(booking, hostId)}
                {booking.cancelledAt
                  ? ` on ${formatDay(booking.cancelledAt)}`
                  : ""}
                {booking.cancellationReason
                  ? ` — “${booking.cancellationReason}”`
                  : "."}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-2 text-xs text-muted-foreground">
            Requested {formatDay(booking.createdAt)}
          </div>
        </div>

        {isLive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit shrink-0 text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            Cancel booking
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function RequestSection({
  title,
  requests,
  hostId,
  onCancel,
}: {
  title: string
  requests: Request[]
  hostId: string
  onCancel: (booking: Booking) => void
}) {
  if (requests.length === 0) return null

  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      {requests.map((request) => (
        <RequestCard
          key={request.booking.id}
          request={request}
          hostId={hostId}
          onCancel={() => onCancel(request.booking)}
        />
      ))}
    </div>
  )
}

/**
 * "Booking Requests" tab content — hosts only.
 *
 * Every booking a guest makes on one of this host's listings, shown as a
 * request to follow up on: who, which stay, when, its status, and — while
 * it's live — how to reach the guest. No payouts or invoices here; the host
 * contacts the guest directly, and can cancel with a reason.
 */
export function BookingRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = React.useState<Request[] | null>(null)
  const [hasError, setHasError] = React.useState(false)
  const [cancelling, setCancelling] = React.useState<Booking | null>(null)

  const load = React.useCallback((hostId: string) => {
    return listHostBookings(hostId)
      .then((result) => {
        // Resolve statuses where the data arrives, not during render —
        // reading the clock is a side effect (same as `MyBookings`).
        const now = Date.now()
        setRequests(
          result.map((booking) => ({
            booking,
            status: getBookingStatus(booking, now),
          }))
        )
      })
      .catch(() => setHasError(true))
  }, [])

  React.useEffect(() => {
    if (user) load(user.id)
  }, [user, load])

  if (!user) return null

  if (hasError) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load your booking requests. Please refresh to try again.
      </p>
    )
  }

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

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelling) return
    await cancelBooking(cancelling.id, reason)
    setCancelling(null)
    await load(user.id)
  }

  const live = requests.filter((request) => isLiveBooking(request.status))
  const past = requests.filter((request) => !isLiveBooking(request.status))

  return (
    <div className="flex flex-col gap-9">
      <RequestSection
        title={`Upcoming (${live.length})`}
        requests={live}
        hostId={user.id}
        onCancel={setCancelling}
      />
      <RequestSection
        title="Past & cancelled"
        requests={past}
        hostId={user.id}
        onCancel={setCancelling}
      />

      <ReasonDialog
        copy={
          cancelling
            ? cancelBookingCopy(
                `${cancelling.guestName ?? "The guest"}'s stay at ${cancelling.stayName}, ${formatDay(cancelling.checkIn)} → ${formatDay(cancelling.checkOut)}.`,
                "guest"
              )
            : null
        }
        onOpenChange={(open) => {
          if (!open) setCancelling(null)
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}

export default BookingRequests
