import * as React from "react"
import { useSearchParams } from "react-router-dom"

import { Pagination } from "@/components/pagination"
import { useBlogPosts } from "@/hooks/use-blog-posts"

import { BlogGrid } from "./sections/blog-grid"

const PAGE_SIZE = 6

/**
 * Blog post index.
 *
 * Composition only — sections live under `./sections`, data comes from
 * `useBlogPosts`. Posts are always sorted newest-first; there's no filter or
 * sort control, so the only page state worth keeping in the URL is `page`.
 */
export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { posts, hasError } = useBlogPosts()

  const sorted = React.useMemo(() => {
    if (posts === null) return null
    return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }, [posts])

  const pageCount = sorted
    ? Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
    : 1
  const currentPage = Math.min(page, pageCount)
  const offset = (currentPage - 1) * PAGE_SIZE

  const visiblePosts = sorted ? sorted.slice(offset, offset + PAGE_SIZE) : null

  const handlePageChange = (nextPage: number) => {
    setSearchParams(
      (params) => {
        if (nextPage <= 1) {
          params.delete("page")
        } else {
          params.set("page", String(nextPage))
        }
        return params
      },
      { replace: true }
    )
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium text-foreground">
          The JumRok Journal
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Stories, tips, and culture from Cambodia's homestay communities.
        </p>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn't load the blog posts just now. Please refresh to try again.
        </p>
      ) : null}

      <BlogGrid posts={visiblePosts} skeletonCount={PAGE_SIZE} />

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default Blog
