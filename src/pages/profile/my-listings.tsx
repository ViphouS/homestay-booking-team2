import * as React from "react"
import { format } from "date-fns"
import { CircleAlert, Pencil, Plus } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { ListingFormModal } from "@/components/listing-form-modal"
import { ListingStatusBadge } from "@/components/listing-status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/format-price"
import { listHostListings } from "@/lib/host-listings-client"
import type { HostListing } from "@/types/host-listing"

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
  const reviewedOrSubmitted =
    listing.reviewedAt && listing.status !== "pending"
      ? `Reviewed ${format(new Date(listing.reviewedAt), "dd MMM yyyy")}`
      : `Submitted ${format(
          new Date(listing.submittedAt ?? listing.createdAt),
          "dd MMM yyyy"
        )}`

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
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
              <span className="font-normal text-muted-foreground">
                {" "}
                / night
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {reviewedOrSubmitted}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ListingStatusBadge status={listing.status} />
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

        {listing.status === "rejected" ? (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Not approved</AlertTitle>
            <AlertDescription>
              {listing.rejectionReason ?? "No reason was given."} Edit the
              listing to address this and resubmit it for review.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * "My Listings" tab content — hosts only (`Profile` hides the tab otherwise).
 *
 * The host's rows of the `listings` table, every status. "Create listing" and
 * each card's "Edit" open `ListingFormModal`; every submission (new or
 * edited) lands as "Pending review" until an admin approves it at
 * `/admin/approvals`.
 */
export function MyListings({
  onCountChange,
}: {
  /** Lets `Profile` keep its stats strip in sync after a new submission. */
  onCountChange?: (count: number) => void
}) {
  const { user } = useAuth()
  const [listings, setListings] = React.useState<HostListing[] | null>(null)
  const [hasError, setHasError] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  // Kept after closing so the modal's content doesn't swap mid close-animation.
  const [editingListing, setEditingListing] =
    React.useState<HostListing | null>(null)

  React.useEffect(() => {
    if (!user) return
    let cancelled = false

    listHostListings(user.id)
      .then((result) => {
        if (!cancelled) setListings(result)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  if (hasError) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load your listings. Please refresh to try again.
      </p>
    )
  }

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
