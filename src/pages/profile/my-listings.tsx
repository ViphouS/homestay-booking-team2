import * as React from "react"
import { Pencil, Plus } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format-price"
import { listHostListings } from "@/lib/host-listings-client"
import type { HostListing, HostListingStatus } from "@/types/host-listing"

import { ListingFormModal } from "./listing-form-modal"

const STATUS_BADGE: Record<
  HostListingStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive"
    className?: string
  }
> = {
  pending: {
    label: "Pending review",
    variant: "secondary",
    className: "bg-[#F4EDE8] text-[#8C5A44]",
  },
  approved: { label: "Live", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
}

function ListingThumbnail({
  url,
  alt,
}: {
  url: string | undefined
  alt: string
}) {
  const [imageFailed, setImageFailed] = React.useState(false)

  if (!url || imageFailed) {
    return (
      <div className="size-[72px] shrink-0 rounded-xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setImageFailed(true)}
      className="size-[72px] shrink-0 rounded-xl object-cover"
    />
  )
}

function HostListingCard({
  listing,
  onEdit,
}: {
  listing: HostListing
  onEdit: () => void
}) {
  const status = STATUS_BADGE[listing.status]

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
      <ListingThumbnail url={listing.thumbnailUrl} alt={listing.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-heading text-base text-primary">
          {listing.name}
        </div>
        <div className="mt-1 truncate text-sm text-muted-foreground">
          {listing.area}, {listing.region} · {listing.category}
        </div>
        <div className="mt-1 text-sm font-semibold text-primary">
          {formatPrice(listing.pricePerNight, listing.currency)}
          <span className="font-normal text-muted-foreground"> / night</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Badge variant={status.variant} className={status.className}>
          {status.label}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          aria-label={`Edit ${listing.name}`}
        >
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
      </div>
    </div>
  )
}

/**
 * "My Listings" tab content — hosts only (`Profile` hides the tab otherwise).
 *
 * Reads from the mock `host-listings-client`. "Create listing" and each
 * card's "Edit" open `ListingFormModal`; every submission (new or edited)
 * lands here as "Pending review" until a backend approval flow exists.
 */
export function MyListings({
  onCountChange,
}: {
  /** Lets `Profile` keep its stats strip in sync after a new submission. */
  onCountChange?: (count: number) => void
}) {
  const { user } = useAuth()
  const [listings, setListings] = React.useState<HostListing[] | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  // Kept after closing so the modal's content doesn't swap mid close-animation.
  const [editingListing, setEditingListing] =
    React.useState<HostListing | null>(null)

  React.useEffect(() => {
    if (!user) return
    let cancelled = false

    listHostListings(user.id).then((result) => {
      if (!cancelled) setListings(result)
    })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const openModal = (listing: HostListing | null) => {
    setEditingListing(listing)
    setIsModalOpen(true)
  }

  const handleSaved = (saved: HostListing) => {
    const current = listings ?? []
    const next = current.some((listing) => listing.id === saved.id)
      ? current.map((listing) => (listing.id === saved.id ? saved : listing))
      : [saved, ...current]
    setListings(next)
    onCountChange?.(next.length)
  }

  const createButton = (variant: "default" | "outline") => (
    <Button
      type="button"
      variant={variant}
      size={variant === "outline" ? "sm" : "default"}
      onClick={() => openModal(null)}
    >
      <Plus data-icon="inline-start" />
      Create listing
    </Button>
  )

  return (
    <>
      {listings === null ? (
        <p className="text-sm text-muted-foreground">Loading your listings…</p>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            No listings yet — share your home with travellers by creating your
            first listing.
          </p>
          {createButton("default")}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-primary">
              Your listings ({listings.length})
            </h3>
            {createButton("outline")}
          </div>
          <div className="flex flex-col gap-3.5">
            {listings.map((listing) => (
              <HostListingCard
                key={listing.id}
                listing={listing}
                onEdit={() => openModal(listing)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rendered once, outside the branches, so the first submission (empty
          → list) doesn't remount it and drop its confirmation step. */}
      <ListingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={editingListing}
        onSaved={handleSaved}
      />
    </>
  )
}

export default MyListings
