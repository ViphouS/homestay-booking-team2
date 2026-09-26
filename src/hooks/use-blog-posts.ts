import * as React from "react"

import { toBlogPost } from "@/lib/mappers"
import { supabase } from "@/lib/supabase"
import type { BlogPost } from "@/types/blog-post"

export type UseBlogPostsResult = {
  /** `null` while the first request is in flight — render skeletons on `null`. */
  posts: BlogPost[] | null
  /** True once the fetch failed; `posts` is then an empty array. */
  hasError: boolean
}

/** Same show-cached-then-refresh approach as `useListings`. */
let cachedPosts: BlogPost[] | null = null

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  // Authors and admins can also read unpublished posts, hence the filter.
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "approved")
    .order("published_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(toBlogPost)
}

/** The published blog: every approved row of the `blog_posts` table. */
export function useBlogPosts(): UseBlogPostsResult {
  const [posts, setPosts] = React.useState<BlogPost[] | null>(cachedPosts)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false

    fetchPublishedPosts()
      .then((data) => {
        cachedPosts = data
        if (!cancelled) setPosts(data)
      })
      .catch(() => {
        if (cancelled || cachedPosts !== null) return
        setPosts([])
        setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { posts, hasError }
}
