import * as React from "react"
import type { FormEvent } from "react"
import { CheckCircle2, X } from "lucide-react"
import { cn } from "cn"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addHostListing, updateHostListing } from "@/lib/host-listings-client"
import type { HostListing } from "@/types/host-listing"
import { LISTING_CATEGORIES } from "@/types/listing"
import type { ListingCategory } from "@/types/listing"

const CURRENCY = "USD"

/** Native `<select>`/`<textarea>` styled to sit alongside the `Input` primitive. */
const NATIVE_FIELD_CLASS =
  "w-full rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

type FormState = {
  name: string
  tagline: string
  category: ListingCategory
  region: string
  area: string
  pricePerNight: string
  maxGuests: string
  beds: string
  roomType: string
  thumbnailUrl: string
  description: string
}

const EMPTY_FORM: FormState = {
  name: "",
  tagline: "",
  category: LISTING_CATEGORIES[0],
  region: "",
  area: "",
  pricePerNight: "",
  maxGuests: "2",
  beds: "1",
  roomType: "",
  thumbnailUrl: "",
  description: "",
}

function toFormState(listing: HostListing | null): FormState {
  if (!listing) return EMPTY_FORM
  return {
    name: listing.name,
    tagline: listing.tagline,
    category: listing.category,
    region: listing.region,
    area: listing.area,
    pricePerNight: String(listing.pricePerNight),
    maxGuests: String(listing.maxGuests),
    beds: String(listing.beds),
    roomType: listing.roomType,
    thumbnailUrl: listing.thumbnailUrl ?? "",
    description: listing.description,
  }
}

type ListingFormModalProps = {
  isOpen: boolean
  onClose: () => void
  /** The listing being edited; `null` creates a new one. */
  listing: HostListing | null
  /** Called once the listing is stored (as `pending`), before the success step. */
  onSaved: (listing: HostListing) => void
}

/**
 * Pop-up form for a host to create a homestay listing or edit one of theirs.
 *
 * Same chrome as `stay-details/BookingModal.tsx` (custom header, two-step
 * form → confirmation). Stored through the mock `host-listings-client`; both
 * new listings and edits land as `pending` review.
 */
export function ListingFormModal({
  isOpen,
  onClose,
  listing,
  onSaved,
}: ListingFormModalProps) {
  const { user } = useAuth()
  const isEditing = listing !== null

  const [step, setStep] = React.useState<"form" | "submitted">("form")
  const [form, setForm] = React.useState<FormState>(() => toFormState(listing))
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Start fresh — from the listing being edited, or blank — every time the
  // modal opens. Adjusting state during render (rather than in an effect)
  // avoids a frame of the previous listing's values.
  const [wasOpen, setWasOpen] = React.useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setStep("form")
      setForm(toFormState(listing))
      setError(null)
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    setError(null)
    setIsSubmitting(true)

    try {
      const input = {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category,
        region: form.region.trim(),
        area: form.area.trim(),
        pricePerNight: Number(form.pricePerNight),
        currency: CURRENCY,
        maxGuests: Number(form.maxGuests),
        beds: Number(form.beds),
        roomType: form.roomType.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || undefined,
      }
      const saved = listing
        ? await updateHostListing(listing.id, input)
        : await addHostListing({ ...input, hostId: user.id })
      onSaved(saved)
      setStep("submitted")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 rounded-2xl bg-white p-0 shadow-xl",
          step === "form" && "sm:max-w-2xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="font-heading text-lg text-primary">
            {step === "submitted"
              ? isEditing
                ? "Changes submitted"
                : "Listing submitted"
              : isEditing
                ? "Edit listing"
                : "Create a listing"}
          </DialogTitle>
          <DialogClose
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </DialogClose>
        </div>

        {step === "submitted" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <CheckCircle2 size={48} className="mb-4 text-primary" />
            <p className="mb-1 text-sm text-foreground">
              Submitted for review — your listing is{" "}
              <span className="font-semibold">pending</span> until our team
              approves {isEditing ? "the changes" : "it"}.
            </p>
            <p className="mb-6 text-xs text-muted-foreground">
              You can track its status in the "My Listings" tab.
            </p>
            <Button type="button" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="listing-name">Listing name</Label>
                <Input
                  id="listing-name"
                  required
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Preah Village Homestay"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="listing-tagline">Tagline</Label>
                <Input
                  id="listing-tagline"
                  required
                  value={form.tagline}
                  onChange={(event) =>
                    updateField("tagline", event.target.value)
                  }
                  placeholder="Local meals · Village life"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-category">Category</Label>
                <select
                  id="listing-category"
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value as ListingCategory
                    )
                  }
                  className={cn(NATIVE_FIELD_CLASS, "h-9 py-0")}
                >
                  {LISTING_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-room-type">Room type</Label>
                <Input
                  id="listing-room-type"
                  required
                  value={form.roomType}
                  onChange={(event) =>
                    updateField("roomType", event.target.value)
                  }
                  placeholder="Private room"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-region">Province</Label>
                <Input
                  id="listing-region"
                  required
                  value={form.region}
                  onChange={(event) =>
                    updateField("region", event.target.value)
                  }
                  placeholder="Siem Reap"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-area">Area</Label>
                <Input
                  id="listing-area"
                  required
                  value={form.area}
                  onChange={(event) => updateField("area", event.target.value)}
                  placeholder="Kampong Phluk"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="listing-price">Price per night (USD)</Label>
                <Input
                  id="listing-price"
                  type="number"
                  required
                  min={1}
                  inputMode="numeric"
                  value={form.pricePerNight}
                  onChange={(event) =>
                    updateField("pricePerNight", event.target.value)
                  }
                  placeholder="35"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="listing-guests">Max guests</Label>
                  <Input
                    id="listing-guests"
                    type="number"
                    required
                    min={1}
                    value={form.maxGuests}
                    onChange={(event) =>
                      updateField("maxGuests", event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="listing-beds">Beds</Label>
                  <Input
                    id="listing-beds"
                    type="number"
                    required
                    min={1}
                    value={form.beds}
                    onChange={(event) =>
                      updateField("beds", event.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="listing-photo">
                  Cover photo URL (optional)
                </Label>
                <Input
                  id="listing-photo"
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={(event) =>
                    updateField("thumbnailUrl", event.target.value)
                  }
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="listing-description">Description</Label>
                <textarea
                  id="listing-description"
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Tell guests about your home, your family, and what they'll experience."
                  className={cn(NATIVE_FIELD_CLASS, "resize-none rounded-2xl")}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? "Submitting…"
                : isEditing
                  ? "Save and resubmit"
                  : "Submit for review"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              {isEditing
                ? "Edited listings go back to pending review before the changes go live."
                : "New listings are reviewed by our team before they go live."}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ListingFormModal
