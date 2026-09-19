import type * as React from "react"
import { cn } from "cn"

import type { SortOption } from "../types"
import { formatResultCount } from "../utils"
import { SortDropdown } from "./sort-dropdown"

export type ResultsToolbarProps = {
  /** Total matches across every page. `null` while loading. */
  total: number | null
  /** 1-based index of the first result shown, for "Showing 1–6 of 12". */
  rangeStart: number
  rangeEnd: number
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  /** The narrow-screen filter entry point; hidden from `lg` up. */
  filterTrigger?: React.ReactNode
  className?: string
}

/** Result count on the left, filter entry point and sort control on the right. */
export function ResultsToolbar({
  total,
  rangeStart,
  rangeEnd,
  sort,
  onSortChange,
  filterTrigger,
  className,
}: ResultsToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {total === null ? (
          "Finding stays…"
        ) : total === 0 ? (
          "No stays found"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of {formatResultCount(total)}
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        {filterTrigger ? (
          <div className="lg:hidden">{filterTrigger}</div>
        ) : null}
        <SortDropdown value={sort} onValueChange={onSortChange} />
      </div>
    </div>
  )
}
