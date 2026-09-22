import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { format } from "date-fns"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { BlogPost } from "@/types/blog-post"

export type BlogPostCardProps = {
  post: BlogPost
  className?: string
}

/** Cover photo, or a brand-tinted panel when the remote image will not load. */
function CoverImage({ post }: { post: BlogPost }) {
  const [hasFailed, setHasFailed] = React.useState(false)

  if (hasFailed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-muted to-primary/30"
      />
    )
  }

  return (
    <img
      src={post.coverImage}
      alt={post.title}
      onError={() => setHasFailed(true)}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/post:scale-105"
    />
  )
}

/** One post in the blog index grid. */
export function BlogPostCard({ post, className }: BlogPostCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className={cn(
        "group/post h-full gap-0 py-0 transition-shadow hover:shadow-lg hover:shadow-foreground/5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => navigate(`/blog/${post.slug}`)}
        aria-label={post.title}
        className="relative block aspect-4/3 w-full cursor-pointer overflow-hidden border-0 bg-muted p-0"
      >
        <CoverImage post={post} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
        />

        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-sm">
          {post.category}
        </Badge>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg leading-snug font-medium">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {post.author.name} ·{" "}
            {format(new Date(post.publishedAt), "MMM d, yyyy")}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {post.excerpt}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-auto self-start"
          onClick={() => navigate(`/blog/${post.slug}`)}
        >
          Read more
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            strokeWidth={2}
            data-icon="inline-end"
          />
        </Button>
      </div>
    </Card>
  )
}
