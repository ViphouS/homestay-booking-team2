import * as React from "react"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent } from "@/components/ui/popover"

import { SearchFieldTrigger } from "./search-field"
import type { GuestCounts } from "./types"
import { formatGuests } from "./utils"

type GuestCategory = {
  key: keyof GuestCounts
  label: string
  hint: string
  min: number
  max: number
}

const GUEST_CATEGORIES: GuestCategory[] = [
  { key: "adults", label: "Adults", hint: "Ages 13 or above", min: 1, max: 16 },
  { key: "children", label: "Children", hint: "Ages 2 – 12", min: 0, max: 10 },
  { key: "infants", label: "Infants", hint: "Under 2", min: 0, max: 5 },
]

type GuestStepperProps = {
  label: string
  hint: string
  value: number
  min: number
  max: number
  onValueChange: (next: number) => void
}

/** One "– 2 +" row inside the guest popover. */
function GuestStepper({
  label,
  hint,
  value,
  min,
  max,
  onValueChange,
}: GuestStepperProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onValueChange(value - 1)}
        >
          <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
        </Button>
        <span
          aria-live="polite"
          className="w-6 text-center text-sm font-medium tabular-nums"
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onValueChange(value + 1)}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  )
}

export type GuestSelectorProps = {
  value: GuestCounts
  onValueChange: (guests: GuestCounts) => void
  label?: string
  placeholder?: string
  className?: string
}

/**
 * Guest count field. Opens a popover of per-category steppers and renders a
 * summary such as "2 Adults, 1 Child" in the closed state.
 */
export function GuestSelector({
  value,
  onValueChange,
  label = "Guests",
  placeholder = "Add guests",
  className,
}: GuestSelectorProps) {
  const summary = formatGuests(value, placeholder)
  const isPlaceholder = summary === placeholder

  const handleCategoryChange = React.useCallback(
    (key: keyof GuestCounts, next: number) => {
      onValueChange({ ...value, [key]: next })
    },
    [onValueChange, value]
  )

  return (
    <Popover>
      <SearchFieldTrigger
        label={label}
        value={summary}
        isPlaceholder={isPlaceholder}
        className={className}
      />
      <PopoverContent align="end" className="w-72 gap-3">
        {GUEST_CATEGORIES.map((category) => (
          <GuestStepper
            key={category.key}
            label={category.label}
            hint={category.hint}
            value={value[category.key]}
            min={category.min}
            max={category.max}
            onValueChange={(next) => handleCategoryChange(category.key, next)}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}
