import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { format } from "date-fns"
import { CheckCircle2, CircleAlert, X } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { createBooking } from "@/lib/bookings-client"
import { formatPrice } from "@/lib/format-price"
import { formatGuests } from "@/pages/home/hero"
import type { GuestCounts } from "@/pages/home/hero"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  stayName: string
  currency: string
  pricePerNight: number
  checkIn: Date | undefined
  checkOut: Date | undefined
  guests: GuestCounts
  nights: number
  total: number
}

/**
 * "Request to book" — creates the booking through the `create_booking` RPC,
 * which re-checks the dates and capacity and prices the stay itself.
 *
 * There's no payment step: the booking is created as "awaiting payment" and
 * the host contacts the guest from their Booking Requests tab. Signed-out
 * visitors are asked to log in first (the RPC requires an account).
 */
export default function BookingModal({
  isOpen,
  onClose,
  listingId,
  stayName,
  currency,
  pricePerNight,
  checkIn,
  checkOut,
  guests,
  nights,
  total,
}: BookingModalProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [step, setStep] = useState<"review" | "sending" | "sent">("review")
  const [error, setError] = useState<string | null>(null)

  const handleRequest = async () => {
    if (!checkIn || !checkOut) return
    setError(null)
    setStep("sending")
    try {
      await createBooking({ listingId, checkIn, checkOut, guests })
      setStep("sent")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setStep("review")
    }
  }

  const handleClose = () => {
    onClose()
    // Reset for next time the modal opens
    setStep("review")
    setError(null)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-2xl bg-white p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="font-heading text-lg text-primary">
            {step === "sent" ? "Request sent" : "Request to book"}
          </DialogTitle>
          <DialogClose
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </DialogClose>
        </div>

        {step === "sent" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <CheckCircle2 size={48} className="mb-4 text-primary" />
            <p className="mb-1 text-sm text-foreground">
              Your request for <span className="font-medium">{stayName}</span>{" "}
              has been sent.
            </p>
            <p className="mb-6 text-xs text-muted-foreground">
              The host will contact you to arrange payment. You can follow it
              under My Bookings.
            </p>
            <div className="flex w-full flex-col gap-2">
              <Link
                to="/profile?tab=bookings"
                className={buttonVariants({ className: "w-full" })}
              >
                View my bookings
              </Link>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="text-sm">
              <div className="mb-1 line-clamp-1 font-medium text-foreground">
                {stayName}
              </div>
              <div className="text-xs text-muted-foreground">
                {checkIn ? format(checkIn, "dd MMM yyyy") : "Check-in"} →{" "}
                {checkOut ? format(checkOut, "dd MMM yyyy") : "Check-out"} ·{" "}
                {formatGuests(guests)}
              </div>
            </div>

            <div className="space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>
                  {formatPrice(pricePerNight, currency)} × {nights} nights
                </span>
                <span>{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold text-primary">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {user ? (
              <Button
                type="button"
                className="w-full"
                disabled={step === "sending"}
                onClick={handleRequest}
              >
                {step === "sending" ? "Sending…" : "Request to book"}
              </Button>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className={buttonVariants({ className: "w-full" })}
              >
                Log in to book
              </Link>
            )}
            <p className="text-center text-[11px] text-muted-foreground">
              You won't be charged now — the host will contact you to arrange
              payment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
