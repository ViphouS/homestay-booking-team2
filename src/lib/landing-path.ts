import type { UserRole } from "@/types/user"

/**
 * Where each role lands after signing in or up — the single place that
 * decides it, so `/login`, `/signup` and `/host/signup` can't drift apart.
 */
export function landingPathFor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin"
    case "host":
      return "/profile?tab=listings"
    case "user":
      return "/profile"
  }
}
