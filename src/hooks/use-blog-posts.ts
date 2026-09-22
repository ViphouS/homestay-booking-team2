import * as React from "react"

import type { BlogPost } from "@/types/blog-post"

/** Where the static catalogue lives until there is a real API. */
const BLOG_POSTS_URL = "/data/blog-posts.json"

export type UseBlogPostsResult = {
  /** `null` while the request is in flight — render skeletons on `null`. */
  posts: BlogPost[] | null
  /** True once the fetch failed; `posts` is then an empty array. */
  hasError: boolean
}

/**
 * Module-level cache. Once the first fetch succeeds, every later call to
 * useBlogPosts() reuses this instead of hitting the network again — that's
 * what stops the "Loading..." flash when navigating between pages that all
 * read the same static catalogue.
 */
let cachedPosts: BlogPost[] | null = null

/**
 * Loads the blog catalogue from `public/data/blog-posts.json`.
 *
 * There is no backend yet, so every data-driven surface reads the same static
 * JSON. Centralising the fetch here keeps that assumption in one place — when
 * an API arrives, only this hook changes.
 */
export function useBlogPosts(): UseBlogPostsResult {
  const [posts, setPosts] = React.useState<BlogPost[] | null>(cachedPosts)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    if (cachedPosts !== null) return // already have it, skip the fetch

    let cancelled = false

    fetch(BLOG_POSTS_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load blog posts: ${response.status}`)
        }
        return response.json() as Promise<BlogPost[]>
      })
      .then((data) => {
        if (cancelled) return
        cachedPosts = data
        setPosts(data)
      })
      .catch(() => {
        if (cancelled) return
        setPosts([])
        setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { posts, hasError }
}
