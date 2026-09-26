import * as React from "react"
import { CircleAlert, Plus } from "lucide-react"

import { ListingFormModal } from "@/components/listing-form-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  archiveListing,
  deleteListing,
  listAllListings,
} from "@/lib/admin-client"
import type { HostListing, HostListingStatus } from "@/types/host-listing"

import { PropertyCard } from "./property-card"

const STATUS_FILTERS: { value: HostListingStatus | "all"; label: string }[] = [
  { value: "all", label: "All listings" },
  { value: "approved", label: "Live" },
  { value: "pending", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Draft" },
]

type PendingAction = { kind: "archive" | "delete"; listing: HostListing }

const ACTION_COPY = {
  archive: {
    title: "Archive this listing?",
    body: "It comes off the site straight away. Only its host can resubmit it for review.",
    confirm: "Archive",
  },
  delete: {
    title: "Delete this listing?",
    body: "It's removed permanently. Listings that have bookings can't be deleted — archive those instead.",
    confirm: "Delete",
  },
}

/**
 * Admin "Property Management" — every listing in every status, filterable,
 * with archive and delete. New listings added here belong to the admin and
 * go through the same review queue as a host's (`/admin/approvals`).
 */
export function PropertyManagement() {
  const [listings, setListings] = React.useState<HostListing[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState<HostListingStatus | "all">("all")
  const [pending, setPending] = React.useState<PendingAction | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [isWorking, setIsWorking] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)

  const load = React.useCallback(() => {
    return listAllListings()
      .then(setListings)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Something went wrong.")
      )
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const visible = (listings ?? []).filter(
    (listing) => filter === "all" || listing.status === filter
  )

  const openAction = (action: PendingAction) => {
    setActionError(null)
    setPending(action)
  }

  const handleConfirm = async () => {
    if (!pending) return
    setIsWorking(true)
    setActionError(null)
    try {
      if (pending.kind === "archive") await archiveListing(pending.listing.id)
      else await deleteListing(pending.listing.id)
      setPending(null)
      await load()
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong."
      )
    } finally {
      setIsWorking(false)
    }
  }

  const copy = pending ? ACTION_COPY[pending.kind] : null

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-medium text-foreground">
            Property Management
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Every homestay on JumRok, in every status. Review new ones from
            Approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filter}
            onValueChange={(value) => {
              if (value) setFilter(value as HostListingStatus | "all")
            }}
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue>
                {(value: string) =>
                  STATUS_FILTERS.find((option) => option.value === value)?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => setIsAdding(true)}>
            <Plus data-icon="inline-start" />
            Add property
          </Button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Couldn't load the properties: {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings === null && !error
          ? Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-2xl bg-[#AEBBA8]/25"
              />
            ))
          : visible.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                onArchive={(target) =>
                  openAction({ kind: "archive", listing: target })
                }
                onDelete={(target) =>
                  openAction({ kind: "delete", listing: target })
                }
              />
            ))}
      </div>

      {listings !== null && visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No properties in this view.
        </p>
      ) : null}

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {pending?.listing.name}
              </span>{" "}
              — {copy?.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Keep it</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isWorking}
              onClick={handleConfirm}
            >
              {isWorking ? "Working…" : copy?.confirm}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ListingFormModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        listing={null}
        onSaved={() => {
          load()
        }}
      />
    </div>
  )
}

export default PropertyManagement
