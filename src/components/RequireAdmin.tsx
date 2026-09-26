import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/components/auth-provider"

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />

  return children
}
