/**
 * Every blog category, in display order.
 *
 * The runtime tuple is the source of truth, mirroring `LISTING_CATEGORIES` —
 * add to this list rather than widening `BlogCategory` to `string`.
 */
export const BLOG_CATEGORIES = [
  "Travel Tips",
  "Culture",
  "Food",
  "Destinations",
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

/** Runtime guard for values arriving from outside the app (URL, JSON). */
export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as readonly string[]).includes(value)
}

export interface BlogAuthor {
  name: string
  avatarUrl: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string
  category: BlogCategory
  tags: string[]
  author: BlogAuthor
  /** ISO date string, e.g. "2026-03-01". */
  publishedAt: string
  /** Paragraphs, rendered in order as `<p>` elements. */
  content: string[]
}
