/** Mirrors the schema's `user_role` enum. */
export type UserRole = "user" | "host" | "admin"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  /** ISO timestamp. Optional — accounts created before this field existed don't have one. */
  createdAt?: string
  phone?: string
  /** ISO date (yyyy-MM-dd). */
  dateOfBirth?: string
  /** Passport or national ID card number. */
  idNumber?: string
  /** Billing address for payments. */
  address?: string
  /** ISO timestamp of when the account became a host. */
  hostSince?: string
}
