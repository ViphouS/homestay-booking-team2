/**
 * Mock dashboard data for the admin section.
 *
 * There's no analytics/admin API yet, so these figures are static stand-ins —
 * the same "swappable mock" spirit as `auth-client.ts` / `bookings-client.ts`.
 * When a real admin API arrives, only this file changes.
 */

export type AdminStat = {
  label: string
  value: string
  /** e.g. "+12.4%" — rendered with an up-arrow and "this month". */
  change: string
  icon: "users" | "book" | "home" | "wallet"
}

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled"

export type RecentBooking = {
  id: string
  guest: string
  property: string
  dates: string
  status: BookingStatus
  amount: number
}

export type NewRegistration = {
  id: string
  name: string
  email: string
  date: string
}

export const ADMIN_NAME = "Sophea Kem"

export const ADMIN_STATS: AdminStat[] = [
  { label: "Total Users", value: "1,482", change: "+12.4%", icon: "users" },
  { label: "Total Bookings", value: "846", change: "+8.2%", icon: "book" },
  { label: "Active Properties", value: "124", change: "+4.1%", icon: "home" },
  {
    label: "Monthly Revenue",
    value: "$14,350",
    change: "+15.8%",
    icon: "wallet",
  },
]

export const RECENT_BOOKINGS: RecentBooking[] = [
  {
    id: "b1",
    guest: "Phanith Soun",
    property: "Chreav Village Wooden House",
    dates: "Jan 12 – Jan 15",
    status: "Confirmed",
    amount: 54,
  },
  {
    id: "b2",
    guest: "Nary Heng",
    property: "Battambang Riverside Cottage",
    dates: "Jan 14 – Jan 18",
    status: "Confirmed",
    amount: 80,
  },
  {
    id: "b3",
    guest: "Sokha Mean",
    property: "Kampot River Bungalow",
    dates: "Jan 15 – Jan 16",
    status: "Pending",
    amount: 22,
  },
  {
    id: "b4",
    guest: "Julien Mercer",
    property: "Kep Lotus Garden Villa",
    dates: "Jan 18 – Jan 22",
    status: "Confirmed",
    amount: 140,
  },
  {
    id: "b5",
    guest: "Chanthou Prak",
    property: "Chreav Village Wooden House",
    dates: "Jan 20 – Jan 22",
    status: "Cancelled",
    amount: 36,
  },
]

export const NEW_REGISTRATIONS: NewRegistration[] = [
  {
    id: "r1",
    name: "Sok Leakhena",
    email: "leakhena.sok@gmail.com",
    date: "Jan 14, 2026",
  },
  {
    id: "r2",
    name: "Vireak Chea",
    email: "vireak.chea@outlook.com",
    date: "Jan 12, 2026",
  },
  {
    id: "r3",
    name: "Kosal Piseth",
    email: "kosal.piseth@hotmail.com",
    date: "Jan 11, 2026",
  },
  {
    id: "r4",
    name: "Devid Miller",
    email: "david.m@yahoo.com",
    date: "Jan 09, 2026",
  },
  {
    id: "r5",
    name: "Chavy Phou",
    email: "chavy.phou@gmail.com",
    date: "Jan 08, 2026",
  },
]
