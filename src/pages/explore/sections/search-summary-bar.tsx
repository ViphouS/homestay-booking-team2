import * as React from "react"
import { cn } from "cn"

import {
  CheckInDatePicker,
  CheckOutDatePicker,
  GuestSelector,
  LocationInput,
  SearchButton,
  type SearchValues,
} from "@/pages/home/hero"

export type SearchSummaryBarProps = {
  /** The committed search, as read from the URL. */
  value: SearchValues
  /** Fired on submit — the page then writes it back to the URL. */
  onSubmit: (values: SearchValues) => void
  className?: string
}

/**
 * The hero's search, carried onto the results page and still editable.
 *
 * Composed from the hero module's individual fields rather than its
 * `SearchBar` wrapper, because here the committed values live in the URL —
 * exactly the "results page with URL-synced filters" case those fields were
 * exported for. Edits are held as a local draft until submit, so a
 * half-typed destination never re-runs the search.
 */
export function SearchSummaryBar({
  value,
  onSubmit,
  className,
}: SearchSummaryBarProps) {
  const [draft, setDraft] = React.useState(value)
  const [seed, setSeed] = React.useState(value)

  // Re-seed whenever the committed search changes elsewhere (back button, a
  // fresh search from the hero). Adjusting during render rather than in an
  // effect avoids a frame of stale values — React re-runs this component
  // immediately, before anything is painted. `value` is memoised upstream,
  // so this only fires on a genuine change.
  if (seed !== value) {
    setSeed(value)
    setDraft(value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(draft)
  }

  const handleCheckInChange = (checkIn: Date | undefined) => {
    setDraft((previous) => ({
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
      aria-label="Refine your homestay search"
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-border bg-background shadow-lg shadow-foreground/5",
        "sm:grid sm:grid-cols-2 lg:flex lg:items-stretch lg:rounded-full",
        className
      )}
    >
      <LocationInput
        id="explore-destination"
        label="Destination"
        value={draft.location}
        onValueChange={(location) =>
          setDraft((previous) => ({ ...previous, location }))
        }
        className="sm:col-span-2 lg:flex-[1.3] lg:pl-7"
      />
      <CheckInDatePicker
        value={draft.checkIn}
        onValueChange={handleCheckInChange}
        className="lg:flex-1"
      />
      <CheckOutDatePicker
        value={draft.checkOut}
        onValueChange={(checkOut) =>
          setDraft((previous) => ({ ...previous, checkOut }))
        }
        minDate={draft.checkIn}
        className="sm:border-l sm:border-border lg:flex-1"
      />
      <GuestSelector
        label="Travellers"
        value={draft.guests}
        onValueChange={(guests) =>
          setDraft((previous) => ({ ...previous, guests }))
        }
        className="sm:col-span-2 lg:flex-1"
      />
      <div className="border-t border-border p-3 sm:col-span-2 lg:flex lg:items-center lg:border-t-0 lg:p-2">
        <SearchButton label="Update search" />
      </div>
    </form>
  )
}
