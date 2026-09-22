import { NoteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import type { BlogPost } from "@/types/blog-post"

import { BlogPostCard } from "./blog-post-card"

const GRID_CLASSNAME = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"

export type BlogGridProps = {
  /** `null` renders skeletons — the catalogue is still loading. */
  posts: BlogPost[] | null
  /** Skeleton count while loading. */
  skeletonCount?: number
  className?: string
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className={GRID_CLASSNAME} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-[24rem] animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-16 text-center ring-1 ring-foreground/10">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon icon={NoteIcon} strokeWidth={1.8} className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-medium">No posts yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check back soon — new stories from the JumRok community are on the
          way.
        </p>
      </div>
    </div>
  )
}

/**
 * The blog post grid, plus its loading and empty states.
 *
 * Keeping all three here means the page never has to branch on load status
 * in its layout code.
 */
export function BlogGrid({
  posts,
  skeletonCount = 6,
  className,
}: BlogGridProps) {
  if (posts === null) {
    return (
      <div className={className}>
        <GridSkeleton count={skeletonCount} />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className={className}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className={cn(GRID_CLASSNAME, className)}>
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
