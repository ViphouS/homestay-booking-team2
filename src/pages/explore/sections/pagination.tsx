import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

export type PaginationProps = {
  /** 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Builds the page list, collapsing long runs to an ellipsis:
 * `1 … 4 5 6 … 12`. Always shows the first and last page so the ends of the
 * result set stay one click away.
 */
function buildPageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const items: (number | "gap")[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) items.push("gap")
  for (let current = start; current <= end; current += 1) items.push(current)
  if (end < pageCount - 1) items.push("gap")

  items.push(pageCount)
  return items
}

/** Page navigation for the results grid. Renders nothing for a single page. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null

  const items = buildPageItems(page, pageCount)

  return (
    <nav
      aria-label="Results pages"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
      </Button>

      {items.map((item, index) =>
        item === "gap" ? (
          <span
            // Gaps have no stable identity; there are at most two of them.
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            size="icon-sm"
            variant={item === page ? "default" : "outline"}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className="tabular-nums"
          >
            {item}
          </Button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
      </Button>
    </nav>
  )
}
