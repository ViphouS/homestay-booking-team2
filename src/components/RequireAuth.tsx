import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/components/auth-provider"

/**
 * Route guard — redirects to `/login` unless a session exists.
 *
 * Renders nothing while the initial session check (from `localStorage`) is
 * still in flight, to avoid a flash of the login redirect for a user who
 * turns out to already be signed in.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />

  return children
}
