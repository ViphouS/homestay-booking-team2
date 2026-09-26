/**
 * Supabase database types, passed to `createClient<Database>` so queries are
 * typed end to end.
 *
 * Mirrors `supabase/schema.sql` by hand for now. Once the project is linked,
 * regenerate this file instead of editing it:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type ListingRow = {
  id: string
  name: string
  tagline: string
  description: string
  images: string[]
  thumbnail_url: string
  region: string
  area: string
  category: string
  tags: string[]
  price_amount: number
  price_currency: string
  price_unit: string
  rating_score: number
  review_count: number
  max_guests: number
  beds: number
  room_type: string
  room_size_value: number
  room_size_unit: string
  facilities: string[]
  experiences: string[]
  host_name: string
  host_avatar_url: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: ListingRow
        Insert: Omit<ListingRow, "created_at"> & { created_at?: string }
        Update: Partial<ListingRow>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
