import { cn } from "cn"

import { Button } from "@/components/ui/button"

export type FilterChipGroupProps<T extends string> = {
  /** Heading above the chips. */
  label: string
  options: readonly T[]
  selected: readonly T[]
  /** Called with the full next selection, not the toggled item. */
  onSelectedChange: (next: T[]) => void
  className?: string
}

/**
 * A labelled row of multi-select toggle chips.
 *
 * Every facet in the sidebar — region, stay type, facilities, experiences —
 * is the same interaction, so they all render through this one component
 * rather than each hand-rolling its own chips.
 */
export function FilterChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelectedChange,
  className,
}: FilterChipGroupProps<T>) {
  if (options.length === 0) return null

  const toggle = (option: T) => {
    onSelectedChange(
      selected.includes(option)
        ? selected.filter((value) => value !== option)
        : [...selected, option]
    )
  }

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)

          return (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              aria-pressed={isSelected}
              onClick={() => toggle(option)}
              className="font-normal"
            >
              {option}
            </Button>
          )
        })}
      </div>
    </fieldset>
  )
}
