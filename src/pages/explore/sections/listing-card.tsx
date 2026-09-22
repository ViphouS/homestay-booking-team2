import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowUpRight01Icon,
  BedIcon,
  StarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Listing } from "@/types/listing"

export type ListingCardProps = {
  listing: Listing
  className?: string
}

/** Photo, or a brand-tinted panel when the remote image will not load. */
function ListingImage({ listing }: { listing: Listing }) {
  const [hasFailed, setHasFailed] = React.useState(false)

  if (hasFailed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-muted to-primary/30"
      />
    )
  }

  return (
    <img
      src={listing.thumbnailUrl}
      alt={listing.name}
      onError={() => setHasFailed(true)}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/listing:scale-105"
    />
  )
}

/** One "3 guests · 2 beds" style stat. */
function Stat({
  icon,
  children,
}: {
  icon: typeof BedIcon
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-3.5" />
      {children}
    </span>
  )
}

/**
 * A single homestay in the results grid.
 *
 * Detail-forward on purpose: on the landing page a card only has to tempt,
 * but here a traveller is comparing, so the description, capacity and tags
 * that drive the filters are all visible without opening the stay.
 */
export function ListingCard({ listing, className }: ListingCardProps) {
  const { price, rating, capacity, location } = listing
  const navigate = useNavigate()

  return (
    <Card
      className={cn(
        "group/listing h-full gap-0 py-0 transition-shadow hover:shadow-lg hover:shadow-foreground/5",
        className
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <ListingImage listing={listing} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
        />

        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-sm">
          <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
          {rating.score.toFixed(1)}
          <span className="text-muted-foreground">({rating.reviewCount})</span>
        </Badge>

        <p className="absolute right-4 bottom-3 left-4 truncate text-[0.65rem] font-medium tracking-[0.14em] text-white/90 uppercase">
          {location.area}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg leading-snug font-medium">
            {listing.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {location.region} · {listing.category}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {listing.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Stat icon={UserGroupIcon}>
            {capacity.maxGuests} guest{capacity.maxGuests === 1 ? "" : "s"}
          </Stat>
          <Stat icon={BedIcon}>
            {listing.beds} bed{listing.beds === 1 ? "" : "s"}
          </Stat>
          <span>
            {listing.roomSize.value} {listing.roomSize.unit}
          </span>
        </div>

        {listing.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* `mt-auto` keeps the price rail on the baseline across a row of
            cards whose descriptions differ in length. */}
        <div className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
              Avg price
            </p>
            <p className="truncate text-sm font-semibold">
              ${price.amount}
              <span className="font-normal text-muted-foreground">
                /{price.unit}
              </span>
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => navigate(`/stay/${listing.id}`)}
          >
            View stay
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
        </div>
      </div>
    </Card>
  )
}