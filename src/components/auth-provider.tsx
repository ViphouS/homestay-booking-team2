/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import * as authClient from "@/lib/auth-client"
import type { User } from "@/types/user"

type AuthContextValue = {
  user: User | null
  /** True until the initial session check (from `localStorage`) resolves. */
  isLoading: boolean
  signIn: (input: authClient.SignInInput) => Promise<void>
  signUp: (input: authClient.SignUpInput) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: authClient.UpdateProfileInput) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

/**
 * Session state for the whole app, backed by the mock `auth-client`.
 *
 * Same shape as `ThemeProvider`/`useTheme`: a context plus a hook that
 * throws outside the provider. Swapping the mock client for real Supabase
 * Auth calls later only touches `auth-client.ts` — this provider and every
 * component calling `useAuth()` stay the same.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    authClient.getSession().then((session) => {
      if (cancelled) return
      setUser(session)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const signIn = React.useCallback(async (input: authClient.SignInInput) => {
    const nextUser = await authClient.signIn(input)
    setUser(nextUser)
  }, [])

  const signUp = React.useCallback(async (input: authClient.SignUpInput) => {
    const nextUser = await authClient.signUp(input)
    setUser(nextUser)
  }, [])

  const signOut = React.useCallback(async () => {
    await authClient.signOut()
    setUser(null)
  }, [])

  const updateProfile = React.useCallback(
    async (updates: authClient.UpdateProfileInput) => {
      if (!user) {
        throw new Error("updateProfile called with no signed-in user.")
      }
      const nextUser = await authClient.updateProfile(user.id, updates)
      setUser(nextUser)
    },
    [user]
  )

  const value = React.useMemo(
    () => ({ user, isLoading, signIn, signUp, signOut, updateProfile }),
    [user, isLoading, signIn, signUp, signOut, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
