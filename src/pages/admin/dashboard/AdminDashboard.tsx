import * as React from "react"

import { useAuth } from "@/components/auth-provider"
import {
  getDashboardStats,
  listAllBookings,
  listRecentRegistrations,
  sumCounts,
} from "@/lib/admin-client"
import type { DashboardStats, Registration } from "@/lib/admin-client"
import { formatPrice } from "@/lib/format-price"
import type { Booking } from "@/types/booking"

import { DashboardHeader } from "./sections/dashboard-header"
import { NewRegistrations } from "./sections/new-registrations"
import { RecentBookingsTable } from "./sections/recent-bookings-table"
import { StatCards } from "./sections/stat-cards"
import type { AdminStat } from "./sections/stat-cards"

const RECENT_COUNT = 5

function toStats(stats: DashboardStats): AdminStat[] {
  const users = stats.usersByRole
  const listings = stats.listingsByStatus
  const bookings = stats.bookingsByStatus
  const revenue = Object.entries(stats.revenueByCurrency)

  return [
    {
      label: "Total Users",
      value: String(sumCounts(users)),
      hint: `${users.host ?? 0} hosts · ${stats.pendingHostApplications} applying`,
      icon: "users",
    },
    {
      label: "Total Bookings",
      value: String(sumCounts(bookings)),
      hint: `${bookings.pending ?? 0} awaiting payment`,
      icon: "book",
    },
    {
      label: "Live Properties",
      value: String(listings.approved ?? 0),
      hint: `${listings.pending ?? 0} waiting for review`,
      icon: "home",
    },
    {
      label: "Revenue",
      value:
        revenue.length === 0
          ? formatPrice(0, "USD")
          : revenue
              .map(([currency, total]) => formatPrice(total, currency))
              .join(" · "),
      hint: "From successful payments",
      icon: "wallet",
    },
  ]
}

/**
 * Admin dashboard — composition only, sections live under `./sections`.
 *
 * Headline numbers come from `admin_dashboard_stats()`, the tables from the
 * newest bookings and profiles. All three load together; a failure shows
 * one message instead of a half-filled page.
 */
export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = React.useState<AdminStat[] | null>(null)
  const [bookings, setBookings] = React.useState<Booking[] | null>(null)
  const [registrations, setRegistrations] = React.useState<
    Registration[] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    Promise.all([
      getDashboardStats(),
      listAllBookings(RECENT_COUNT),
      listRecentRegistrations(RECENT_COUNT),
    ])
      .then(([nextStats, nextBookings, nextRegistrations]) => {
        if (cancelled) return
        setStats(toStats(nextStats))
        setBookings(nextBookings)
        setRegistrations(nextRegistrations)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Something went wrong.")
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <DashboardHeader name={user?.name ?? "Admin"} />

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Couldn't load the dashboard: {error}
        </p>
      ) : null}

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={bookings} />
        </div>
        <div>
          <NewRegistrations registrations={registrations} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
