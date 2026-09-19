import { format } from "date-fns"

import type { GuestCounts, SearchValues } from "./types"

/**
 * Shared shell styling for a single cell of the search bar.
 *
 * Applied to whichever element is the field root — a `div` for the text
 * input, a `button` for the popover-backed fields — so every field lines up
 * and carries the same dividers regardless of the control inside it.
 *
 * Dividers are horizontal while the bar is stacked, vertical once it becomes
 * a single row at `lg`.
 */
export const searchFieldClassName =
  // `w-full` matters: a <button> is shrink-to-fit even as a flex container, so
  // the popover-backed fields would otherwise collapse to their text width
  // while the bar is stacked.
  "flex w-full min-w-0 flex-col justify-center gap-0.5 border-t border-border px-5 py-3 text-left first:border-t-0 lg:w-auto lg:border-t-0 lg:border-l lg:first:border-l-0"

/** Small muted caption sitting above a field's value. */
export const searchFieldLabelClassName =
  "text-xs leading-none text-muted-foreground"

/** The field's current value. */
export const searchFieldValueClassName =
  "truncate text-sm leading-6 font-medium text-foreground"

export const DATE_DISPLAY_FORMAT = "dd MMM yyyy"

export const EMPTY_GUESTS: GuestCounts = {
  adults: 0,
  children: 0,
  infants: 0,
}

export const DEFAULT_SEARCH_VALUES: SearchValues = {
  location: "",
  checkIn: undefined,
  checkOut: undefined,
  guests: { adults: 2, children: 0, infants: 0 },
}

/** "04 Nov 2026", or the placeholder when nothing is picked yet. */
export function formatSearchDate(date: Date | undefined, placeholder: string) {
  if (!date) {
    return placeholder
  }

  return format(date, DATE_DISPLAY_FORMAT)
}

/** "2 Adults, 1 Child" — omits any category set to zero. */
export function formatGuests(guests: GuestCounts, placeholder = "Add guests") {
  const parts: string[] = []

  if (guests.adults > 0) {
    parts.push(`${guests.adults} Adult${guests.adults === 1 ? "" : "s"}`)
  }

  if (guests.children > 0) {
    parts.push(`${guests.children} ${guests.children === 1 ? "Child" : "Children"}`)
  }

  if (guests.infants > 0) {
    parts.push(`${guests.infants} Infant${guests.infants === 1 ? "" : "s"}`)
  }

  if (parts.length === 0) {
    return placeholder
  }

  return parts.join(", ")
}

/** Midnight today — the earliest date a traveller can check in. */
export function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
