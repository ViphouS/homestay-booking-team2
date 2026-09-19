import * as React from "react"
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { SortOption } from "../types"
import { SORT_OPTIONS } from "../utils"

export type SortDropdownProps = {
  value: SortOption
  onValueChange: (value: SortOption) => void
  className?: string
}

/** Orders the result set. Built on the shared `Popover` + `Button` primitives. */
export function SortDropdown({
  value,
  onValueChange,
  className,
}: SortDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const active = SORT_OPTIONS.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={className}
          >
            <span className="text-muted-foreground">Sort:</span>
            {active?.label}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-56 gap-1 p-1.5">
        {SORT_OPTIONS.map((option) => {
          const isActive = option.value === value

          return (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={isActive}
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "w-full justify-between font-normal",
                isActive && "font-medium"
              )}
            >
              {option.label}
              {isActive ? (
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
              ) : null}
            </Button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
