import * as React from "react"
import type { FormEvent } from "react"
import { CircleAlert } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type ReasonDialogCopy = {
  title: string
  description: React.ReactNode
  label: string
  placeholder: string
  confirmLabel: string
  cancelLabel: string
}

/**
 * A destructive action that needs a written reason — cancelling a booking,
 * rejecting a listing or a host application. The reason is shown to the
 * other party, which is why it's required.
 *
 * Opened by passing `copy`; `null` closes it. The copy is captured when it
 * opens (and kept while it animates closed), and the form resets each time.
 */
export function ReasonDialog({
  copy,
  onOpenChange,
  onConfirm,
}: {
  copy: ReasonDialogCopy | null
  onOpenChange: (open: boolean) => void
  /** Rejecting (throwing) keeps the dialog open and shows the error. */
  onConfirm: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset only on the closed → open transition: callers build `copy` inline,
  // so it's a new object on every render and can't be compared by identity.
  const isOpen = copy !== null
  const [wasOpen, setWasOpen] = React.useState(false)
  const [shown, setShown] = React.useState<ReasonDialogCopy | null>(null)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setShown(copy)
      setReason("")
      setError(null)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AlertDialogHeader>
            <AlertDialogTitle>{shown?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {shown?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason-dialog-reason">{shown?.label}</Label>
            <Textarea
              id="reason-dialog-reason"
              required
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={shown?.placeholder}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button">
              {shown?.cancelLabel}
            </AlertDialogCancel>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || reason.trim() === ""}
            >
              {isSubmitting ? "Saving…" : shown?.confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
