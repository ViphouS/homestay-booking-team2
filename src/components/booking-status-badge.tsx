import { Badge } from "@/components/ui/badge"
import type { BookingStatus } from "@/types/booking"

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

/**
 * A booking's status as one consistent badge — used by the guest's trips,
 * the host's requests and the admin's bookings table alike.
 */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const badge = STATUS_BADGE[status]
  return (
    <Badge variant={badge.variant} className={badge.className}>
      {badge.label}
    </Badge>
  )
}
