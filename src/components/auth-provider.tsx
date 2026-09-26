/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import * as authClient from "@/lib/auth-client"
import type { HostApplication, User } from "@/types/user"

type AuthContextValue = {
  user: User | null
  /** True until the initial session check resolves. */
  isLoading: boolean
  /**
   * The signed-in user's latest host application — `null` if they never
   * applied (or are signed out). Only meaningful for `role: "user"`.
   */
  hostApplication: HostApplication | null
  /** Resolves with the signed-in user so the caller can route by role. */
  signIn: (input: authClient.SignInInput) => Promise<User>
  signUp: (input: authClient.SignUpInput) => Promise<authClient.SignUpResult>
  signOut: () => Promise<void>
  updateProfile: (updates: authClient.UpdateProfileInput) => Promise<void>
  /** Submits a host application for the signed-in user. */
  applyToHost: (message: string) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

/**
 * Session state for the whole app, backed by Supabase Auth.
 *
 * Same shape as `ThemeProvider`/`useTheme`: a context plus a hook that
 * throws outside the provider. It follows `onAuthStateChange`, so signing in
 * or out in another tab — or a token refresh — updates every `useAuth()`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [hostApplication, setHostApplication] =
    React.useState<HostApplication | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadAccount = React.useCallback(async (userId: string | null) => {
    if (!userId) {
      setUser(null)
      setHostApplication(null)
      return
    }
    const [nextUser, application] = await Promise.all([
      authClient.loadUser(userId),
      authClient.getLatestHostApplication(userId),
    ])
    setUser(nextUser)
    setHostApplication(application)
  }, [])

  React.useEffect(() => {
    let cancelled = false
    let currentUserId: string | null | undefined

    const sync = (userId: string | null) => {
      // Token refreshes re-announce the same user; don't refetch for those.
      if (userId === currentUserId) return
      currentUserId = userId
      loadAccount(userId)
        .catch(() => {
          if (!cancelled) setUser(null)
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }

    authClient
      .getSession()
      .then((session) => sync(session?.user.id ?? null))
      .catch(() => {
        if (!cancelled) setIsLoading(false)
      })

    // Supabase warns against awaiting its own calls inside this callback
    // (it can deadlock), so the profile load is deferred a tick.
    const unsubscribe = authClient.onSessionChange((session) => {
      setTimeout(() => {
        if (!cancelled) sync(session?.user.id ?? null)
      }, 0)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [loadAccount])

  const signIn = React.useCallback(async (input: authClient.SignInInput) => {
    const nextUser = await authClient.signIn(input)
    setUser(nextUser)
    setHostApplication(await authClient.getLatestHostApplication(nextUser.id))
    return nextUser
  }, [])

  const signUp = React.useCallback(async (input: authClient.SignUpInput) => {
    const result = await authClient.signUp(input)
    if (result.status === "signed-in") {
      setUser(result.user)
      setHostApplication(null)
    }
    return result
  }, [])

  const signOut = React.useCallback(async () => {
    await authClient.signOut()
    setUser(null)
    setHostApplication(null)
  }, [])

  const updateProfile = React.useCallback(
    async (updates: authClient.UpdateProfileInput) => {
      if (!user) {
        throw new Error("updateProfile called with no signed-in user.")
      }
      setUser(await authClient.updateProfile(user.id, updates))
    },
    [user]
  )

  // Reads the live session rather than `user` state, so it also works in the
  // same submit handler that just signed the user up (before a re-render).
  const applyToHost = React.useCallback(async (message: string) => {
    const session = await authClient.getSession()
    if (!session) throw new Error("Sign in to apply as a host.")
    await authClient.applyToHost(message)
    setHostApplication(
      await authClient.getLatestHostApplication(session.user.id)
    )
  }, [])

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      hostApplication,
      signIn,
      signUp,
      signOut,
      updateProfile,
      applyToHost,
    }),
    [
      user,
      isLoading,
      hostApplication,
      signIn,
      signUp,
      signOut,
      updateProfile,
      applyToHost,
    ]
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
