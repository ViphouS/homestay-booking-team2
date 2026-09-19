/**
 * Shared types for the Hero search experience.
 *
 * These are intentionally free of any UI concern so other sections (results
 * page, filters, booking flow) can consume the same shape.
 */

export type GuestCounts = {
  adults: number
  children: number
  infants: number
}

export type SearchValues = {
  location: string
  checkIn: Date | undefined
  checkOut: Date | undefined
  guests: GuestCounts
}
