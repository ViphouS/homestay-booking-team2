import { cn } from "cn"

import { formatGuests, type SearchValues } from "@/pages/home/hero"

import { formatDateRange } from "../utils"

export type ExploreHeaderProps = {
  /** The committed search, used to phrase the heading. */
  search: SearchValues
  className?: string
}

/**
 * The page's title block.
 *
 * The heading names the destination the traveller searched for so the
 * results read as an answer to their question rather than a generic index.
 */
export function ExploreHeader({ search, className }: ExploreHeaderProps) {
  const destination = search.location.trim()

  return (
    <header
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Authentic coordinates
        </p>
        <h1 className="font-heading text-3xl leading-tight font-bold text-balance sm:text-4xl">
          {destination
            ? `Homestays in ${destination}`
            : "Explore Cambodia’s homestays"}
        </h1>
      </div>

      <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        {formatDateRange(search.checkIn, search.checkOut)} ·{" "}
        {formatGuests(search.guests, "Any group size")}. Every stay below is
        hosted by a Khmer family and booked direct.
      </p>
    </header>
  )
}
