import { useAuth } from "@/components/auth-provider"

import {
  ADMIN_NAME,
  ADMIN_STATS,
  NEW_REGISTRATIONS,
  RECENT_BOOKINGS,
} from "./admin-data"
import { DashboardHeader } from "./sections/dashboard-header"
import { NewRegistrations } from "./sections/new-registrations"
import { RecentBookingsTable } from "./sections/recent-bookings-table"
import { StatCards } from "./sections/stat-cards"

/**
 * Admin dashboard — composition only, sections live under `./sections`.
 *
 * Metrics come from the static `admin-data` mock (no analytics API yet). The
 * greeting prefers the signed-in user's name, falling back to the mock admin.
 */
export function AdminDashboard() {
  const { user } = useAuth()
  const name = user?.name ?? ADMIN_NAME

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <DashboardHeader name={name} />

      <StatCards stats={ADMIN_STATS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={RECENT_BOOKINGS} />
        </div>
        <div>
          <NewRegistrations registrations={NEW_REGISTRATIONS} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
