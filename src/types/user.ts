/** Mirrors the schema's `user_role` enum. */
export type UserRole = "user" | "host" | "admin"

/**
 * The signed-in account: the public `profiles` row joined with the owner-only
 * `profile_private` row (see `auth-client.ts`).
 */
export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  /** ISO timestamp. */
  createdAt?: string
  phone?: string
  /** ISO date (yyyy-MM-dd). */
  dateOfBirth?: string
  /** Passport or national ID card number. */
  idNumber?: string
  /** Billing address for payments. */
  address?: string
  /** Suspended accounts can sign in and read, but not book or list. */
  isSuspended: boolean
}

/** Mirrors the schema's `application_status` enum. */
export type HostApplicationStatus = "pending" | "approved" | "rejected"

/** A user's request to become a host, reviewed by an admin. */
export type HostApplication = {
  id: string
  status: HostApplicationStatus
  message: string
  /** An admin's note — the reason, when rejected. */
  reviewNote?: string
  createdAt: string
}
