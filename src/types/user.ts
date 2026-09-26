/** Missing means "guest" — accounts created before hosting existed have no role. */
export type UserRole = "guest" | "host"

export type User = {
  id: string
  name: string
  email: string
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
  role?: UserRole
  /** ISO timestamp of when the account became a host. */
  hostSince?: string
}
