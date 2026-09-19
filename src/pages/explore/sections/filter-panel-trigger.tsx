import { FilterHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { FilterSidebar, type FilterSidebarProps } from "./filter-sidebar"

export type FilterPanelTriggerProps = FilterSidebarProps

/**
 * The narrow-screen entry point to the filters.
 *
 * Renders the very same {@link FilterSidebar} inside a popover rather than a
 * second, cut-down set of controls, so the two never drift apart. The page
 * shows this below `lg` and the standing rail above it.
 */
export function FilterPanelTrigger({
  activeFilterCount,
  ...sidebarProps
}: FilterPanelTriggerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} />
            All filters
            {activeFilterCount > 0 ? (
              <Badge className="ml-0.5 tabular-nums">{activeFilterCount}</Badge>
            ) : null}
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
      >
        <FilterSidebar
          activeFilterCount={activeFilterCount}
          {...sidebarProps}
        />
      </PopoverContent>
    </Popover>
  )
}
