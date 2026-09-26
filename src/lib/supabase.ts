import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/**
 * The app's single Supabase client.
 *
 * Import `supabase` from here rather than calling `createClient` again, so
 * auth state and realtime subscriptions are shared across the app. Credentials
 * come from `.env` (see `.env.example`); only the publishable key belongs in
 * the browser — never put a secret/service-role key in a `VITE_` variable.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.example to .env and set " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY."
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
