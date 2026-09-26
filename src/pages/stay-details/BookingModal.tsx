import { useState } from "react"
import type { FormEvent } from "react"
import { format } from "date-fns"
import { X, CreditCard, CheckCircle2 } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { addBooking } from "@/lib/bookings-client"
import { formatPrice } from "@/lib/format-price"
import { formatGuests } from "@/pages/home/hero"
import type { GuestCounts } from "@/pages/home/hero"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

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
  subtotal: number
  cleaningFee: number
  serviceFee: number
  total: number
}

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
  subtotal,
  cleaningFee,
  serviceFee,
  total,
}: BookingModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<"payment" | "processing" | "success">(
    "payment"
  )
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStep("processing")
    // Mock payment processing — replace with a real payment provider call later
    setTimeout(() => {
      setStep("success")

      // Persisted only when signed in — booking isn't gated behind login, so
      // a guest checkout still "succeeds" in the UI but leaves no record.
      if (user && checkIn && checkOut) {
        addBooking({
          userId: user.id,
          listingId,
          stayName,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          nights,
          total,
          currency,
          guestName: user.name,
          guestEmail: user.email,
          guestPhone: user.phone,
        })
      }
    }, 1200)
  }

  const handleClose = () => {
    onClose()
    // Reset for next time the modal opens
    setStep("payment")
    setCardName("")
    setCardNumber("")
    setExpiry("")
    setCvc("")
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
        className="font-body gap-0 rounded-2xl bg-white p-0 shadow-xl"
      >
        {/* Header */}
        <div className="border-tertiary flex items-center justify-between border-b px-6 py-4">
          <DialogTitle className="font-headline text-lg text-primary">
            {step === "success" ? "Booking Confirmed" : "Confirm & Pay"}
          </DialogTitle>
          <DialogClose
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </DialogClose>
        </div>

        {step === "success" ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <CheckCircle2 size={48} className="mb-4 text-primary" />
            <p className="mb-1 text-sm text-gray-700">
              Your stay at <span className="font-medium">{stayName}</span> is
              booked.
            </p>
            <p className="mb-6 text-xs text-gray-500">
              A confirmation has been sent to your email.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Trip summary */}
            <div className="border-tertiary border-b px-6 py-4 text-sm">
              <div className="mb-1 line-clamp-1 font-medium text-gray-800">
                {stayName}
              </div>
              <div className="text-xs text-gray-500">
                {checkIn ? format(checkIn, "dd MMM yyyy") : "Check-in"} →{" "}
                {checkOut ? format(checkOut, "dd MMM yyyy") : "Check-out"} ·{" "}
                {formatGuests(guests)}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Name on card
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Sokha Chan"
                  className="border-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Card number
                </label>
                <div className="relative">
                  <CreditCard
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 1234 1234 1234"
                    className="border-tertiary w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Expiry
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="border-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="border-tertiary w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-tertiary space-y-1.5 border-t pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>
                    {formatPrice(pricePerNight, currency)} × {nights} nights
                  </span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>{formatPrice(cleaningFee, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>{formatPrice(serviceFee, currency)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-semibold text-primary">
                  <span>Total due</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={step === "processing"}
                className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {step === "processing"
                  ? "Processing…"
                  : `Pay ${formatPrice(total, currency)} and confirm`}
              </button>
              <p className="text-center text-[11px] text-gray-400">
                This is a demo checkout — no real payment is processed.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
