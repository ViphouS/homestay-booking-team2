import type { ReasonDialogCopy } from "@/components/reason-dialog"

/** The booking-cancel wording, shared by guests, hosts and admins. */
export function cancelBookingCopy(
  details: string,
  reasonFor: "guest" | "host"
): ReasonDialogCopy {
  return {
    title: "Cancel this booking?",
    description: `${details} This can't be undone.`,
    label: `Reason for the ${reasonFor}`,
    placeholder:
      reasonFor === "guest"
        ? "e.g. The house is unavailable for repairs on these dates."
        : "e.g. My travel plans changed.",
    confirmLabel: "Cancel booking",
    cancelLabel: "Keep booking",
  }
}
