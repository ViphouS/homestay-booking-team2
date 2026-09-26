import type { User } from "@/types/user"

/**
 * Mock auth "backend" — a stand-in for Supabase Auth until that's wired up.
 *
 * Every function here is async and returns/throws the same shapes a real
 * Supabase Auth call would, so swapping this file's internals for real
 * `supabase.auth.*` calls later doesn't require touching any caller.
 * Data lives in `localStorage`, including the password, which is fine for a
 * throwaway mock but must never be done once this talks to a real backend.
 */

type StoredUser = User & { password: string }

const USERS_KEY = "jumrok-mock-users"
const SESSION_KEY = "jumrok-mock-session"
const MOCK_DELAY_MS = 400

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    idNumber: user.idNumber,
    address: user.address,
    role: user.role,
    hostSince: user.hostSince,
  }
}

export type SignUpInput = {
  name: string
  email: string
  password: string
  /** Create the account as a host straight away (the "Become a host" sign-up). */
  asHost?: boolean
}

export async function signUp({
  name,
  email,
  password,
  asHost,
}: SignUpInput): Promise<User> {
  await delay()

  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists.")
  }

  const now = new Date().toISOString()
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    password,
    createdAt: now,
    role: asHost ? "host" : "guest",
    hostSince: asHost ? now : undefined,
  }

  writeUsers([...users, newUser])
  localStorage.setItem(SESSION_KEY, newUser.id)

  return toPublicUser(newUser)
}

export type SignInInput = {
  email: string
  password: string
  /** Host log-in: rejects accounts that haven't become hosts yet. */
  asHost?: boolean
}

export async function signIn({
  email,
  password,
  asHost,
}: SignInInput): Promise<User> {
  await delay()

  const normalizedEmail = email.trim().toLowerCase()
  const user = readUsers().find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  )

  if (!user || user.password !== password) {
    throw new Error("Incorrect email or password.")
  }

  if (asHost && user.role !== "host") {
    throw new Error("This account isn't a host yet.")
  }

  localStorage.setItem(SESSION_KEY, user.id)

  return toPublicUser(user)
}

export async function signOut(): Promise<void> {
  await delay()
  localStorage.removeItem(SESSION_KEY)
}

export async function getSession(): Promise<User | null> {
  const sessionUserId = localStorage.getItem(SESSION_KEY)
  if (!sessionUserId) return null

  const user = readUsers().find((candidate) => candidate.id === sessionUserId)
  return user ? toPublicUser(user) : null
}

export type UpdateProfileInput = Partial<
  Omit<User, "id" | "email" | "createdAt" | "role" | "hostSince">
>

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<User> {
  await delay()

  const users = readUsers()
  const index = users.findIndex((candidate) => candidate.id === userId)
  if (index === -1) {
    throw new Error("User not found.")
  }

  const updatedUser: StoredUser = { ...users[index], ...updates }
  const nextUsers = [...users]
  nextUsers[index] = updatedUser
  writeUsers(nextUsers)

  return toPublicUser(updatedUser)
}

/** Upgrades an existing account to a host in place — same profile, new role. */
export async function becomeHost(userId: string): Promise<User> {
  await delay()

  const users = readUsers()
  const index = users.findIndex((candidate) => candidate.id === userId)
  if (index === -1) {
    throw new Error("User not found.")
  }

  const current = users[index]
  const updatedUser: StoredUser = {
    ...current,
    role: "host",
    hostSince: current.hostSince ?? new Date().toISOString(),
  }
  const nextUsers = [...users]
  nextUsers[index] = updatedUser
  writeUsers(nextUsers)

  return toPublicUser(updatedUser)
}
