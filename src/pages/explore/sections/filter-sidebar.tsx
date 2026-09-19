import { StarIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import type { ExploreFacets, ExploreFilters } from "../types"
import { RATING_OPTIONS } from "../utils"
import { FilterChipGroup } from "./filter-chip-group"
import { PriceRangeField } from "./price-range-field"

export type FilterSidebarProps = {
  filters: ExploreFilters
  /** Receives the complete next filter set. */
  onFiltersChange: (filters: ExploreFilters) => void
  /** The values actually present in the catalogue. */
  facets: ExploreFacets
  /** Real price bounds, used as the input placeholders. */
  priceBounds?: { min: number; max: number }
  activeFilterCount: number
  onClear: () => void
  className?: string
}

/**
 * Every way to narrow the results, in one column.
 *
 * Purely controlled — it owns no state, so the same instance renders both as
 * the desktop rail and inside the mobile filter popover without either copy
 * drifting from the other.
 */
export function FilterSidebar({
  filters,
  onFiltersChange,
  facets,
  priceBounds,
  activeFilterCount,
  onClear,
  className,
}: FilterSidebarProps) {
  const patch = (changes: Partial<ExploreFilters>) =>
    onFiltersChange({ ...filters, ...changes })

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">Filters</h2>
        {activeFilterCount > 0 ? (
          <Button type="button" variant="ghost" size="xs" onClick={onClear}>
            Clear all
          </Button>
        ) : null}
      </div>

      <PriceRangeField
        min={filters.minPrice}
        max={filters.maxPrice}
        bounds={priceBounds}
        onRangeChange={({ min, max }) =>
          patch({ minPrice: min, maxPrice: max })
        }
      />

      <Separator />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Guest rating
        </legend>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((score) => {
            const isSelected = filters.minRating === score

            return (
              <Button
                key={score}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                aria-pressed={isSelected}
                // Tapping the active floor clears it — no "Any" chip needed.
                onClick={() =>
                  patch({ minRating: isSelected ? undefined : score })
                }
                className="font-normal"
              >
                <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
                {score.toFixed(1)}+
              </Button>
            )
          })}
        </div>
      </fieldset>

      <Separator />

      <FilterChipGroup
        label="Region"
        options={facets.regions}
        selected={filters.regions}
        onSelectedChange={(regions) => patch({ regions })}
      />

      <Separator />

      <FilterChipGroup
        label="Stay type"
        options={facets.categories}
        selected={filters.categories}
        onSelectedChange={(categories) => patch({ categories })}
      />

      <Separator />

      <FilterChipGroup
        label="Facilities"
        options={facets.facilities}
        selected={filters.facilities}
        onSelectedChange={(facilities) => patch({ facilities })}
      />

      <Separator />

      <FilterChipGroup
        label="Experiences"
        options={facets.experiences}
        selected={filters.experiences}
        onSelectedChange={(experiences) => patch({ experiences })}
      />
    </div>
  )
}
