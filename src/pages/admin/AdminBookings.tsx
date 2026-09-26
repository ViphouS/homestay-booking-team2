import * as React from "react"
import { cn } from "cn"
import { Search } from "lucide-react"

import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Pagination } from "@/components/pagination"
import { ReasonDialog } from "@/components/reason-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listAllBookings } from "@/lib/admin-client"
import { cancelBooking } from "@/lib/bookings-client"
import { cancelBookingCopy } from "@/lib/cancel-booking-copy"
import { formatDay } from "@/lib/format-date"
import { formatPrice } from "@/lib/format-price"
import { isLiveBooking } from "@/types/booking"
import type { Booking, BookingStatus } from "@/types/booking"

const PAGE_SIZE = 8

const STATUS_FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Awaiting payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const COLUMNS =
  "grid grid-cols-[1fr_1.1fr_1.3fr_0.9fr_0.9fr_1fr_0.7fr_0.8fr] items-center gap-2"

/** The booking's short reference, as shown to support staff. */
function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

/**
 * Admin "Booking Management" — every booking on the platform, searchable by
 * guest or stay and filterable by status, with an admin cancel (reason
 * required, kept on the booking) for anything still live.
 */
export function AdminBookings() {
  const [bookings, setBookings] = React.useState<Booking[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<BookingStatus | "all">("all")
  const [page, setPage] = React.useState(1)
  const [cancelling, setCancelling] = React.useState<Booking | null>(null)

  const load = React.useCallback(() => {
    return listAllBookings()
      .then(setBookings)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Something went wrong.")
      )
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return (bookings ?? []).filter(
      (booking) =>
        (status === "all" || booking.status === status) &&
        (needle === "" ||
          (booking.guestName ?? "").toLowerCase().includes(needle) ||
          booking.stayName.toLowerCase().includes(needle) ||
          shortId(booking.id).toLowerCase().includes(needle))
    )
  }, [bookings, query, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelling) return
    await cancelBooking(cancelling.id, reason)
    setCancelling(null)
    await load()
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <div className="rounded-[28px] border border-[#e5e0d5] bg-[#f8f5ee] p-5 shadow-[0_1px_0_rgba(20,24,21,0.03)] md:p-7">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2420]">
            Booking Management
          </h1>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search guest or stay"
                placeholder="Search guest, stay or ID..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                className="w-60 bg-white pl-9"
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => {
                if (value) {
                  setStatus(value as BookingStatus | "all")
                  setPage(1)
                }
              }}
            >
              <SelectTrigger aria-label="Filter by status" className="bg-white">
                <SelectValue>
                  {(value: string) =>
                    STATUS_FILTERS.find((filter) => filter.value === value)
                      ?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            Couldn't load bookings: {error}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-[#e4dfd4] bg-[#f5f1e9]">
          <div className="min-w-[900px]">
            <div
              className={cn(
                COLUMNS,
                "border-b border-[#e4dfd4] bg-[#f7f3ea] px-4 py-3 text-[11px] font-semibold tracking-[0.12em] text-[#6f726d] uppercase"
              )}
            >
              <div>Booking ID</div>
              <div>Guest name</div>
              <div>Property</div>
              <div>Check-in</div>
              <div>Check-out</div>
              <div>Status</div>
              <div>Amount</div>
              <div className="text-right">Actions</div>
            </div>

            {bookings === null && !error ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Loading bookings…
              </p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                {bookings?.length === 0
                  ? "No bookings yet."
                  : "No bookings match these filters."}
              </p>
            ) : (
              visible.map((booking) => (
                <div
                  key={booking.id}
                  className={cn(
                    COLUMNS,
                    "border-b border-[#e4dfd4] bg-[#f9f7f2] px-4 py-4 text-sm text-[#2c2f2b] last:border-b-0"
                  )}
                >
                  <div className="font-mono text-xs font-medium text-[#1f2420]">
                    {shortId(booking.id)}
                  </div>
                  <div>{booking.guestName ?? "Guest"}</div>
                  <div className="pr-2 text-[#2f3c35]">{booking.stayName}</div>
                  <div>{formatDay(booking.checkIn)}</div>
                  <div>{formatDay(booking.checkOut)}</div>
                  <div>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <div className="font-semibold text-[#2d3030]">
                    {formatPrice(booking.total, booking.currency)}
                  </div>
                  <div className="text-right">
                    {isLiveBooking(booking.status) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCancelling(booking)}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#e4dfd4] pt-4 text-sm text-[#5c625e] md:flex-row md:items-center md:justify-between">
          <div>
            {filtered.length === 0
              ? "No entries"
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} entries`}
          </div>
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </div>

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
