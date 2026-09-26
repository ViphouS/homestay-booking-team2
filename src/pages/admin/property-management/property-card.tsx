import * as React from "react"
import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"

import { ListingStatusBadge } from "@/components/listing-status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/format-price"
import type { HostListing } from "@/types/host-listing"

export type PropertyCardProps = {
  listing: HostListing
  onArchive: (listing: HostListing) => void
  onDelete: (listing: HostListing) => void
}

function CoverImage({ listing }: { listing: HostListing }) {
  const [failed, setFailed] = React.useState(false)

  if (!listing.thumbnailUrl || failed) {
    return (
      <div className="h-52 w-full bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
    )
  }

  return (
    <img
      src={listing.thumbnailUrl}
      alt={listing.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-52 w-full object-cover"
    />
  )
}

/**
 * Admin-side listing card — the public card's data (image, location, name,
 * host, price) plus its moderation status and the admin's actions:
 * view it live, review it (pending), archive it, or delete it.
 *
 * Reuses the shared `Card`/`Button` primitives and `ListingStatusBadge`, so
 * it matches the host's own "My Listings" view.
 */
export function PropertyCard({
  listing,
  onArchive,
  onDelete,
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CoverImage listing={listing} />

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#B4795E] uppercase">
            <MapPin className="size-3.5" />
            {listing.region}
          </span>
          <ListingStatusBadge status={listing.status} />
        </div>

        <h3 className="font-heading text-xl leading-snug text-foreground">
          {listing.name}
        </h3>

        <p className="text-sm text-muted-foreground">
          Host:{" "}
          <span className="text-foreground">
            {listing.hostName || "JumRok catalogue"}
          </span>
        </p>

        <p className="font-heading text-lg font-semibold text-foreground">
          {formatPrice(listing.pricePerNight, listing.currency)} / night
        </p>

        <div className="my-1 border-t border-border" />

        <div className="flex flex-wrap items-center justify-end gap-2">
          {listing.status === "approved" ? (
            <Link
              to={`/stay/${listing.id}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View
            </Link>
          ) : null}
          {listing.status === "pending" ? (
            <Link
              to="/admin/approvals"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Review
            </Link>
          ) : null}
          {listing.status !== "archived" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onArchive(listing)}
            >
              Archive
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(listing)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
