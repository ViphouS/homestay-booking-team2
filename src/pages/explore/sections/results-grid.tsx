import { MapsSearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import type { Listing } from "@/types/listing"

import { ListingCard } from "./listing-card"

const GRID_CLASSNAME = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"

export type ResultsGridProps = {
  /** `null` renders skeletons — the catalogue is still loading. */
  listings: Listing[] | null
  /** Skeleton count while loading. */
  skeletonCount?: number
  /** Offered in the empty state; omitted when nothing is filtered. */
  onClearFilters?: () => void
  className?: string
}

function ResultsSkeleton({ count }: { count: number }) {
  return (
    <div className={GRID_CLASSNAME} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[26rem] animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  )
}

function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={MapsSearchIcon}
          strokeWidth={1.8}
          className="size-6"
        />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-medium">No stays match yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try widening your destination, lowering the guest count, or removing a
          filter or two.
        </p>
      </div>
      {onClearFilters ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Clear all filters
        </Button>
      ) : null}
    </div>
  )
}

/**
 * The result set itself, plus its loading and empty states.
 *
 * Keeping all three here means the page never has to branch on load status
 * in its layout code.
 */
export function ResultsGrid({
  listings,
  skeletonCount = 6,
  onClearFilters,
  className,
}: ResultsGridProps) {
  if (listings === null) {
    return (
      <div className={className}>
        <ResultsSkeleton count={skeletonCount} />
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className={className}>
        <EmptyState onClearFilters={onClearFilters} />
      </div>
    )
  }

  return (
    <div className={cn(GRID_CLASSNAME, className)}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
