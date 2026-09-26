import { Badge } from "@/components/ui/badge"
import type { HostListingStatus } from "@/types/host-listing"

const STATUS_BADGE: Record<
  HostListingStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
> = {
  pending: {
    label: "Pending review",
    variant: "secondary",
    className: "bg-[#F4EDE8] text-[#8C5A44]",
  },
  approved: { label: "Live", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  draft: { label: "Draft", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
}

/** A listing's moderation status — for its host and for admins alike. */
export function ListingStatusBadge({ status }: { status: HostListingStatus }) {
  const badge = STATUS_BADGE[status]
  return (
    <Badge variant={badge.variant} className={badge.className}>
      {badge.label}
    </Badge>
  )
}
