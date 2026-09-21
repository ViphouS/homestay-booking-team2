import { useState } from "react";
import type { FormEvent } from "react";
import { X, CreditCard, CheckCircle2 } from "lucide-react";

import { formatPrice } from "@/lib/format-price";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stayName: string;
  currency: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export default function BookingModal({
  isOpen,
  onClose,
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
  const [step, setStep] = useState<"payment" | "processing" | "success">("payment");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("processing");
    // Mock payment processing — replace with a real payment provider call later
    setTimeout(() => setStep("success"), 1200);
  };

  const handleClose = () => {
    onClose();
    // Reset for next time the modal opens
    setStep("payment");
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvc("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tertiary">
          <h2 className="font-headline text-lg text-primary">
            {step === "success" ? "Booking Confirmed" : "Confirm & Pay"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {step === "success" ? (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-primary mb-4" />
            <p className="text-sm text-gray-700 mb-1">
              Your stay at <span className="font-medium">{stayName}</span> is booked.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              A confirmation has been sent to your email.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-full py-3 bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Trip summary */}
            <div className="px-6 py-4 border-b border-tertiary text-sm">
              <div className="font-medium text-gray-800 mb-1 line-clamp-1">{stayName}</div>
              <div className="text-gray-500 text-xs">
                {checkIn || "Check-in"} → {checkOut || "Check-out"} · {guests} guest
                {guests > 1 ? "s" : ""}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name on card</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Sokha Chan"
                  className="w-full text-sm border border-tertiary rounded-lg px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Card number</label>
                <div className="relative">
                  <CreditCard
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 1234 1234 1234"
                    className="w-full text-sm border border-tertiary rounded-lg pl-9 pr-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full text-sm border border-tertiary rounded-lg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CVC</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full text-sm border border-tertiary rounded-lg px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-1.5 text-sm text-gray-600 border-t border-tertiary pt-4">
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
                <div className="flex justify-between font-semibold text-primary text-base pt-2">
                  <span>Total due</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={step === "processing"}
                className="w-full rounded-full py-3 bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {step === "processing" ? "Processing…" : `Pay ${formatPrice(total, currency)} and confirm`}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                This is a demo checkout — no real payment is processed.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}