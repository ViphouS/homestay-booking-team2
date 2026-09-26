import type { Session } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import type { HostApplication, User } from "@/types/user"

/**
 * Auth and account data, backed by Supabase Auth plus the `profiles` (public)
 * and `profile_private` (owner-only) tables.
 *
 * One sign-in for every role: the same `/login` works for users, hosts and
 * admins, and the caller routes by `user.role` afterwards. Roles can't be
 * set from the browser — sign-up always creates a `user`, hosts are approved
 * by an admin (see `applyToHost`), and the first admin is promoted in SQL
 * (see `supabase/README.md`).
 */

/** Supabase errors carry a readable `message`; surface it as a normal Error. */
function fail(error: { message: string }): never {
  throw new Error(error.message)
}

/** Builds the app's `User` from the two profile rows of a signed-in account. */
export async function loadUser(userId: string): Promise<User> {
  const [profileResult, privateResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("profile_private").select("*").eq("id", userId).maybeSingle(),
  ])

  if (profileResult.error) fail(profileResult.error)
  if (privateResult.error) fail(privateResult.error)

  const profile = profileResult.data
  const details = privateResult.data

  return {
    id: profile.id,
    name: profile.full_name,
    email: details?.email ?? "",
    role: profile.role,
    avatarUrl: profile.avatar_url ?? undefined,
    createdAt: profile.created_at,
    phone: details?.phone ?? undefined,
    dateOfBirth: details?.date_of_birth ?? undefined,
    idNumber: details?.id_number ?? undefined,
    address: details?.billing_address ?? undefined,
    isSuspended: profile.suspended_at !== null,
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) fail(error)
  return data.session
}

/** Subscribes to sign-in/sign-out (including other tabs). Returns an unsubscribe. */
export function onSessionChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) =>
    callback(session)
  )
  return () => data.subscription.unsubscribe()
}

export type SignUpInput = {
  name: string
  email: string
  password: string
}

export type SignUpResult =
  /** Signed in straight away (email confirmation is off). */
  | { status: "signed-in"; user: User }
  /** Supabase sent a confirmation email; no session until it's clicked. */
  | { status: "confirm-email" }

export async function signUp({
  name,
  email,
  password,
}: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      // Read by the `handle_new_user` trigger to fill `profiles.full_name`.
      data: { name: name.trim() },
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) fail(error)

  if (!data.session || !data.user) return { status: "confirm-email" }
  return { status: "signed-in", user: await loadUser(data.user.id) }
}

export type SignInInput = {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInInput): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) fail(error)
  return loadUser(data.user.id)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) fail(error)
}

export type UpdateProfileInput = {
  name: string
  phone: string
  /** ISO date (yyyy-MM-dd), or "" to clear it. */
  dateOfBirth: string
  idNumber: string
  address: string
}

/** Name lives on the public profile; everything else on the private one. */
export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<User> {
  const orNull = (value: string) => value.trim() || null

  const [profileResult, privateResult] = await Promise.all([
    supabase
      .from("profiles")
      .update({ full_name: updates.name.trim() })
      .eq("id", userId),
    supabase
      .from("profile_private")
      .update({
        phone: orNull(updates.phone),
        date_of_birth: orNull(updates.dateOfBirth),
        id_number: orNull(updates.idNumber),
        billing_address: orNull(updates.address),
      })
      .eq("id", userId),
  ])
  if (profileResult.error) fail(profileResult.error)
  if (privateResult.error) fail(privateResult.error)

  return loadUser(userId)
}

/** The account's most recent host application, if it ever applied. */
export async function getLatestHostApplication(
  userId: string
): Promise<HostApplication | null> {
  const { data, error } = await supabase
    .from("host_applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) fail(error)
  if (!data) return null

  return {
    id: data.id,
    status: data.status,
    message: data.message,
    reviewNote: data.review_note ?? undefined,
    createdAt: data.created_at,
  }
}

/**
 * Asks to become a host. An admin approves it from `/admin/approvals`, which
 * is what actually changes the role — the browser never can.
 */
export async function applyToHost(message: string): Promise<void> {
  const { error } = await supabase
    .from("host_applications")
    .insert({ message: message.trim() })
  if (error) {
    // The unique index allows one pending application per user.
    if (error.code === "23505") {
      throw new Error("You already have an application waiting for review.")
    }
    fail(error)
  }
}
