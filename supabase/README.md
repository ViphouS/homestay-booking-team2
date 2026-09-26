# Supabase backend

Everything lives in [`schema.sql`](schema.sql). It is idempotent, so the setup and every later update are the same step.

## Setup

1. Supabase Dashboard → **SQL Editor** → New query → paste all of `schema.sql` → **Run**.
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Sign up in the app, then make yourself the first admin (nobody can do this from the app):

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

4. After changing `schema.sql`, update [`src/types/database.ts`](../src/types/database.ts) to match, or regenerate it (command at the top of that file).

## Roles

| Role    | How you get it                                 | Can                                                                      |
| ------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| `user`  | Signing up                                      | Edit own profile, book stays, save cards, see own bookings and payments  |
| `host`  | Apply, then an admin approves                   | Everything a user can, plus create listings and blog posts               |
| `admin` | Promoted by another admin (or the SQL above)    | Approve/reject listings, posts and host applications; manage users; see everything |

A **suspended** account (`profiles.suspended_at`) can still sign in and read its own data, but can't book, list, post or moderate.

## Flows and the calls behind them

All calls use the shared client: `import { supabase } from "@/lib/supabase"`. RPC errors come back as readable sentences in `error.message`, so the UI can show them directly.

### Profile (every role)

| Step                         | Call                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Sign up                      | `supabase.auth.signUp({ email, password, options: { data: { name } } })`: the profile rows are created automatically |
| Read public profile          | `from("profiles").select("*").eq("id", userId)`                                          |
| Read own private details     | `from("profile_private").select("*").eq("id", userId)`: phone, DOB, ID number, billing address, email |
| Edit name / avatar / bio     | `from("profiles").update({ full_name, avatar_url, bio })`                                |
| Edit private details         | `from("profile_private").update({ phone, date_of_birth, id_number, billing_address })`   |
| Change email                 | `supabase.auth.updateUser({ email })`: synced into `profile_private` by trigger         |
| Upload avatar                | `storage.from("avatars").upload(`${userId}/avatar.png`, file)`                          |
| Apply to become a host       | `from("host_applications").insert({ message })`                                          |

### Host: listings and blog posts

Listings and posts both go through the same states:

```
draft ──submit──▶ pending ──admin approves──▶ approved (public)
                     │                            │
                     └──admin rejects──▶ rejected  └── host edits it ──▶ pending again
any state ──archive──▶ archived ──submit──▶ pending
```

| Step                    | Call                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| Create (as draft)       | `from("listings").insert({ name, region, area, category, price_amount, max_guests, ... })` |
| Edit content            | `from("listings").update({...}).eq("id", id)`                                 |
| Send for review         | `rpc("submit_listing", { p_listing_id })`                                     |
| Take down               | `rpc("archive_listing", { p_listing_id })`                                    |
| Delete a draft/rejected | `from("listings").delete().eq("id", id)`                                      |
| My listings             | `from("listings").select("*").eq("host_id", userId)`                          |
| Bookings on my listings | `from("bookings").select("*, listing:listings(name)")`                        |
| Upload photos           | `storage.from("listing-images").upload(`${userId}/${file.name}`, file)`      |

Blog posts work the same way with `blog_posts`, `submit_blog_post`, `archive_blog_post` and the `blog-images` bucket.

### User: booking and billing

| Step                 | Call                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Book                 | `rpc("create_booking", { p_listing_id, p_check_in, p_check_out, p_adults, p_children, p_infants })` |
| My bookings          | `from("bookings").select("*, listing:listings(name, thumbnail_url)")`                          |
| Cancel               | `rpc("cancel_booking", { p_booking_id, p_reason })`                                            |
| My payments          | `from("payments").select("*")`                                                                 |
| Save a card (masked) | `from("payment_methods").insert({ brand, last4, exp_month, exp_year, cardholder_name })`       |
| Make a card default  | `from("payment_methods").update({ is_default: true }).eq("id", id)`: the others are unset automatically |

`create_booking` works out the price, nights and currency from the listing. The client never sends a total. Overlapping dates on the same listing are rejected by the database itself.

A booking starts as `pending` and becomes `confirmed` when a `succeeded` row lands in `payments`. **The browser can't write payments.** A server holding the secret key has to, typically a Supabase Edge Function receiving the payment provider's webhook. Until that exists, bookings stay `pending`.

### Admin dashboard

| Screen                  | Call                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Headline numbers        | `rpc("admin_dashboard_stats")`: users by role, listings/posts/bookings by status, revenue |
| Review queue            | `from("listings").select("*").eq("status", "pending")` (same for `blog_posts`)          |
| Approve / reject        | `rpc("review_listing", { p_listing_id, p_approve, p_reason })`: a reason is required to reject |
| Improve a listing       | `from("listings").update({...})`: admin edits don't send it back to review           |
| Host applications       | `from("host_applications").select("*, profile:profiles!host_applications_user_id_fkey(full_name)").eq("status", "pending")` |
| Approve a host          | `rpc("review_host_application", { p_application_id, p_approve, p_note })`               |
| All users with emails   | `from("profiles").select("*, profile_private(email, phone)")`                          |
| Change role / suspend   | `rpc("admin_set_user_role", {...})`, `rpc("admin_set_user_suspended", {...})`           |
| Activity feed           | `from("audit_log").select("*").order("created_at", { ascending: false })`              |
| Mark past stays done    | `rpc("complete_past_bookings")` (or schedule it with pg_cron)                          |

## How the data is protected

- **Every table has Row Level Security.** Users only see their own private details, bookings, payments and cards. Hosts also see bookings on their own listings. Admins see everything.
- **Column-level grants** limit what the browser may write. A host can change a listing's description but not its `status`, `rating_score` or `host_id`. A user can't change their own `role`.
- **Status changes and bookings go through RPC functions** that check the caller's role and write to `audit_log`.
- **Payments are server-only**, and saved cards hold masked data only. There is no column that could store a full card number or CVC.
- **Private details** (phone, DOB, ID/passport number, billing address, email) are in `profile_private`, separate from the public profile shown on listings.
