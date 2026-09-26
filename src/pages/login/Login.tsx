import * as React from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

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

const LINK_CLASS = "text-primary underline-offset-4 hover:underline"

type LoginProps = {
  /** Host log-in (`/host/login`): host copy, host-only accounts, lands on My Listings. */
  asHost?: boolean
}

/**
 * Sign-in form, shared by the guest (`/login`) and host (`/host/login`) routes.
 *
 * Plain controlled state, no form library — matches the rest of the repo
 * (see `hero/location-input.tsx`). On success, redirects to `/profile`
 * (hosts land on its "My Listings" tab).
 */
export function Login({ asHost = false }: LoginProps) {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await signIn({ email, password, asHost })
      navigate(asHost ? "/profile?tab=listings" : "/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {asHost ? "Host log in" : "Log in"}
          </CardTitle>
          <CardDescription>
            {asHost
              ? "Manage your homestay listings."
              : "Welcome back to JumRok."}
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
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
            {asHost ? (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  New to hosting?{" "}
                  <Link to="/host/signup" className={LINK_CLASS}>
                    Sign up as host
                  </Link>
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Not a host?{" "}
                  <Link to="/login" className={LINK_CLASS}>
                    Log in as guest
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className={LINK_CLASS}>
                    Sign up
                  </Link>
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Are you a host?{" "}
                  <Link to="/host/login" className={LINK_CLASS}>
                    Log in as host
                  </Link>
                </p>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login
