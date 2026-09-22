import * as React from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"

import { useAuth } from "@/components/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { useListings } from "@/hooks/use-listings"
import { listBookings } from "@/lib/bookings-client"
import { formatPrice } from "@/lib/format-price"
import { formatGuests } from "@/pages/home/hero"
import type { Booking } from "@/types/booking"

const BOOKING_DATE_FORMAT = "dd MMM yyyy"

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
  booking,
  thumbnailUrl,
}: {
  booking: Booking
  thumbnailUrl: string | undefined
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
      <BookingThumbnail url={thumbnailUrl} alt={booking.stayName} />
      <div className="flex-1">
        <div className="font-heading text-base text-primary">
          {booking.stayName}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {format(new Date(booking.checkIn), BOOKING_DATE_FORMAT)} →{" "}
          {format(new Date(booking.checkOut), BOOKING_DATE_FORMAT)} ·{" "}
          {formatGuests(booking.guests)}
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-bold text-primary">
          {formatPrice(booking.total, booking.currency)}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">total</div>
      </div>
    </div>
  )
}

/**
 * "My Bookings" tab content.
 *
 * Reads from `bookings-client.ts`, which `BookingModal` writes to on a
 * successful (demo) checkout — so this only shows real trips a signed-in
 * user actually booked, never seed data. Split into upcoming and past by
 * comparing `checkOut` to now; past stays are shown dimmed rather than
 * tagged, since the section heading already says what they are.
 */
export function MyBookings() {
  const { user } = useAuth()
  const { listings } = useListings()
  const [upcoming, setUpcoming] = React.useState<Booking[] | null>(null)
  const [past, setPast] = React.useState<Booking[] | null>(null)

  React.useEffect(() => {
    if (!user) return
    let cancelled = false

    listBookings(user.id).then((result) => {
      if (cancelled) return

      // Split where the data arrives, not during render — reading the
      // clock is a side effect and React re-runs render bodies freely.
      const now = Date.now()
      setUpcoming(
        result
          .filter((booking) => new Date(booking.checkOut).getTime() >= now)
          .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      )
      setPast(
        result
          .filter((booking) => new Date(booking.checkOut).getTime() < now)
          .sort((a, b) => b.checkOut.localeCompare(a.checkOut))
      )
    })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (upcoming === null || past === null) {
    return (
      <p className="text-sm text-muted-foreground">Loading your bookings…</p>
    )
  }

  if (upcoming.length === 0 && past.length === 0) {
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

  const thumbnailFor = (listingId: string) =>
    listings?.find((listing) => listing.id === listingId)?.thumbnailUrl

  return (
    <div className="flex flex-col gap-9">
      {upcoming.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          <h3 className="text-sm font-semibold text-primary">Upcoming stays</h3>
          <div className="flex flex-col gap-3.5">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                thumbnailUrl={thumbnailFor(booking.listingId)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {past.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          <h3 className="text-sm font-semibold text-primary">Past stays</h3>
          <div className="flex flex-col gap-3.5 opacity-75">
            {past.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                thumbnailUrl={thumbnailFor(booking.listingId)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MyBookings
