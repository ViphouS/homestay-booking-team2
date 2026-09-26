import * as React from "react"
import type { FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { CircleAlert, MailCheck } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Textarea } from "@/components/ui/textarea"
import { formatDay } from "@/lib/format-date"
import { landingPathFor } from "@/lib/landing-path"

const MIN_PASSWORD_LENGTH = 6
const LINK_CLASS = "text-primary underline-offset-4 hover:underline"
const PAGE_CLASS = "mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6"

type SignupProps = {
  /** Host sign-up (`/host/signup`, the navbar's "Become a Host"). */
  asHost?: boolean
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

/** "Tell us about your home" — the message an admin reads when reviewing. */
function HostMessageField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="host-message">Tell us about your home</Label>
      <Textarea
        id="host-message"
        required
        rows={4}
        maxLength={2000}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Where it is, how many guests you can welcome, and what makes a stay with you special."
      />
    </div>
  )
}

/** Shown when Supabase needs the email confirmed before the first sign-in. */
function ConfirmEmailCard({
  email,
  asHost,
}: {
  email: string
  asHost: boolean
}) {
  return (
    <div className={PAGE_CLASS}>
      <Card>
        <CardHeader>
          <MailCheck className="mb-2 size-8 text-primary" />
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Click
            it, then log in
            {asHost ? " and come back to Become a Host to apply." : "."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/login" className={LINK_CLASS}>
            Go to log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Sign-up form, shared by the guest (`/signup`) and host (`/host/signup`)
 * routes.
 *
 * Every account starts as a `user`; becoming a host is an application an
 * admin approves. So the host route signs up *and* applies in one go, and a
 * signed-in user there gets `HostApplicationCard` instead of the form.
 *
 * If the Supabase project requires email confirmation there's no session
 * until the link is clicked, so the page says so instead of redirecting.
 */
export function Signup({ asHost = false }: SignupProps) {
  const { user, isLoading, signUp, applyToHost } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [hostMessage, setHostMessage] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false)
  // Set while this form itself signs someone up, so the signed-in branches
  // below don't take over mid-submit.
  const [isSigningUp, setIsSigningUp] = React.useState(false)

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
    setIsSigningUp(true)
    try {
      const result = await signUp({ name, email, password })
      if (result.status === "confirm-email") {
        setAwaitingConfirmation(true)
        return
      }
      if (asHost) await applyToHost(hostMessage)
      navigate(landingPathFor(result.user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
      setIsSigningUp(false)
    }
  }

  if (awaitingConfirmation) {
    return <ConfirmEmailCard email={email} asHost={asHost} />
  }

  if (asHost && !isSigningUp) {
    // Wait for the session check so a signed-in user never sees the form flash.
    if (isLoading) return null
    // Hosts are already there; admins can't be hosts.
    if (user?.role === "host" || user?.role === "admin") {
      return <Navigate to={landingPathFor(user.role)} replace />
    }
    if (user) return <HostApplicationCard />
  }

  return (
    <div className={PAGE_CLASS}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {asHost ? "Become a host" : "Sign up"}
          </CardTitle>
          <CardDescription>
            {asHost
              ? "List your homestay on JumRok. Create your account and tell us about your home — our team reviews every new host."
              : "Create your JumRok account."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-(--card-spacing)"
        >
          <CardContent className="flex flex-col gap-4">
            {error ? <ErrorAlert message={error} /> : null}
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
            {asHost ? (
              <HostMessageField value={hostMessage} onChange={setHostMessage} />
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting
                ? "Creating account…"
                : asHost
                  ? "Sign up and apply"
                  : "Sign up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className={LINK_CLASS}>
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

/**
 * Becoming a host as an already signed-in user: apply with a short message,
 * or see where the last application stands. Approval (by an admin, at
 * `/admin/approvals`) turns this same account into a host — bookings and
 * details carry over.
 */
function HostApplicationCard() {
  const { user, hostApplication, applyToHost } = useAuth()
  const navigate = useNavigate()

  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (!user) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await applyToHost(message)
      navigate("/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setIsSubmitting(false)
    }
  }

  if (hostApplication?.status === "pending") {
    return (
      <div className={PAGE_CLASS}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Application received</CardTitle>
            <CardDescription>
              You applied on {formatDay(hostApplication.createdAt)}. Our team
              reviews every new host — once you're approved, your profile gets a
              "My Listings" tab where you can add your homestay.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/profile" className={LINK_CLASS}>
              Back to your profile
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className={PAGE_CLASS}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Become a host</CardTitle>
          <CardDescription>
            You're signed in as{" "}
            <span className="font-medium text-foreground">{user.name}</span>.
            Tell us about your home and our team will review your application —
            your bookings and details stay as they are.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-(--card-spacing)"
        >
          <CardContent className="flex flex-col gap-4">
            {hostApplication?.status === "rejected" ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Your last application wasn't approved</AlertTitle>
                <AlertDescription>
                  {hostApplication.reviewNote ?? "No reason was given."} You're
                  welcome to apply again.
                </AlertDescription>
              </Alert>
            ) : null}
            {error ? <ErrorAlert message={error} /> : null}
            <HostMessageField value={message} onChange={setMessage} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending…" : "Apply to host"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Signup
