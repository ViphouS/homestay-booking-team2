import {
  BOOKING_SELECT,
  toBooking,
  type JoinedBookingRow,
} from "@/lib/bookings-client"
import { toHostListing } from "@/lib/mappers"
import { supabase } from "@/lib/supabase"
import type { Booking, BookingStatus } from "@/types/booking"
import type { HostListing, HostListingStatus } from "@/types/host-listing"
import type { UserRole } from "@/types/user"

/**
 * Everything the admin pages read and do. Admins see every row through RLS
 * (`is_admin()` in each policy); every status change goes through an RPC
 * that re-checks the caller is an admin and writes to the audit log, so
 * these calls simply fail for anyone else.
 */

function fail(error: { message: string }): never {
  throw new Error(error.message)
}

// ---- Dashboard ----------------------------------------------------------------

export type DashboardStats = {
  usersByRole: Partial<Record<UserRole, number>>
  bookingsByStatus: Partial<Record<BookingStatus, number>>
  listingsByStatus: Partial<Record<HostListingStatus, number>>
  pendingHostApplications: number
  /** Successful payments only — empty until a payment server exists. */
  revenueByCurrency: Record<string, number>
}

/** One round trip for the headline numbers (`admin_dashboard_stats()`). */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("admin_dashboard_stats")
  if (error) fail(error)

  const stats = data as {
    users_by_role: DashboardStats["usersByRole"]
    bookings_by_status: DashboardStats["bookingsByStatus"]
    listings_by_status: DashboardStats["listingsByStatus"]
    pending_host_applications: number
    revenue_by_currency: Record<string, number>
  }
  return {
    usersByRole: stats.users_by_role,
    bookingsByStatus: stats.bookings_by_status,
    listingsByStatus: stats.listings_by_status,
    pendingHostApplications: stats.pending_host_applications,
    revenueByCurrency: stats.revenue_by_currency,
  }
}

/** Sums a `{ key: count }` breakdown from the stats RPC. */
export function sumCounts(counts: Partial<Record<string, number>>): number {
  return Object.values(counts).reduce<number>((sum, n) => sum + (n ?? 0), 0)
}

export type Registration = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export async function listRecentRegistrations(
  limit: number
): Promise<Registration[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, profile_private(email)")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) fail(error)

  return data.map((row) => ({
    id: row.id,
    name: row.full_name || "Unnamed",
    email: row.profile_private?.email ?? "",
    role: row.role,
    createdAt: row.created_at,
  }))
}

// ---- Bookings -----------------------------------------------------------------

/** Every booking on the platform, newest first. */
export async function listAllBookings(limit?: number): Promise<Booking[]> {
  let query = supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false })
  if (limit) query = query.limit(limit)

  const { data, error } = await query.overrideTypes<
    JoinedBookingRow[],
    { merge: false }
  >()
  if (error) fail(error)
  return data.map(toBooking)
}

// ---- Listings -----------------------------------------------------------------

/** Every listing in every status, newest first. */
export async function listAllListings(): Promise<HostListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) fail(error)
  return data.map(toHostListing)
}

/** Approve (goes live) or reject a pending listing; rejecting needs a reason. */
export async function reviewListing(
  id: string,
  approve: boolean,
  reason?: string
): Promise<void> {
  const { error } = await supabase.rpc("review_listing", {
    p_listing_id: id,
    p_approve: approve,
    p_reason: reason,
  })
  if (error) fail(error)
}

/** Takes a listing off the site; only its host can resubmit it. */
export async function archiveListing(id: string): Promise<void> {
  const { error } = await supabase.rpc("archive_listing", { p_listing_id: id })
  if (error) fail(error)
}

/** Fails for a listing with bookings (the database keeps those). */
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id)
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "This listing has bookings, so it can't be deleted. Archive it instead."
      )
    }
    fail(error)
  }
}

// ---- Host applications -------------------------------------------------------

export type PendingHostApplication = {
  id: string
  userId: string
  name: string
  email: string
  message: string
  createdAt: string
}

export async function listPendingHostApplications(): Promise<
  PendingHostApplication[]
> {
  const { data, error } = await supabase
    .from("host_applications")
    .select(
      "id, user_id, message, created_at, applicant:profiles!host_applications_user_id_fkey(full_name, profile_private(email))"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
  if (error) fail(error)

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.applicant?.full_name || "Unnamed",
    email: row.applicant?.profile_private?.email ?? "",
    message: row.message,
    createdAt: row.created_at,
  }))
}

/** Approving turns the applicant's account into a host. */
export async function reviewHostApplication(
  id: string,
  approve: boolean,
  note?: string
): Promise<void> {
  const { error } = await supabase.rpc("review_host_application", {
    p_application_id: id,
    p_approve: approve,
    p_note: note,
  })
  if (error) fail(error)
}
