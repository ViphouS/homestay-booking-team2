/**
 * Supabase database types, passed to `createClient<Database>` so queries are
 * typed end to end.
 *
 * Mirrors `supabase/schema.sql` by hand for now. Once the project is linked,
 * regenerate this file instead of editing it:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
 *
 * `Insert`/`Update` list every column, as generated types do, but the
 * database only lets browser clients write the columns granted in
 * `schema.sql` section 6. Status changes and bookings go through the RPCs
 * under `Functions`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "user" | "host" | "admin"
export type ModerationStatus =
  "draft" | "pending" | "approved" | "rejected" | "archived"
export type ApplicationStatus = "pending" | "approved" | "rejected"
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded"

type ProfileRow = {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  bio: string
  suspended_at: string | null
  created_at: string
  updated_at: string
}

type ProfilePrivateRow = {
  id: string
  email: string
  phone: string | null
  /** ISO date (yyyy-MM-dd). */
  date_of_birth: string | null
  id_number: string | null
  billing_address: string | null
  updated_at: string
}

type HostApplicationRow = {
  id: string
  user_id: string
  message: string
  status: ApplicationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
  updated_at: string
}

type ListingRow = {
  id: string
  host_id: string | null
  status: ModerationStatus
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
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

type BlogPostRow = {
  id: string
  author_id: string | null
  status: ModerationStatus
  slug: string
  title: string
  excerpt: string
  cover_image: string
  category: string
  tags: string[]
  content: string[]
  author_name: string
  author_avatar_url: string
  published_at: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

type BookingRow = {
  id: string
  guest_id: string | null
  listing_id: string
  /** ISO date (yyyy-MM-dd). */
  check_in: string
  /** ISO date (yyyy-MM-dd). */
  check_out: string
  adults: number
  children: number
  infants: number
  nights: number
  nightly_price: number
  total_amount: number
  currency: string
  status: BookingStatus
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

type PaymentRow = {
  id: string
  booking_id: string
  user_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  provider_payment_id: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

type PaymentMethodRow = {
  id: string
  user_id: string
  provider: string
  provider_payment_method_id: string | null
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  cardholder_name: string
  is_default: boolean
  created_at: string
  updated_at: string
}

type AuditLogRow = {
  id: number
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string
  details: Json
  created_at: string
}

/** Makes the listed keys optional (they have database defaults). */
type WithDefaults<Row, Keys extends keyof Row> = Omit<Row, Keys> &
  Partial<Pick<Row, Keys>>

type Timestamps = "created_at" | "updated_at"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: WithDefaults<
          ProfileRow,
          | "role"
          | "full_name"
          | "avatar_url"
          | "bio"
          | "suspended_at"
          | Timestamps
        >
        Update: Partial<ProfileRow>
        Relationships: []
      }
      profile_private: {
        Row: ProfilePrivateRow
        Insert: WithDefaults<
          ProfilePrivateRow,
          | "email"
          | "phone"
          | "date_of_birth"
          | "id_number"
          | "billing_address"
          | "updated_at"
        >
        Update: Partial<ProfilePrivateRow>
        Relationships: [
          {
            foreignKeyName: "profile_private_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      host_applications: {
        Row: HostApplicationRow
        Insert: WithDefaults<
          HostApplicationRow,
          | "id"
          | "user_id"
          | "message"
          | "status"
          | "reviewed_by"
          | "reviewed_at"
          | "review_note"
          | Timestamps
        >
        Update: Partial<HostApplicationRow>
        Relationships: [
          {
            foreignKeyName: "host_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: ListingRow
        Insert: WithDefaults<
          ListingRow,
          | "id"
          | "host_id"
          | "status"
          | "tagline"
          | "description"
          | "images"
          | "thumbnail_url"
          | "tags"
          | "price_currency"
          | "price_unit"
          | "rating_score"
          | "review_count"
          | "beds"
          | "room_type"
          | "room_size_value"
          | "room_size_unit"
          | "facilities"
          | "experiences"
          | "host_name"
          | "host_avatar_url"
          | "submitted_at"
          | "reviewed_at"
          | "reviewed_by"
          | "rejection_reason"
          | Timestamps
        >
        Update: Partial<ListingRow>
        Relationships: [
          {
            foreignKeyName: "listings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: BlogPostRow
        Insert: WithDefaults<
          BlogPostRow,
          | "id"
          | "author_id"
          | "status"
          | "excerpt"
          | "cover_image"
          | "tags"
          | "content"
          | "author_name"
          | "author_avatar_url"
          | "published_at"
          | "submitted_at"
          | "reviewed_at"
          | "reviewed_by"
          | "rejection_reason"
          | Timestamps
        >
        Update: Partial<BlogPostRow>
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: BookingRow
        Insert: WithDefaults<
          Omit<BookingRow, "nights">,
          | "id"
          | "guest_id"
          | "adults"
          | "children"
          | "infants"
          | "status"
          | "cancelled_at"
          | "cancelled_by"
          | "cancellation_reason"
          | Timestamps
        >
        Update: Partial<Omit<BookingRow, "nights">>
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: PaymentRow
        Insert: WithDefaults<
          PaymentRow,
          | "id"
          | "user_id"
          | "status"
          | "provider"
          | "provider_payment_id"
          | "failure_reason"
          | Timestamps
        >
        Update: Partial<PaymentRow>
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: PaymentMethodRow
        Insert: WithDefaults<
          PaymentMethodRow,
          | "id"
          | "user_id"
          | "provider"
          | "provider_payment_method_id"
          | "brand"
          | "cardholder_name"
          | "is_default"
          | Timestamps
        >
        Update: Partial<PaymentMethodRow>
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: AuditLogRow
        Insert: WithDefaults<
          Omit<AuditLogRow, "id">,
          "actor_id" | "details" | "created_at"
        >
        Update: Partial<Omit<AuditLogRow, "id">>
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      current_user_role: { Args: never; Returns: UserRole | null }
      is_admin: { Args: never; Returns: boolean }
      is_listing_host: { Args: { p_listing_id: string }; Returns: boolean }
      submit_listing: { Args: { p_listing_id: string }; Returns: ListingRow }
      review_listing: {
        Args: { p_listing_id: string; p_approve: boolean; p_reason?: string }
        Returns: ListingRow
      }
      archive_listing: { Args: { p_listing_id: string }; Returns: ListingRow }
      submit_blog_post: { Args: { p_post_id: string }; Returns: BlogPostRow }
      review_blog_post: {
        Args: { p_post_id: string; p_approve: boolean; p_reason?: string }
        Returns: BlogPostRow
      }
      archive_blog_post: { Args: { p_post_id: string }; Returns: BlogPostRow }
      review_host_application: {
        Args: { p_application_id: string; p_approve: boolean; p_note?: string }
        Returns: HostApplicationRow
      }
      admin_set_user_role: {
        Args: { p_user_id: string; p_role: UserRole }
        Returns: ProfileRow
      }
      admin_set_user_suspended: {
        Args: { p_user_id: string; p_suspended: boolean }
        Returns: ProfileRow
      }
      admin_dashboard_stats: { Args: never; Returns: Json }
      create_booking: {
        Args: {
          p_listing_id: string
          p_check_in: string
          p_check_out: string
          p_adults: number
          p_children?: number
          p_infants?: number
        }
        Returns: BookingRow
      }
      cancel_booking: {
        Args: { p_booking_id: string; p_reason?: string }
        Returns: BookingRow
      }
      complete_past_bookings: { Args: never; Returns: number }
      host_booking_contacts: {
        Args: never
        Returns: {
          booking_id: string
          guest_name: string
          email: string
          phone: string | null
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      moderation_status: ModerationStatus
      application_status: ApplicationStatus
      booking_status: BookingStatus
      payment_status: PaymentStatus
    }
    CompositeTypes: { [_ in never]: never }
  }
}
