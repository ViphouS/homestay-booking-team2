import * as React from "react"
import type { FormEvent } from "react"
import { format } from "date-fns"
import { cn } from "cn"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormState = {
  name: string
  phone: string
  dateOfBirth: string
  idNumber: string
  address: string
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string
  value: string | undefined
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          value ? "text-foreground" : "text-muted-foreground italic"
        )}
      >
        {value || "Not added"}
      </span>
    </div>
  )
}

/**
 * "Personal Details" tab content.
 *
 * View/edit the full account profile — name, contact, travel-document and
 * billing-address fields (used elsewhere for real bookings later). Email is
 * read-only since the mock auth client has no email-change flow.
 */
export function ProfileDetails() {
  const { user, updateProfile } = useAuth()

  const [isEditing, setIsEditing] = React.useState(false)
  const [form, setForm] = React.useState<FormState>({
    name: "",
    phone: "",
    dateOfBirth: "",
    idNumber: "",
    address: "",
  })
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  if (!user) return null

  const startEditing = () => {
    setForm({
      name: user.name,
      phone: user.phone ?? "",
      dateOfBirth: user.dateOfBirth ?? "",
      idNumber: user.idNumber ?? "",
      address: user.address ?? "",
    })
    setIsEditing(true)
  }

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      await updateProfile(form)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          <DetailField label="Name" value={user.name} />
          <DetailField label="Email" value={user.email} />
          <DetailField label="Phone number" value={user.phone} />
          <DetailField
            label="Date of birth"
            value={
              user.dateOfBirth
                ? format(new Date(user.dateOfBirth), "dd MMM yyyy")
                : undefined
            }
          />
          <DetailField label="Passport / ID number" value={user.idNumber} />
          <DetailField
            label="Billing address"
            value={user.address}
            className="sm:col-span-2"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={startEditing}
        >
          Edit details
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} disabled />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-phone">Phone number</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="+855 12 345 678"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-dob">Date of birth</Label>
          <Input
            id="profile-dob"
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => updateField("dateOfBirth", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-id">Passport / ID number</Label>
          <Input
            id="profile-id"
            value={form.idNumber}
            onChange={(event) => updateField("idNumber", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="profile-address">Billing address</Label>
          <Input
            id="profile-address"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            placeholder="Street, city, country"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ProfileDetails
