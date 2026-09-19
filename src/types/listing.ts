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
  category: string;
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
