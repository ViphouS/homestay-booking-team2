import { Link } from "react-router-dom"

import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDay } from "@/lib/format-date"
import { formatPrice } from "@/lib/format-price"
import type { Booking } from "@/types/booking"

/** The "Recent Bookings" table — occupies the wide left column. */
export function RecentBookingsTable({
  bookings,
}: {
  bookings: Booking[] | null
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Recent Bookings
          </h2>
          <Link
            to="/admin/bookings"
            className="text-sm font-medium text-[#B4795E] hover:underline"
          >
            View All
          </Link>
        </div>

        {bookings === null ? (
          <p className="text-sm text-muted-foreground">Loading bookings…</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-semibold">Guest</th>
                  <th className="py-2 pr-4 font-semibold">Property</th>
                  <th className="py-2 pr-4 font-semibold">Dates</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-border text-foreground"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {booking.guestName ?? "Guest"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {booking.stayName}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDay(booking.checkIn)} –{" "}
                      {formatDay(booking.checkOut)}
                    </td>
                    <td className="py-3 pr-4">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatPrice(booking.total, booking.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
