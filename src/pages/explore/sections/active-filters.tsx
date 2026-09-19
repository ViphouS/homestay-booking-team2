import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

import type { ExploreFilters } from "../types"

export type ActiveFiltersProps = {
  filters: ExploreFilters
  onFiltersChange: (filters: ExploreFilters) => void
  onClear: () => void
  className?: string
}

type Chip = {
  /** Unique within the row — facet values can repeat across facets. */
  id: string
  label: string
  next: Partial<ExploreFilters>
}

/** Flattens the filter object into one removable chip per constraint. */
function toChips(filters: ExploreFilters): Chip[] {
  const chips: Chip[] = []

  const addList = <
    K extends "regions" | "categories" | "facilities" | "experiences",
  >(
    key: K,
    values: readonly string[]
  ) => {
    values.forEach((value) => {
      chips.push({
        id: `${key}:${value}`,
        label: value,
        next: {
          [key]: (filters[key] as string[]).filter((item) => item !== value),
        } as Partial<ExploreFilters>,
      })
    })
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const from = filters.minPrice !== undefined ? `$${filters.minPrice}` : "Any"
    const to = filters.maxPrice !== undefined ? `$${filters.maxPrice}` : "Any"
    chips.push({
      id: "price",
      label: `Price: ${from} – ${to}`,
      next: { minPrice: undefined, maxPrice: undefined },
    })
  }

  if (filters.minRating !== undefined) {
    chips.push({
      id: "rating",
      label: `${filters.minRating.toFixed(1)}+ rated`,
      next: { minRating: undefined },
    })
  }

  addList("regions", filters.regions)
  addList("categories", filters.categories)
  addList("facilities", filters.facilities)
  addList("experiences", filters.experiences)

  return chips
}

/**
 * The row of dismissible chips summarising what is currently applied.
 *
 * Gives the sidebar's state a presence above the results, so a traveller can
 * see and undo a single constraint without reopening the filter panel.
 */
export function ActiveFilters({
  filters,
  onFiltersChange,
  onClear,
  className,
}: ActiveFiltersProps) {
  const chips = toChips(filters)

  if (chips.length === 0) return null

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label="Active filters"
    >
      {chips.map((chip) => (
        <Button
          key={chip.id}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onFiltersChange({ ...filters, ...chip.next })}
          aria-label={`Remove filter ${chip.label}`}
          className="font-normal"
        >
          {chip.label}
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            data-icon="inline-end"
          />
        </Button>
      ))}

      <Button type="button" variant="ghost" size="sm" onClick={onClear}>
        Clear all
      </Button>
    </div>
  )
}
