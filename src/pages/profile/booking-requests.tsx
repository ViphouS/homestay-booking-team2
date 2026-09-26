import * as React from "react"
import type { FormEvent } from "react"
import { format } from "date-fns"
import { cn } from "cn"
import { CircleAlert, Mail, Phone } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  cancelBooking,
  listBookingsForListings,
  updateBookingHostStatus,
} from "@/lib/bookings-client"
import { listHostListings } from "@/lib/host-listings-client"
import { formatGuests } from "@/pages/home/hero"
import { getBookingStatus, isLiveBooking } from "@/types/booking"
import type { Booking, BookingHostStatus, BookingStatus } from "@/types/booking"

const REQUEST_DATE_FORMAT = "dd MMM yyyy"

const STATUS_BADGE: Record<
  BookingStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
> = {
  pending: {
    label: "Awaiting payment",
    variant: "secondary",
    className: "bg-[#F4EDE8] text-[#8C5A44]",
  },
  confirmed: { label: "Confirmed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "outline" },
}

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

function RequestCard({
  request: { booking, status },
  onHostStatusChange,
  onCancel,
}: {
  request: Request
  onHostStatusChange: (status: BookingHostStatus) => void
  onCancel: () => void
}) {
  const badge = STATUS_BADGE[status]
  const isLive = isLiveBooking(status)
  const isContacted = booking.hostStatus === "contacted"

  return (
    <Card size="sm" className={isLive ? undefined : "opacity-75"}>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base text-primary">
              {booking.guestName ?? "Guest"}
            </span>
            <Badge variant={badge.variant} className={badge.className}>
              {badge.label}
            </Badge>
            {isLive ? (
              <Badge variant={isContacted ? "secondary" : "outline"}>
                {isContacted ? "Contacted" : "Not contacted yet"}
              </Badge>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {booking.stayName} ·{" "}
            {format(new Date(booking.checkIn), REQUEST_DATE_FORMAT)} →{" "}
            {format(new Date(booking.checkOut), REQUEST_DATE_FORMAT)} ·{" "}
            {formatGuests(booking.guests)}
          </div>

          {/* Same rule as the backend's `host_booking_contacts()`: guest
              contact details are only handed over while the booking is live. */}
          {isLive ? (
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <ContactLinks booking={booking} />
            </div>
          ) : null}

          {status === "cancelled" ? (
            <Alert variant="destructive" className="mt-3">
              <CircleAlert />
              <AlertDescription>
                Cancelled by{" "}
                {booking.cancelledBy === "host" ? "you" : "the guest"}
                {booking.cancelledAt
                  ? ` on ${format(new Date(booking.cancelledAt), REQUEST_DATE_FORMAT)}`
                  : ""}
                {booking.cancellationReason
                  ? ` — “${booking.cancellationReason}”`
                  : "."}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-2 text-xs text-muted-foreground">
            Requested {format(new Date(booking.createdAt), REQUEST_DATE_FORMAT)}
          </div>
        </div>

        {isLive ? (
          <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onHostStatusChange(isContacted ? "new" : "contacted")
              }
            >
              {isContacted ? "Mark as not contacted" : "Mark as contacted"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onCancel}
            >
              Cancel booking
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Asks the host why before cancelling — the reason is kept on the booking
 * for the guest, matching the backend's `cancel_booking(id, reason)`.
 */
function CancelBookingDialog({
  booking,
  onOpenChange,
  onConfirm,
}: {
  /** The booking being cancelled; `null` closes the dialog. */
  booking: Booking | null
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Start blank each time a booking is opened, and keep showing the last
  // one while the dialog animates closed (`booking` is already `null` then).
  const [shown, setShown] = React.useState(booking)
  if (booking && booking !== shown) {
    setShown(booking)
    setReason("")
    setError(null)
    setIsSubmitting(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={booking !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {shown
                ? `${shown.guestName ?? "The guest"}'s stay at ${shown.stayName}, ${format(new Date(shown.checkIn), REQUEST_DATE_FORMAT)} → ${format(new Date(shown.checkOut), REQUEST_DATE_FORMAT)}. This can't be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancel-reason">Reason for the guest</Label>
            <Textarea
              id="cancel-reason"
              required
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. The house is unavailable for repairs on these dates."
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep booking</AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || reason.trim() === ""}
            >
              {isSubmitting ? "Cancelling…" : "Cancel booking"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RequestSection({
  title,
  requests,
  onHostStatusChange,
  onCancel,
}: {
  title: React.ReactNode
  requests: Request[]
  onHostStatusChange: (id: string, status: BookingHostStatus) => void
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
          onHostStatusChange={(status) =>
            onHostStatusChange(request.booking.id, status)
          }
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
 * it's live — how to reach the guest. Guests still go through the normal
 * checkout; on the host side there are no payouts or invoices, just a
 * "contacted" flag and the option to cancel with a reason.
 *
 * Host listings aren't bookable until the approval backend exists, so for
 * now this is usually empty.
 */
export function BookingRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = React.useState<Request[] | null>(null)
  const [cancelling, setCancelling] = React.useState<Booking | null>(null)

  React.useEffect(() => {
    if (!user) return
    let cancelled = false

    listHostListings(user.id)
      .then((listings) =>
        listBookingsForListings(listings.map((listing) => listing.id))
      )
      .then((result) => {
        if (cancelled) return
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

  const replaceBooking = (updated: Booking, status?: BookingStatus) => {
    setRequests((current) =>
      (current ?? []).map((request) =>
        request.booking.id === updated.id
          ? { booking: updated, status: status ?? request.status }
          : request
      )
    )
  }

  const handleHostStatusChange = async (
    id: string,
    hostStatus: BookingHostStatus
  ) => {
    await updateBookingHostStatus(id, hostStatus)
    const request = requests.find((item) => item.booking.id === id)
    if (request) replaceBooking({ ...request.booking, hostStatus })
  }

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelling) return
    const updated = await cancelBooking(cancelling.id, "host", reason)
    replaceBooking(updated, "cancelled")
    setCancelling(null)
  }

  const live = requests.filter((request) => isLiveBooking(request.status))
  const past = requests.filter((request) => !isLiveBooking(request.status))
  const toFollowUp = live.filter(
    (request) => request.booking.hostStatus !== "contacted"
  ).length

  return (
    <div className="flex flex-col gap-9">
      <RequestSection
        title={
          <>
            Upcoming
            {toFollowUp > 0 ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {toFollowUp} to follow up
              </span>
            ) : null}
          </>
        }
        requests={live}
        onHostStatusChange={handleHostStatusChange}
        onCancel={setCancelling}
      />
      <RequestSection
        title="Past & cancelled"
        requests={past}
        onHostStatusChange={handleHostStatusChange}
        onCancel={setCancelling}
      />

      <CancelBookingDialog
        booking={cancelling}
        onOpenChange={(open) => {
          if (!open) setCancelling(null)
        }}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}

export default BookingRequests
