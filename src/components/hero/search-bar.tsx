import * as React from "react"
import { cn } from "cn"

import { CheckInDatePicker, CheckOutDatePicker } from "./date-picker-field"
import { GuestSelector } from "./guest-selector"
import { LocationInput } from "./location-input"
import { SearchButton } from "./search-button"
import type { SearchValues } from "./types"
import { DEFAULT_SEARCH_VALUES } from "./utils"

export type SearchBarProps = {
  /** Seeds the initial state. The bar owns its values from then on. */
  defaultValues?: Partial<SearchValues>
  /** Fired on submit — via the button, or Enter from the destination input. */
  onSearch?: (values: SearchValues) => void
  /** Label for the submit button. */
  searchLabel?: string
  className?: string
}

/**
 * The homestay search bar: destination, date range, guests and submit.
 *
 * State lives here so the common case is a one-line drop-in. Every field is
 * also exported individually and fully controlled, so a screen that needs to
 * own the values (a results page with URL-synced filters, say) can compose
 * `LocationInput` / `CheckInDatePicker` / `CheckOutDatePicker` /
 * `GuestSelector` / `SearchButton` directly instead of using this wrapper.
 */
export function SearchBar({
  defaultValues,
  onSearch,
  searchLabel,
  className,
}: SearchBarProps) {
  const [values, setValues] = React.useState<SearchValues>(() => ({
    ...DEFAULT_SEARCH_VALUES,
    ...defaultValues,
  }))

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch?.(values)
  }

  const handleCheckInChange = (checkIn: Date | undefined) => {
    setValues((previous) => ({
      ...previous,
      checkIn,
      // A departure on or before the new arrival is no longer valid.
      checkOut:
        previous.checkOut && checkIn && previous.checkOut <= checkIn
          ? undefined
          : previous.checkOut,
    }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search homestays"
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-border bg-background shadow-xl shadow-foreground/10",
        // Stacked on phones, dates paired on tablets, one pill from lg up.
        "sm:grid sm:grid-cols-2 lg:flex lg:items-stretch lg:rounded-full",
        className
      )}
    >
      <LocationInput
        value={values.location}
        onValueChange={(location) =>
          setValues((previous) => ({ ...previous, location }))
        }
        className="sm:col-span-2 lg:flex-[1.3] lg:pl-7"
      />
      <CheckInDatePicker
        value={values.checkIn}
        onValueChange={handleCheckInChange}
        className="lg:flex-1"
      />
      <CheckOutDatePicker
        value={values.checkOut}
        onValueChange={(checkOut) =>
          setValues((previous) => ({ ...previous, checkOut }))
        }
        minDate={values.checkIn}
        className="sm:border-l sm:border-border lg:flex-1"
      />
      <GuestSelector
        value={values.guests}
        onValueChange={(guests) =>
          setValues((previous) => ({ ...previous, guests }))
        }
        className="sm:col-span-2 lg:flex-1"
      />
      <div className="border-t border-border p-3 sm:col-span-2 lg:flex lg:items-center lg:border-t-0 lg:p-2">
        <SearchButton label={searchLabel} />
      </div>
    </form>
  )
}
