import { cn } from "cn"

import { PopoverTrigger } from "@/components/ui/popover"

import {
  searchFieldClassName,
  searchFieldLabelClassName,
  searchFieldValueClassName,
} from "./utils"

export type SearchFieldTriggerProps = {
  /** Caption above the value, e.g. "Check in". */
  label: string
  /** Already-formatted value, or the placeholder when nothing is selected. */
  value: string
  /** Dims the value to read as a placeholder. */
  isPlaceholder?: boolean
  className?: string
}

/**
 * A popover trigger shaped like one cell of the search bar.
 *
 * Shared by every field whose control opens in a popover (dates, guests) so
 * they stay visually identical to the plain-input fields beside them.
 */
export function SearchFieldTrigger({
  label,
  value,
  isPlaceholder = false,
  className,
}: SearchFieldTriggerProps) {
  return (
    <PopoverTrigger
      className={cn(
        searchFieldClassName,
        "cursor-pointer rounded-none transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
        className
      )}
    >
      <span className={searchFieldLabelClassName}>{label}</span>
      <span
        className={cn(
          searchFieldValueClassName,
          isPlaceholder && "font-normal text-muted-foreground"
        )}
      >
        {value}
      </span>
    </PopoverTrigger>
  )
}
