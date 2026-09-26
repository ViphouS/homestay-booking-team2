import * as React from "react"
import { CircleAlert } from "lucide-react"

import { ReasonDialog } from "@/components/reason-dialog"
import type { ReasonDialogCopy } from "@/components/reason-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  listAllListings,
  listPendingHostApplications,
  reviewHostApplication,
  reviewListing,
} from "@/lib/admin-client"
import type { PendingHostApplication } from "@/lib/admin-client"
import { formatDay } from "@/lib/format-date"
import { formatPrice } from "@/lib/format-price"
import type { HostListing } from "@/types/host-listing"

/** What the reject dialog is currently rejecting. */
type Rejecting =
  | { kind: "application"; application: PendingHostApplication }
  | { kind: "listing"; listing: HostListing }

function rejectCopy(target: Rejecting): ReasonDialogCopy {
  if (target.kind === "application") {
    return {
      title: "Reject this host application?",
      description: `${target.application.name} will see your note and can apply again.`,
      label: "Note for the applicant",
      placeholder: "e.g. Please tell us more about where guests would stay.",
      confirmLabel: "Reject application",
      cancelLabel: "Back",
    }
  }
  return {
    title: "Reject this listing?",
    description: `${target.listing.name} stays hidden. The host sees your reason and can edit and resubmit it.`,
    label: "Reason for the host",
    placeholder: "e.g. Please add a real photo of the room guests will stay in.",
    confirmLabel: "Reject listing",
    cancelLabel: "Back",
  }
}

function ReviewActions({
  isWorking,
  onApprove,
  onReject,
}: {
  isWorking: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <Button type="button" size="sm" disabled={isWorking} onClick={onApprove}>
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isWorking}
        onClick={onReject}
      >
        Reject
      </Button>
    </div>
  )
}

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string
  count: number | null
  empty: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
        {count !== null ? (
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({count})
          </span>
        ) : null}
      </h2>
      {count === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : count === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-col gap-3.5">{children}</div>
      )}
    </section>
  )
}

/**
 * Admin "Approvals" — the two review queues that gate who can host and what
 * goes live: pending host applications and pending listings.
 *
 * Approving an application turns that account into a host (they get the
 * "My Listings" tab); approving a listing publishes it to Explore.
 * Rejecting either requires a note, which the other person sees.
 */
export function AdminApprovals() {
  const [applications, setApplications] = React.useState<
    PendingHostApplication[] | null
  >(null)
  const [listings, setListings] = React.useState<HostListing[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [workingId, setWorkingId] = React.useState<string | null>(null)
  const [rejecting, setRejecting] = React.useState<Rejecting | null>(null)

  const load = React.useCallback(() => {
    return Promise.all([listPendingHostApplications(), listAllListings()])
      .then(([nextApplications, allListings]) => {
        setApplications(nextApplications)
        setListings(allListings.filter((listing) => listing.status === "pending"))
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Something went wrong.")
      )
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const approve = async (id: string, action: () => Promise<void>) => {
    setError(null)
    setWorkingId(id)
    try {
      await action()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setWorkingId(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejecting) return
    if (rejecting.kind === "application") {
      await reviewHostApplication(rejecting.application.id, false, reason)
    } else {
      await reviewListing(rejecting.listing.id, false, reason)
    }
    setRejecting(null)
    await load()
  }

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium text-foreground">
          Approvals
        </h1>
        <p className="text-sm text-muted-foreground">
          New hosts and new or edited listings wait here until you review them.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Section
        title="Host applications"
        count={applications?.length ?? null}
        empty="No one is waiting to become a host."
      >
        {applications?.map((application) => (
          <Card key={application.id} size="sm">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="font-heading text-base text-primary">
                  {application.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {application.email} · applied{" "}
                  {formatDay(application.createdAt)}
                </div>
                <p className="mt-2 text-sm whitespace-pre-line text-foreground">
                  {application.message || (
                    <span className="text-muted-foreground italic">
                      No message.
                    </span>
                  )}
                </p>
              </div>
              <ReviewActions
                isWorking={workingId === application.id}
                onApprove={() =>
                  approve(application.id, () =>
                    reviewHostApplication(application.id, true)
                  )
                }
                onReject={() => setRejecting({ kind: "application", application })}
              />
            </CardContent>
          </Card>
        ))}
      </Section>

      <Section
        title="Listings"
        count={listings?.length ?? null}
        empty="No listings are waiting for review."
      >
        {listings?.map((listing) => (
          <Card key={listing.id} size="sm">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {listing.thumbnailUrl ? (
                <img
                  src={listing.thumbnailUrl}
                  alt={listing.name}
                  className="size-24 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="size-24 shrink-0 rounded-xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-heading text-base text-primary">
                  {listing.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {listing.area}, {listing.region} · {listing.category} · by{" "}
                  {listing.hostName || "unknown host"}
                </div>
                <div className="mt-1 text-sm text-foreground">
                  {formatPrice(listing.pricePerNight, listing.currency)} / night
                  · up to {listing.maxGuests} guests · {listing.beds} bed
                  {listing.beds === 1 ? "" : "s"} · {listing.roomType}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {listing.description}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Submitted{" "}
                  {formatDay(listing.submittedAt ?? listing.createdAt)}
                </div>
              </div>
              <ReviewActions
                isWorking={workingId === listing.id}
                onApprove={() =>
                  approve(listing.id, () => reviewListing(listing.id, true))
                }
                onReject={() => setRejecting({ kind: "listing", listing })}
              />
            </CardContent>
          </Card>
        ))}
      </Section>

      <ReasonDialog
        copy={rejecting ? rejectCopy(rejecting) : null}
        onOpenChange={(open) => {
          if (!open) setRejecting(null)
        }}
        onConfirm={handleReject}
      />
    </div>
  )
}

export default AdminApprovals
