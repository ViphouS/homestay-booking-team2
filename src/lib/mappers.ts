import type { Database } from "@/types/database"
import type { BlogCategory, BlogPost } from "@/types/blog-post"
import type { HostListing } from "@/types/host-listing"
import type { Listing, ListingCategory } from "@/types/listing"

/**
 * Database rows (flat, snake_case) → the app's domain types (nested,
 * camelCase). The only place that knows both shapes, so a column rename is
 * a one-file change.
 */

type Tables = Database["public"]["Tables"]
export type ListingRow = Tables["listings"]["Row"]
export type BlogPostRow = Tables["blog_posts"]["Row"]

// `category` columns carry a CHECK constraint listing exactly the same values
// as `LISTING_CATEGORIES` / `BLOG_CATEGORIES`, so these casts are safe.

export function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    images: row.images,
    thumbnailUrl: row.thumbnail_url,
    location: { region: row.region, area: row.area },
    category: row.category as ListingCategory,
    tags: row.tags,
    price: {
      amount: Number(row.price_amount),
      currency: row.price_currency,
      unit: row.price_unit,
    },
    rating: {
      score: Number(row.rating_score),
      reviewCount: row.review_count,
    },
    capacity: { maxGuests: row.max_guests },
    beds: row.beds,
    roomType: row.room_type,
    roomSize: { value: Number(row.room_size_value), unit: row.room_size_unit },
    facilities: row.facilities,
    experiences: row.experiences,
    host: { name: row.host_name, avatarUrl: row.host_avatar_url },
  }
}

export function toHostListing(row: ListingRow): HostListing {
  return {
    id: row.id,
    hostId: row.host_id,
    hostName: row.host_name,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    category: row.category as ListingCategory,
    region: row.region,
    area: row.area,
    pricePerNight: Number(row.price_amount),
    currency: row.price_currency,
    maxGuests: row.max_guests,
    beds: row.beds,
    roomType: row.room_type,
    thumbnailUrl: row.thumbnail_url || undefined,
    status: row.status,
    createdAt: row.created_at,
    submittedAt: row.submitted_at ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
  }
}

export function toBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    category: row.category as BlogCategory,
    tags: row.tags,
    author: { name: row.author_name, avatarUrl: row.author_avatar_url },
    publishedAt: row.published_at ?? row.created_at,
    content: row.content,
  }
}
