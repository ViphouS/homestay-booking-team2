import { Calendar } from "lucide-react"

/**
 * Dashboard greeting header: a bilingual welcome on the left, today's date
 * chip on the right (matching the design's "Today, Jan 24, 2026" pill).
 */
export function DashboardHeader({ name }: { name: string }) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          សួស្តី, {name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's the latest performance of your Cambodian homestay platform.
        </p>
      </div>

      <span className="inline-flex items-center gap-2 self-start rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground ring-1 ring-foreground/10">
        <Calendar className="size-4 text-muted-foreground" />
        Today, {today}
      </span>
    </div>
  )
}
