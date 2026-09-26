import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/format-price"
import type { BookingStatus, RecentBooking } from "../admin-data"

/** Maps a booking status to the badge variant that matches the design. */
const STATUS_VARIANT: Record<
  BookingStatus,
  "default" | "secondary" | "destructive"
> = {
  Confirmed: "secondary",
  Pending: "default",
  Cancelled: "destructive",
}

const STATUS_CLASS: Record<BookingStatus, string> = {
  Confirmed: "bg-[#E3EFE4] text-[#2F7D4F]",
  Pending: "bg-[#FBEED3] text-[#B4791E]",
  Cancelled: "bg-destructive/10 text-destructive",
}

/** The "Recent Bookings" table — occupies the wide left column. */
export function RecentBookingsTable({
  bookings,
}: {
  bookings: RecentBooking[]
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Recent Bookings
          </h2>
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-[#B4795E] hover:underline"
          >
            View All
          </button>
        </div>

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
                  <td className="py-3 pr-4 font-medium">{booking.guest}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {booking.property}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {booking.dates}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant={STATUS_VARIANT[booking.status]}
                      className={STATUS_CLASS[booking.status]}
                    >
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatPrice(booking.amount, "$")}.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
