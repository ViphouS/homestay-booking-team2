import type { User, UserRole } from "@/types/user"

/**
 * Mock auth "backend" — a stand-in for Supabase Auth until that's wired up.
 *
 * Every function here is async and returns/throws the same shapes a real
 * Supabase Auth call would, so swapping this file's internals for real
 * `supabase.auth.*` calls later doesn't require touching any caller.
 * Data lives in `localStorage`, including the password, which is fine for a
 * throwaway mock but must never be done once this talks to a real backend.
 *
 * One sign-in for every role: the same `/login` works for users, hosts and
 * admins, and the caller routes by `user.role` afterwards.
 */

type StoredUser = User & { password: string }

const USERS_KEY = "jumrok-mock-users"
const SESSION_KEY = "jumrok-mock-session"
const MOCK_DELAY_MS = 400

/**
 * Demo admin, always present so the admin pages can be reached from any
 * browser — including ones that already hold test accounts. In Supabase the
 * first admin is promoted by hand instead (see `supabase/README.md`).
 */
const DEFAULT_ADMIN: StoredUser = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@jumrok.com",
  password: "admin123",
  role: "admin",
  createdAt: new Date().toISOString(),
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
}

/**
 * Accounts saved before roles existed have none, and early host-flow builds
 * saved `"guest"` — both mean a plain `"user"` now.
 */
function normalizeRole(role: unknown): UserRole {
  return role === "host" || role === "admin" ? role : "user"
}

function readUsers(): StoredUser[] {
  let users: StoredUser[]
  try {
    const raw = localStorage.getItem(USERS_KEY)
    users = raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    users = []
  }

  const normalized = users.map((user) => ({
    ...user,
    role: normalizeRole(user.role),
  }))

  if (!normalized.some((user) => user.email === DEFAULT_ADMIN.email)) {
    normalized.push(DEFAULT_ADMIN)
    writeUsers(normalized)
  }

  return normalized
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    idNumber: user.idNumber,
    address: user.address,
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
    role: asHost ? "host" : "user",
    hostSince: asHost ? now : undefined,
  }

  writeUsers([...users, newUser])
  localStorage.setItem(SESSION_KEY, newUser.id)

  return toPublicUser(newUser)
}

export type SignInInput = {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInInput): Promise<User> {
  await delay()

  const normalizedEmail = email.trim().toLowerCase()
  const user = readUsers().find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  )

  if (!user || user.password !== password) {
    throw new Error("Incorrect email or password.")
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

  const updatedUser: StoredUser = {
    ...users[index],
    ...updates,
  }
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
  if (current.role === "admin") {
    throw new Error("Admin accounts can't become hosts.")
  }

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
