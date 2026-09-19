/**
 * Every stay type in the catalogue, in display order.
 *
 * The runtime tuple is the source of truth so surfaces that enumerate
 * categories (filter chips) or validate them (URL parsing) stay in step with
 * the type automatically. Add to this list rather than widening
 * `ListingCategory` to `string`.
 */
export const LISTING_CATEGORIES = [
  "Village Homestay",
  "Riverside Homestay",
  "Farm Homestay",
  "Plantation Homestay",
  "Community Homestay",
  "Countryside Homestay",
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

/** Runtime guard for values arriving from outside the app (URL, JSON). */
export function isListingCategory(value: string): value is ListingCategory {
  return (LISTING_CATEGORIES as readonly string[]).includes(value);
}

export interface Location {
  region: string;
  area: string;
}

export interface Price {
  amount: number;
  currency: string;
  unit: string;
}

export interface Rating {
  score: number;
  reviewCount: number;
}

export interface Capacity {
  maxGuests: number;
}

export interface RoomSize {
  value: number;
  unit: string;
}

export interface Host {
  name: string;
  avatarUrl: string;
}

export interface Listing {
  id: string;
  name: string;
  tagline: string;
  description: string;
  images: string[];
  thumbnailUrl: string;
  location: Location;
  category: ListingCategory;
  tags: string[];
  price: Price;
  rating: Rating;
  capacity: Capacity;
  beds: number;
  roomType: string;
  roomSize: RoomSize;
  facilities: string[];
  experiences: string[];
  host: Host;
}
