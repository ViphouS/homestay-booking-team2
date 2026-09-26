import { MapPin } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, formatUnit } from "@/lib/format-price"
import type { Listing } from "@/types/listing"

export type PropertyCardProps = {
  listing: Listing
  /** Whether the listing is currently published/bookable. */
  active: boolean
  onToggleActive: (id: string, active: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Admin-side listing card — mirrors the public `ListingCard`'s data (image,
 * location, name, host, price) but swaps the guest-facing "book it" affordance
 * for host controls: an Active toggle plus Edit / Delete.
 *
 * Reuses the shared `Card` and `Button` primitives rather than hand-rolling
 * chrome, so it inherits the same radius/ring/spacing tokens as the rest of
 * the app.
 */
export function PropertyCard({
  listing,
  active,
  onToggleActive,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <Card className="overflow-hidden">
      <img
        src={listing.thumbnailUrl}
        alt={listing.name}
        loading="lazy"
        className="h-52 w-full object-cover"
      />

      <CardContent className="flex flex-col gap-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#B4795E] uppercase">
          <MapPin className="size-3.5" />
          {listing.location.region}
        </span>

        <h3 className="font-heading text-xl leading-snug text-foreground">
          {listing.name}
        </h3>

        <p className="text-sm text-muted-foreground">
          Host: <span className="text-foreground">{listing.host.name}</span>
        </p>

        <p className="font-heading text-lg font-semibold text-foreground">
          {formatPrice(listing.price.amount, listing.price.currency)} /{" "}
          {formatUnit(listing.price.unit)}
        </p>

        <div className="my-1 border-t border-border" />

        <div className="flex items-center justify-between gap-3">
          <ActiveToggle
            active={active}
            onChange={(next) => onToggleActive(listing.id, next)}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onEdit(listing.id)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(listing.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Small pill switch matching the design's dark-green "Active" toggle. Kept
 * local to the card since it is the only place that needs it.
 */
function ActiveToggle({
  active,
  onChange,
}: {
  active: boolean
  onChange: (active: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Deactivate listing" : "Activate listing"}
      onClick={() => onChange(!active)}
      className="flex cursor-pointer items-center gap-2.5"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          active ? "bg-[#28382B]" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
            active ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </span>
      <span className="text-sm font-medium text-foreground">
        {active ? "Active" : "Inactive"}
      </span>
    </button>
  )
}
