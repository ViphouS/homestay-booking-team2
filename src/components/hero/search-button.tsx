import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"

export type SearchButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & {
  /** Visible button text. Hidden on the narrowest breakpoint is not desired here — it stays readable. */
  label?: string
}

/**
 * Primary call to action for the search bar.
 *
 * Thin wrapper over the shared `Button` so the icon, sizing and pill shape
 * stay consistent wherever a search action appears.
 */
export function SearchButton({
  label = "Search Homestays",
  className,
  type = "submit",
  ...props
}: SearchButtonProps) {
  return (
    <Button
      type={type}
      size="lg"
      className={cn("h-12 w-full px-6 text-sm lg:w-auto", className)}
      {...props}
    >
      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      {label}
    </Button>
  )
}
