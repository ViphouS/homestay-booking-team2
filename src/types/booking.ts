import type { GuestCounts } from "@/pages/home/hero"

export type Booking = {
  id: string
  userId: string
  listingId: string
  stayName: string
  checkIn: string
  checkOut: string
  guests: GuestCounts
  nights: number
  total: number
  currency: string
  createdAt: string
}
