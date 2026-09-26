import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useListings } from "@/hooks/use-listings"

import { PropertyCard } from "./property-card"

/**
 * Admin "Property Management" page — the admin section's replacement for the
 * guest Profile page.
 *
 * Reads the same static catalogue as the public site via `useListings`, then
 * renders each listing as a host-controllable `PropertyCard`. Active state and
 * deletions are kept in local React state (there's no write API yet); wiring
 * these to a real backend later only touches the handlers here.
 */
export function PropertyManagement() {
  const { listings, hasError } = useListings()

  // Local, session-only overlays on top of the read-only catalogue.
  const [activeMap, setActiveMap] = React.useState<Record<string, boolean>>({})
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(new Set())

  const handleToggleActive = (id: string, active: boolean) => {
    setActiveMap((prev) => ({ ...prev, [id]: active }))
  }

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  const handleEdit = (id: string) => {
    // No edit form yet — placeholder until a listing editor exists.
    console.info(`Edit listing: ${id}`)
  }

  const visible = (listings ?? []).filter(
    (listing) => !deletedIds.has(listing.id)
  )

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-medium text-foreground">
            Property Management
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Publish, edit, or retire the homestays listed on JumRok.
          </p>
        </div>

        <Button type="button">
          <Plus className="size-4" />
          Add property
        </Button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          We couldn't load the properties just now. Please refresh to try again.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-2xl bg-[#AEBBA8]/25"
              />
            ))
          : visible.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                active={activeMap[listing.id] ?? true}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
      </div>

      {listings !== null && visible.length === 0 && !hasError ? (
        <p className="text-center text-sm text-muted-foreground">
          No properties to manage yet.
        </p>
      ) : null}
    </div>
  )
}

export default PropertyManagement
