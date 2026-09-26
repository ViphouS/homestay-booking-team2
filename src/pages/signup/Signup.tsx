import * as React from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MIN_PASSWORD_LENGTH = 6
const LINK_CLASS = "text-primary underline-offset-4 hover:underline"
const HOST_LANDING = "/profile?tab=listings"

type SignupProps = {
  /** Host sign-up (`/host/signup`, the navbar's "Become a Host"). */
  asHost?: boolean
}

/**
 * Sign-up form, shared by the guest (`/signup`) and host (`/host/signup`)
 * routes.
 *
 * Plain controlled state, no form library — matches the rest of the repo
 * (see `hero/location-input.tsx`). On success, redirects to `/profile`
 * (hosts land on its "My Listings" tab).
 *
 * On the host route a signed-in guest isn't asked to sign up again — they
 * get `BecomeHostCard`, which upgrades the same account in place.
 */
export function Signup({ asHost = false }: SignupProps) {
  const { user, isLoading, signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setIsSubmitting(true)
    try {
      await signUp({ name, email, password, asHost })
      navigate(asHost ? HOST_LANDING : "/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  if (asHost) {
    // Wait for the session check so a signed-in user never sees the form flash.
    if (isLoading) return null
    if (user?.role === "host") return <Navigate to={HOST_LANDING} replace />
    if (user) return <BecomeHostCard />
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {asHost ? "Become a host" : "Sign up"}
          </CardTitle>
          <CardDescription>
            {asHost
              ? "List your homestay on JumRok and welcome travellers into your home."
              : "Create your JumRok account."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-(--card-spacing)"
        >
          <CardContent className="flex flex-col gap-4">
            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Sokha Chan"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-confirm-password">Confirm password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? "Creating account…"
                : asHost
                  ? "Sign up as host"
                  : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {asHost ? "Already a host?" : "Already have an account?"}{" "}
              <Link
                to={asHost ? "/host/login" : "/login"}
                className={LINK_CLASS}
              >
                {asHost ? "Log in as host" : "Log in"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

/**
 * Host upgrade for an already signed-in guest: one confirm, same account —
 * bookings and details carry over, the profile just gains the Host badge
 * and "My Listings" tab.
 */
function BecomeHostCard() {
  const { user, becomeHost } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (!user) return null

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await becomeHost()
      navigate(HOST_LANDING)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Become a host</CardTitle>
          <CardDescription>
            You're signed in as{" "}
            <span className="font-medium text-foreground">{user.name}</span>.
            Turn this account into a host account to start listing your homestay
            — your bookings and details stay as they are.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
            <li>Create listings from your profile's "My Listings" tab</li>
            <li>New listings are reviewed by our team before going live</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            disabled={isSubmitting}
            className="w-full"
            onClick={handleConfirm}
          >
            {isSubmitting ? "Setting up…" : "Become a host"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Signup
