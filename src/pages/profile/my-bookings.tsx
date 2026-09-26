import * as React from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { CircleAlert } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { ReasonDialog } from "@/components/reason-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { cancelBooking, listMyBookings } from "@/lib/bookings-client"
import { cancelBookingCopy } from "@/lib/cancel-booking-copy"
import { formatDay } from "@/lib/format-date"
import { formatPrice } from "@/lib/format-price"
import { formatGuests } from "@/pages/home/hero"
import { getBookingStatus, isLiveBooking } from "@/types/booking"
import type { Booking, BookingStatus } from "@/types/booking"

type Trip = {
  booking: Booking
  status: BookingStatus
  /** Guests may cancel only before check-in (the database enforces it too). */
  canCancel: boolean
}

function BookingThumbnail({
  url,
  alt,
}: {
  url: string | undefined
  alt: string
}) {
  const [imageFailed, setImageFailed] = React.useState(false)

  if (!url || imageFailed) {
    return (
      <div className="size-[72px] shrink-0 rounded-xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setImageFailed(true)}
      className="size-[72px] shrink-0 rounded-xl object-cover"
    />
  )
}

function BookingCard({
  trip: { booking, status, canCancel },
  onCancel,
}: {
  trip: Trip
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-4">
        <BookingThumbnail url={booking.thumbnailUrl} alt={booking.stayName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base text-primary">
              {booking.stayName}
            </span>
            <BookingStatusBadge status={status} />
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {formatDay(booking.checkIn)} → {formatDay(booking.checkOut)} ·{" "}
            {formatGuests(booking.guests)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="text-base font-bold text-primary">
            {formatPrice(booking.total, booking.currency)}
          </div>
          <div className="text-xs text-muted-foreground">total</div>
          {canCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {status === "cancelled" && booking.cancellationReason ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>
            {booking.cancelledById === booking.guestId
              ? "You cancelled this booking"
              : "The host cancelled this booking"}{" "}
            — “{booking.cancellationReason}”
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function TripSection({
  title,
  trips,
  dimmed = false,
  onCancel,
}: {
  title: string
  trips: Trip[]
  dimmed?: boolean
  onCancel: (booking: Booking) => void
}) {
  if (trips.length === 0) return null

  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <div
        className={
          dimmed ? "flex flex-col gap-3.5 opacity-75" : "flex flex-col gap-3.5"
        }
      >
        {trips.map((trip) => (
          <BookingCard
            key={trip.booking.id}
            trip={trip}
            onCancel={() => onCancel(trip.booking)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * "My Bookings" tab content — the signed-in user's own trips from the
 * `bookings` table, split into upcoming and past/cancelled. Every booking
 * shows its status: until a payment server exists they stay "Awaiting
 * payment" and the host follows up directly.
 */
export function MyBookings() {
  const { user } = useAuth()
  const [trips, setTrips] = React.useState<Trip[] | null>(null)
  const [hasError, setHasError] = React.useState(false)
  const [cancelling, setCancelling] = React.useState<Booking | null>(null)

  const load = React.useCallback((userId: string) => {
    return listMyBookings(userId)
      .then((result) => {
        // Work out statuses where the data arrives, not during render —
        // reading the clock is a side effect.
        const now = Date.now()
        const today = format(now, "yyyy-MM-dd")
        setTrips(
          result.map((booking) => {
            const status = getBookingStatus(booking, now)
            return {
              booking,
              status,
              canCancel: isLiveBooking(status) && booking.checkIn > today,
            }
          })
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
        Couldn't load your bookings. Please refresh to try again.
      </p>
    )
  }

  if (trips === null) {
    return (
      <p className="text-sm text-muted-foreground">Loading your bookings…</p>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          No bookings yet — explore stays and book your first trip.
        </p>
        <Link to="/explore" className={buttonVariants({ variant: "outline" })}>
          Explore stays
        </Link>
      </div>
    )
  }

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelling) return
    await cancelBooking(cancelling.id, reason)
    setCancelling(null)
    await load(user.id)
  }

  const upcoming = trips
    .filter((trip) => isLiveBooking(trip.status))
    .sort((a, b) => a.booking.checkIn.localeCompare(b.booking.checkIn))
  const past = trips.filter((trip) => !isLiveBooking(trip.status))

  return (
    <div className="flex flex-col gap-9">
      <TripSection
        title="Upcoming stays"
        trips={upcoming}
        onCancel={setCancelling}
      />
      <TripSection
        title="Past & cancelled"
        trips={past}
        dimmed
        onCancel={setCancelling}
      />

      <ReasonDialog
        copy={
          cancelling
            ? cancelBookingCopy(
                `Your stay at ${cancelling.stayName}, ${formatDay(cancelling.checkIn)} → ${formatDay(cancelling.checkOut)}.`,
                "host"
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

export default MyBookings
