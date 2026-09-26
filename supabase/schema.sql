-- JumRok database schema.
--
-- Run in the Supabase Dashboard: SQL Editor > New query > paste > Run.
-- The whole file is idempotent: re-run it after every change, on a fresh
-- project or on one created from an earlier version of this file.
-- Keep src/types/database.ts in step with this file.
--
-- Roles (public.profiles.role):
--   user  - anyone who signs up. Books stays, saves cards, pays.
--   host  - a user an admin has approved. Also lists homestays, writes posts.
--   admin - moderates listings and posts, manages users, sees everything.
--
-- Security model:
--   * Every table has Row Level Security on; policies decide which ROWS a
--     caller can see or touch.
--   * Column-level GRANTs decide which COLUMNS a browser client may write, so
--     a host can edit a listing's description but never its status, rating
--     or owner.
--   * Anything that changes a status or involves money goes through a
--     `security definer` function in section 5 (`supabase.rpc(...)`), which
--     checks the caller's role itself and writes to the audit log.
--   * Payments are never written from the browser, only by a server holding
--     the secret key (e.g. a payment-provider webhook in an Edge Function).
--
-- See supabase/README.md for the flows each role goes through.


-- ============================================================================
-- 1. Extensions and enums
-- ============================================================================

-- Lets the bookings table forbid overlapping stays on the same listing.
create extension if not exists btree_gist with schema extensions;

do $$
begin
  create type public.user_role as enum ('user', 'host', 'admin');
exception when duplicate_object then null;
end $$;

-- Shared by listings and blog posts: hosts write, admins approve.
do $$
begin
  create type public.moderation_status as enum (
    'draft', 'pending', 'approved', 'rejected', 'archived'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum (
    'pending', 'approved', 'rejected'
  );
exception when duplicate_object then null;
end $$;

-- pending   = created, awaiting payment
-- confirmed = paid (set automatically when a payment succeeds)
do $$
begin
  create type public.booking_status as enum (
    'pending', 'confirmed', 'cancelled', 'completed'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'pending', 'succeeded', 'failed', 'refunded'
  );
exception when duplicate_object then null;
end $$;


-- ============================================================================
-- 2. Tables
-- ============================================================================

-- ---- Profiles --------------------------------------------------------------
-- One row per auth user, created automatically on sign-up (section 4).
-- Public: name, avatar, bio and role are shown on listings and blog posts.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.user_role not null default 'user',
  full_name     text not null default '' check (char_length(full_name) <= 120),
  avatar_url    text,
  bio           text not null default '' check (char_length(bio) <= 2000),
  -- Set by an admin. A suspended account can still sign in and see its own
  -- data but cannot book, list, post or moderate.
  suspended_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Private half of a profile: only the owner and admins can read it.
-- Kept in its own table because RLS works per row, not per column.
create table if not exists public.profile_private (
  id               uuid primary key references public.profiles (id) on delete cascade,
  -- Mirrored from auth.users by trigger; change it via supabase.auth.updateUser.
  email            text not null default '',
  phone            text check (char_length(phone) <= 30),
  date_of_birth    date check (date_of_birth > '1900-01-01'),
  -- Passport or national ID number.
  id_number        text check (char_length(id_number) <= 40),
  billing_address  text check (char_length(billing_address) <= 500),
  updated_at       timestamptz not null default now()
);

-- ---- Host applications -----------------------------------------------------
-- How a user becomes a host: apply here, an admin approves with
-- review_host_application(), which promotes the profile's role.
-- A rejected user may apply again; once approved, never again (even if an
-- admin later demotes them). Enforced by the trigger in section 4.
create table if not exists public.host_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
               references public.profiles (id) on delete cascade,
  message      text not null default '' check (char_length(message) <= 2000),
  status       public.application_status not null default 'pending',
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz,
  review_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists host_applications_one_pending_per_user
  on public.host_applications (user_id)
  where status = 'pending';

create unique index if not exists host_applications_one_approval_per_user
  on public.host_applications (user_id)
  where status = 'approved';

-- ---- Listings --------------------------------------------------------------
-- Flattened version of the `Listing` type in src/types/listing.ts (nested
-- objects like price/rating/host become prefixed columns).
create table if not exists public.listings (
  id               text primary key default gen_random_uuid()::text,
  host_id          uuid default auth.uid()
                   references public.profiles (id) on delete set null,
  status           public.moderation_status not null default 'draft',
  name             text not null,
  tagline          text not null default '',
  description      text not null default '',
  images           text[] not null default '{}',
  thumbnail_url    text not null default '',
  region           text not null,
  area             text not null,
  category         text not null check (category in (
                     'Village Homestay',
                     'Riverside Homestay',
                     'Farm Homestay',
                     'Plantation Homestay',
                     'Community Homestay',
                     'Countryside Homestay'
                   )),
  tags             text[] not null default '{}',
  price_amount     numeric not null check (price_amount >= 0),
  price_currency   text not null default 'USD',
  price_unit       text not null default 'night',
  -- Maintained by the platform, never by hosts.
  rating_score     numeric not null default 0,
  review_count     integer not null default 0,
  max_guests       integer not null check (max_guests > 0),
  beds             integer not null default 1,
  room_type        text not null default '',
  room_size_value  numeric not null default 0,
  room_size_unit   text not null default 'm²',
  facilities       text[] not null default '{}',
  experiences      text[] not null default '{}',
  -- Display snapshot of the host, filled from their profile on insert.
  -- Catalogue rows imported before host accounts existed have only these.
  host_name        text not null default '',
  host_avatar_url  text not null default '',
  -- Moderation trail.
  submitted_at     timestamptz,
  reviewed_at      timestamptz,
  reviewed_by      uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Upgrade path for a listings table created by the previous schema.sql.
-- Rows that already existed were public, so they start out 'approved';
-- everything created afterwards starts as a 'draft'.
alter table public.listings
  alter column id set default gen_random_uuid()::text,
  add column if not exists host_id uuid
    references public.profiles (id) on delete set null,
  add column if not exists status public.moderation_status
    not null default 'approved',
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid
    references public.profiles (id) on delete set null,
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.listings
  alter column host_id set default auth.uid(),
  alter column status set default 'draft';

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_host_id_idx on public.listings (host_id);

-- ---- Blog posts ------------------------------------------------------------
-- Mirrors the `BlogPost` type in src/types/blog-post.ts.
create table if not exists public.blog_posts (
  id                text primary key default gen_random_uuid()::text,
  author_id         uuid default auth.uid()
                    references public.profiles (id) on delete set null,
  status            public.moderation_status not null default 'draft',
  slug              text not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (char_length(title) between 1 and 200),
  excerpt           text not null default '' check (char_length(excerpt) <= 500),
  cover_image       text not null default '',
  category          text not null check (category in (
                      'Travel Tips',
                      'Culture',
                      'Food',
                      'Destinations'
                    )),
  tags              text[] not null default '{}',
  -- Paragraphs, rendered in order.
  content           text[] not null default '{}',
  -- Display snapshot of the author, filled from their profile on insert.
  author_name       text not null default '',
  author_avatar_url text not null default '',
  -- Set the first time an admin approves the post.
  published_at      timestamptz,
  submitted_at      timestamptz,
  reviewed_at       timestamptz,
  reviewed_by       uuid references public.profiles (id) on delete set null,
  rejection_reason  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_author_id_idx
  on public.blog_posts (author_id);

-- ---- Bookings --------------------------------------------------------------
-- Created only through create_booking(), which prices the stay server-side
-- so a client can never choose its own total.
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  -- Nullable so deleting an account keeps the financial record.
  guest_id             uuid references public.profiles (id) on delete set null,
  listing_id           text not null
                       references public.listings (id) on delete restrict,
  check_in             date not null,
  check_out            date not null,
  adults               smallint not null default 1,
  children             smallint not null default 0,
  infants              smallint not null default 0,
  nights               integer generated always as (check_out - check_in) stored,
  nightly_price        numeric(10, 2) not null check (nightly_price >= 0),
  total_amount         numeric(10, 2) not null check (total_amount >= 0),
  currency             text not null,
  status               public.booking_status not null default 'pending',
  cancelled_at         timestamptz,
  cancelled_by         uuid references public.profiles (id) on delete set null,
  cancellation_reason  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint bookings_dates_check check (check_out > check_in),
  constraint bookings_guests_check
    check (adults >= 1 and children >= 0 and infants >= 0),
  -- A listing is one bookable unit: no two live bookings may overlap.
  -- '[)' means check-out day is free for the next guest's check-in.
  constraint bookings_no_overlap exclude using gist (
    listing_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index if not exists bookings_guest_id_idx on public.bookings (guest_id);
create index if not exists bookings_listing_id_idx on public.bookings (listing_id);

-- ---- Payments --------------------------------------------------------------
-- Written ONLY by the server (service-role key). Browser clients can read
-- their own rows and nothing else.
create table if not exists public.payments (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid not null
                       references public.bookings (id) on delete restrict,
  user_id              uuid references public.profiles (id) on delete set null,
  amount               numeric(10, 2) not null check (amount >= 0),
  currency             text not null,
  status               public.payment_status not null default 'pending',
  -- e.g. 'stripe', 'aba_payway'. The provider's own id for the charge.
  provider             text not null default 'manual',
  provider_payment_id  text unique,
  failure_reason       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on public.payments (booking_id);
create index if not exists payments_user_id_idx on public.payments (user_id);

-- ---- Saved payment methods -------------------------------------------------
-- Masked card details only. There is deliberately no column that could hold
-- a full card number or CVC; the real card lives with the payment provider,
-- referenced by provider_payment_method_id (set server-side).
create table if not exists public.payment_methods (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null default auth.uid()
                              references public.profiles (id) on delete cascade,
  provider                    text not null default 'manual',
  provider_payment_method_id  text unique,
  brand                       text not null default 'Card'
                              check (char_length(brand) <= 20),
  last4                       text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month                   smallint not null check (exp_month between 1 and 12),
  exp_year                    smallint not null check (exp_year between 2000 and 2100),
  cardholder_name             text not null default ''
                              check (char_length(cardholder_name) <= 120),
  is_default                  boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists payment_methods_user_id_idx
  on public.payment_methods (user_id);
create unique index if not exists payment_methods_one_default_per_user
  on public.payment_methods (user_id)
  where is_default;

-- ---- Audit log -------------------------------------------------------------
-- Every moderation and admin action, for the admin dashboard's activity feed.
-- Written only by the functions in section 5.
create table if not exists public.audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid references public.profiles (id) on delete set null,
  action       text not null,
  entity_type  text not null,
  entity_id    text not null,
  details      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);


-- ============================================================================
-- 3. Helper functions (used by policies and RPCs)
-- ============================================================================
-- `security definer` so they can read profiles without tripping that table's
-- own RLS (which would otherwise recurse).

-- The caller's role, or null if signed out or suspended.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
    and suspended_at is null
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_listing_host(p_listing_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.listings
    where id = p_listing_id
      and host_id = (select auth.uid())
  )
$$;

-- Internal: not callable from the browser (see grants in section 6).
create or replace function public.log_action(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_details jsonb default '{}'
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values ((select auth.uid()), p_action, p_entity_type, p_entity_id, p_details)
$$;


-- ============================================================================
-- 4. Triggers
-- ============================================================================

-- ---- Sign-up creates the profile -------------------------------------------
-- Pass the display name at sign-up:
--   supabase.auth.signUp({ email, password, options: { data: { name } } })
-- The role is ALWAYS 'user' here; metadata can't be trusted to set it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ), 120),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.profile_private (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;

  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profile_private
  set email = coalesce(new.email, '')
  where id = new.id;
  return new;
end
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_user_email();

-- ---- updated_at ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'profile_private', 'host_applications', 'listings',
    'blog_posts', 'bookings', 'payments', 'payment_methods'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- ---- Listings and blog posts: author snapshot + re-review on edit ----------
-- When a host (not an admin, not the server) edits content that is already
-- live, it goes back to 'pending' so an admin sees the change before the
-- public does.
create or replace function public.listings_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.host_id is not null then
    select p.full_name, coalesce(p.avatar_url, '')
    into new.host_name, new.host_avatar_url
    from public.profiles p
    where p.id = new.host_id;
  end if;

  if tg_op = 'UPDATE'
     and (select auth.uid()) is not null
     and not public.is_admin()
     and old.status = 'approved'
     and new.status = 'approved' then
    new.status := 'pending';
    new.submitted_at := now();
  end if;

  return new;
end
$$;

drop trigger if exists listings_before_write on public.listings;
create trigger listings_before_write
  before insert or update on public.listings
  for each row execute function public.listings_before_write();

create or replace function public.blog_posts_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.author_id is not null then
    select p.full_name, coalesce(p.avatar_url, '')
    into new.author_name, new.author_avatar_url
    from public.profiles p
    where p.id = new.author_id;
  end if;

  if tg_op = 'UPDATE'
     and (select auth.uid()) is not null
     and not public.is_admin()
     and old.status = 'approved'
     and new.status = 'approved' then
    new.status := 'pending';
    new.submitted_at := now();
  end if;

  return new;
end
$$;

drop trigger if exists blog_posts_before_write on public.blog_posts;
create trigger blog_posts_before_write
  before insert or update on public.blog_posts
  for each row execute function public.blog_posts_before_write();

-- ---- Host approval is a one-time thing -------------------------------------
-- Blocks a new application (or approving a stale pending one) for a user
-- who has already been approved once. Admins can still restore the role
-- directly with admin_set_user_role().
create or replace function public.host_applications_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('pending', 'approved') and exists (
    select 1
    from public.host_applications a
    where a.user_id = new.user_id
      and a.status = 'approved'
      and a.id <> new.id
  ) then
    raise exception 'This account has already been approved as a host once and cannot apply again.';
  end if;
  return new;
end
$$;

drop trigger if exists host_applications_before_write on public.host_applications;
create trigger host_applications_before_write
  before insert or update of status on public.host_applications
  for each row execute function public.host_applications_before_write();

-- ---- A successful payment confirms its booking -----------------------------
create or replace function public.payments_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'succeeded'
     and (tg_op = 'INSERT' or old.status is distinct from 'succeeded') then
    update public.bookings
    set status = 'confirmed'
    where id = new.booking_id
      and status = 'pending';
  end if;
  return null;
end
$$;

drop trigger if exists payments_after_write on public.payments;
create trigger payments_after_write
  after insert or update of status on public.payments
  for each row execute function public.payments_after_write();

-- ---- One default card per user ---------------------------------------------
-- Marking a card default un-marks the others; a user's first card is the
-- default automatically.
create or replace function public.payment_methods_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and not exists (
    select 1 from public.payment_methods where user_id = new.user_id
  ) then
    new.is_default := true;
  end if;

  if new.is_default then
    update public.payment_methods
    set is_default = false
    where user_id = new.user_id
      and id <> new.id
      and is_default;
  end if;

  return new;
end
$$;

drop trigger if exists payment_methods_before_write on public.payment_methods;
create trigger payment_methods_before_write
  before insert or update of is_default on public.payment_methods
  for each row execute function public.payment_methods_before_write();


-- ============================================================================
-- 5. RPC functions: every status change and every booking goes through here
-- ============================================================================
-- Call from the app with supabase.rpc("name", { p_arg: value }). Each one
-- raises a readable error message (error.message in supabase-js) when the
-- caller isn't allowed to do it.

-- ---- Listing moderation ----------------------------------------------------

-- Host: send a draft / rejected / archived listing to the admin queue.
create or replace function public.submit_listing(p_listing_id text)
returns public.listings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.listings;
begin
  update public.listings
  set status = 'pending', submitted_at = now(), rejection_reason = null
  where id = p_listing_id
    and host_id = (select auth.uid())
    and public.current_user_role() in ('host', 'admin')
    and status in ('draft', 'rejected', 'archived')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Listing not found, not yours, or already submitted.';
  end if;

  perform public.log_action('listing.submitted', 'listing', p_listing_id);
  return v_row;
end
$$;

-- Admin: approve (goes live) or reject (reason required) a pending listing.
create or replace function public.review_listing(
  p_listing_id text,
  p_approve boolean,
  p_reason text default null
)
returns public.listings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.listings;
begin
  if not public.is_admin() then
    raise exception 'Only admins can review listings.' using errcode = '42501';
  end if;
  if not p_approve and coalesce(trim(p_reason), '') = '' then
    raise exception 'Give the host a reason when rejecting a listing.';
  end if;

  update public.listings
  set status = case when p_approve then 'approved' else 'rejected' end
                 ::public.moderation_status,
      reviewed_at = now(),
      reviewed_by = (select auth.uid()),
      rejection_reason = case when p_approve then null else p_reason end
  where id = p_listing_id
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Listing not found or not awaiting review.';
  end if;

  perform public.log_action(
    case when p_approve then 'listing.approved' else 'listing.rejected' end,
    'listing', p_listing_id, jsonb_build_object('reason', p_reason)
  );
  return v_row;
end
$$;

-- Host (own) or admin (any): take a listing off the site. Resubmitting it
-- with submit_listing() puts it back in the review queue.
create or replace function public.archive_listing(p_listing_id text)
returns public.listings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.listings;
begin
  update public.listings
  set status = 'archived'
  where id = p_listing_id
    and status <> 'archived'
    and (
      public.is_admin()
      or (host_id = (select auth.uid())
          and public.current_user_role() in ('host', 'admin'))
    )
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Listing not found, not yours, or already archived.';
  end if;

  perform public.log_action('listing.archived', 'listing', p_listing_id);
  return v_row;
end
$$;

-- ---- Blog moderation (same flow as listings) -------------------------------

create or replace function public.submit_blog_post(p_post_id text)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.blog_posts;
begin
  update public.blog_posts
  set status = 'pending', submitted_at = now(), rejection_reason = null
  where id = p_post_id
    and author_id = (select auth.uid())
    and public.current_user_role() in ('host', 'admin')
    and status in ('draft', 'rejected', 'archived')
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Post not found, not yours, or already submitted.';
  end if;

  perform public.log_action('blog_post.submitted', 'blog_post', p_post_id);
  return v_row;
end
$$;

create or replace function public.review_blog_post(
  p_post_id text,
  p_approve boolean,
  p_reason text default null
)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.blog_posts;
begin
  if not public.is_admin() then
    raise exception 'Only admins can review posts.' using errcode = '42501';
  end if;
  if not p_approve and coalesce(trim(p_reason), '') = '' then
    raise exception 'Give the author a reason when rejecting a post.';
  end if;

  update public.blog_posts
  set status = case when p_approve then 'approved' else 'rejected' end
                 ::public.moderation_status,
      published_at = case when p_approve then coalesce(published_at, now())
                          else published_at end,
      reviewed_at = now(),
      reviewed_by = (select auth.uid()),
      rejection_reason = case when p_approve then null else p_reason end
  where id = p_post_id
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Post not found or not awaiting review.';
  end if;

  perform public.log_action(
    case when p_approve then 'blog_post.approved' else 'blog_post.rejected' end,
    'blog_post', p_post_id, jsonb_build_object('reason', p_reason)
  );
  return v_row;
end
$$;

create or replace function public.archive_blog_post(p_post_id text)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.blog_posts;
begin
  update public.blog_posts
  set status = 'archived'
  where id = p_post_id
    and status <> 'archived'
    and (
      public.is_admin()
      or (author_id = (select auth.uid())
          and public.current_user_role() in ('host', 'admin'))
    )
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Post not found, not yours, or already archived.';
  end if;

  perform public.log_action('blog_post.archived', 'blog_post', p_post_id);
  return v_row;
end
$$;

-- ---- Users and host applications (admin) -----------------------------------

create or replace function public.review_host_application(
  p_application_id uuid,
  p_approve boolean,
  p_note text default null
)
returns public.host_applications
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.host_applications;
begin
  if not public.is_admin() then
    raise exception 'Only admins can review host applications.'
      using errcode = '42501';
  end if;

  update public.host_applications
  set status = case when p_approve then 'approved' else 'rejected' end
                 ::public.application_status,
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      review_note = p_note
  where id = p_application_id
    and status = 'pending'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Application not found or already reviewed.';
  end if;

  if p_approve then
    update public.profiles
    set role = 'host'
    where id = v_row.user_id
      and role = 'user';
  end if;

  perform public.log_action(
    case when p_approve then 'host_application.approved'
         else 'host_application.rejected' end,
    'profile', v_row.user_id::text, jsonb_build_object('note', p_note)
  );
  return v_row;
end
$$;

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles.' using errcode = '42501';
  end if;
  -- Stops the last admin from locking everyone out by accident.
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot change your own role.';
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'User not found.';
  end if;

  perform public.log_action(
    'profile.role_changed', 'profile', p_user_id::text,
    jsonb_build_object('role', p_role)
  );
  return v_row;
end
$$;

create or replace function public.admin_set_user_suspended(
  p_user_id uuid,
  p_suspended boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can suspend users.' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot suspend yourself.';
  end if;

  update public.profiles
  set suspended_at = case when p_suspended then coalesce(suspended_at, now())
                          else null end
  where id = p_user_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'User not found.';
  end if;

  perform public.log_action(
    case when p_suspended then 'profile.suspended' else 'profile.unsuspended' end,
    'profile', p_user_id::text
  );
  return v_row;
end
$$;

-- One round trip for the admin dashboard's headline numbers.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can view dashboard stats.'
      using errcode = '42501';
  end if;

  return jsonb_build_object(
    'users_by_role', (
      select coalesce(jsonb_object_agg(role, n), '{}')
      from (select role, count(*) as n from public.profiles group by role) s
    ),
    'suspended_users', (
      select count(*) from public.profiles where suspended_at is not null
    ),
    'listings_by_status', (
      select coalesce(jsonb_object_agg(status, n), '{}')
      from (select status, count(*) as n from public.listings group by status) s
    ),
    'blog_posts_by_status', (
      select coalesce(jsonb_object_agg(status, n), '{}')
      from (select status, count(*) as n from public.blog_posts group by status) s
    ),
    'bookings_by_status', (
      select coalesce(jsonb_object_agg(status, n), '{}')
      from (select status, count(*) as n from public.bookings group by status) s
    ),
    'pending_host_applications', (
      select count(*) from public.host_applications where status = 'pending'
    ),
    'revenue_by_currency', (
      select coalesce(jsonb_object_agg(currency, total), '{}')
      from (
        select currency, sum(amount) as total
        from public.payments
        where status = 'succeeded'
        group by currency
      ) s
    )
  );
end
$$;

-- ---- Bookings --------------------------------------------------------------

-- Guest: book an approved listing. Price, nights and currency come from the
-- listing row, never from the client. Returns the new 'pending' booking;
-- it becomes 'confirmed' when the server records a successful payment.
create or replace function public.create_booking(
  p_listing_id text,
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer default 0,
  p_infants integer default 0
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  v_listing public.listings;
  v_row public.bookings;
begin
  if v_uid is null or public.current_user_role() is null then
    raise exception 'Sign in to book a stay.' using errcode = '42501';
  end if;

  select * into v_listing
  from public.listings
  where id = p_listing_id
    and status = 'approved';

  if not found then
    raise exception 'This stay is not available for booking.';
  end if;
  if v_listing.host_id = v_uid then
    raise exception 'You cannot book your own listing.';
  end if;
  if p_check_in < v_today then
    raise exception 'Check-in cannot be in the past.';
  end if;
  if p_check_out <= p_check_in then
    raise exception 'Check-out must be after check-in.';
  end if;
  if p_check_out - p_check_in > 90 then
    raise exception 'Stays are limited to 90 nights.';
  end if;
  if p_adults < 1 or p_children < 0 or p_infants < 0 then
    raise exception 'A booking needs at least one adult.';
  end if;
  -- Infants don't count towards capacity, matching the guest selector.
  if p_adults + p_children > v_listing.max_guests then
    raise exception 'This stay fits at most % guests.', v_listing.max_guests;
  end if;

  begin
    insert into public.bookings (
      guest_id, listing_id, check_in, check_out,
      adults, children, infants,
      nightly_price, total_amount, currency
    )
    values (
      v_uid, p_listing_id, p_check_in, p_check_out,
      p_adults, p_children, p_infants,
      v_listing.price_amount,
      v_listing.price_amount * (p_check_out - p_check_in),
      v_listing.price_currency
    )
    returning * into v_row;
  exception when exclusion_violation then
    raise exception 'Those dates are already booked.';
  end;

  return v_row;
end
$$;

-- Guest (own, before check-in), host (their listing) or admin (any).
-- Refunding a paid booking is the server's job, via the payment provider.
create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_reason text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  v_row public.bookings;
begin
  update public.bookings b
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = v_uid,
      cancellation_reason = p_reason
  where b.id = p_booking_id
    and b.status in ('pending', 'confirmed')
    and public.current_user_role() is not null
    and (
      public.is_admin()
      or public.is_listing_host(b.listing_id)
      or (b.guest_id = v_uid and b.check_in > v_today)
    )
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Booking not found, not yours, or can no longer be cancelled.';
  end if;

  perform public.log_action(
    'booking.cancelled', 'booking', p_booking_id::text,
    jsonb_build_object('reason', p_reason)
  );
  return v_row;
end
$$;

-- Admin (or a scheduled pg_cron job): mark confirmed stays whose check-out
-- date has passed as completed. Returns how many rows changed.
create or replace function public.complete_past_bookings()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Only admins can complete bookings.' using errcode = '42501';
  end if;

  update public.bookings
  set status = 'completed'
  where status = 'confirmed'
    and check_out <= (now() at time zone 'Asia/Phnom_Penh')::date;

  get diagnostics v_count = row_count;
  return v_count;
end
$$;


-- ============================================================================
-- 6. Row Level Security and grants
-- ============================================================================
-- Supabase grants every privilege on public tables to `anon` and
-- `authenticated` by default. Each table below starts by revoking all of
-- that, then grants back exactly what the browser needs.

-- ---- profiles --------------------------------------------------------------
alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
-- role and suspended_at change only through the admin RPCs.
grant update (full_name, avatar_url, bio) on public.profiles to authenticated;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- ---- profile_private -------------------------------------------------------
alter table public.profile_private enable row level security;

revoke all on public.profile_private from anon, authenticated;
grant select on public.profile_private to authenticated;
grant update (phone, date_of_birth, id_number, billing_address)
  on public.profile_private to authenticated;

drop policy if exists "Owner or admin reads private profile" on public.profile_private;
create policy "Owner or admin reads private profile"
  on public.profile_private for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Owner or admin updates private profile" on public.profile_private;
create policy "Owner or admin updates private profile"
  on public.profile_private for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- ---- host_applications -----------------------------------------------------
alter table public.host_applications enable row level security;

revoke all on public.host_applications from anon, authenticated;
grant select on public.host_applications to authenticated;
grant insert (message) on public.host_applications to authenticated;

drop policy if exists "Applicant or admin reads applications" on public.host_applications;
create policy "Applicant or admin reads applications"
  on public.host_applications for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users apply to become hosts" on public.host_applications;
create policy "Users apply to become hosts"
  on public.host_applications for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.current_user_role() = 'user'
  );

-- ---- listings --------------------------------------------------------------
alter table public.listings enable row level security;

revoke all on public.listings from anon, authenticated;
grant select on public.listings to anon, authenticated;
grant delete on public.listings to authenticated;
-- Content only. Not: id, host_id, status, rating_*, host_*, review fields.
grant insert (
  name, tagline, description, images, thumbnail_url, region, area, category,
  tags, price_amount, price_currency, price_unit, max_guests, beds, room_type,
  room_size_value, room_size_unit, facilities, experiences
) on public.listings to authenticated;
grant update (
  name, tagline, description, images, thumbnail_url, region, area, category,
  tags, price_amount, price_currency, price_unit, max_guests, beds, room_type,
  room_size_value, room_size_unit, facilities, experiences
) on public.listings to authenticated;

-- Replaces the old "everything is public" policy: drafts, pending and
-- rejected listings must stay hidden.
drop policy if exists "Listings are publicly readable" on public.listings;

drop policy if exists "Approved listings are public; hosts and admins see more"
  on public.listings;
create policy "Approved listings are public; hosts and admins see more"
  on public.listings for select
  to anon, authenticated
  using (
    status = 'approved'
    or host_id = (select auth.uid())
    or public.is_admin()
  );

drop policy if exists "Hosts create their own listings" on public.listings;
create policy "Hosts create their own listings"
  on public.listings for insert
  to authenticated
  with check (
    host_id = (select auth.uid())
    and public.current_user_role() in ('host', 'admin')
  );

drop policy if exists "Hosts edit their own listings; admins edit any"
  on public.listings;
create policy "Hosts edit their own listings; admins edit any"
  on public.listings for update
  to authenticated
  using (
    (host_id = (select auth.uid())
     and public.current_user_role() in ('host', 'admin'))
    or public.is_admin()
  )
  with check (
    (host_id = (select auth.uid())
     and public.current_user_role() in ('host', 'admin'))
    or public.is_admin()
  );

-- Live or in-review listings are archived instead (archive_listing), and a
-- listing with bookings can't be deleted at all (FK restrict).
drop policy if exists "Hosts delete unpublished listings; admins delete any"
  on public.listings;
create policy "Hosts delete unpublished listings; admins delete any"
  on public.listings for delete
  to authenticated
  using (
    (host_id = (select auth.uid()) and status in ('draft', 'rejected'))
    or public.is_admin()
  );

-- ---- blog_posts ------------------------------------------------------------
alter table public.blog_posts enable row level security;

revoke all on public.blog_posts from anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant delete on public.blog_posts to authenticated;
grant insert (slug, title, excerpt, cover_image, category, tags, content)
  on public.blog_posts to authenticated;
grant update (slug, title, excerpt, cover_image, category, tags, content)
  on public.blog_posts to authenticated;

drop policy if exists "Published posts are public; authors and admins see more"
  on public.blog_posts;
create policy "Published posts are public; authors and admins see more"
  on public.blog_posts for select
  to anon, authenticated
  using (
    status = 'approved'
    or author_id = (select auth.uid())
    or public.is_admin()
  );

drop policy if exists "Hosts write their own posts" on public.blog_posts;
create policy "Hosts write their own posts"
  on public.blog_posts for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and public.current_user_role() in ('host', 'admin')
  );

drop policy if exists "Authors edit their own posts; admins edit any"
  on public.blog_posts;
create policy "Authors edit their own posts; admins edit any"
  on public.blog_posts for update
  to authenticated
  using (
    (author_id = (select auth.uid())
     and public.current_user_role() in ('host', 'admin'))
    or public.is_admin()
  )
  with check (
    (author_id = (select auth.uid())
     and public.current_user_role() in ('host', 'admin'))
    or public.is_admin()
  );

drop policy if exists "Authors delete unpublished posts; admins delete any"
  on public.blog_posts;
create policy "Authors delete unpublished posts; admins delete any"
  on public.blog_posts for delete
  to authenticated
  using (
    (author_id = (select auth.uid()) and status in ('draft', 'rejected'))
    or public.is_admin()
  );

-- ---- bookings (read-only from the browser; writes go through RPCs) ---------
alter table public.bookings enable row level security;

revoke all on public.bookings from anon, authenticated;
grant select on public.bookings to authenticated;

drop policy if exists "Guest, host of the listing, or admin reads bookings"
  on public.bookings;
create policy "Guest, host of the listing, or admin reads bookings"
  on public.bookings for select
  to authenticated
  using (
    guest_id = (select auth.uid())
    or public.is_listing_host(listing_id)
    or public.is_admin()
  );

-- ---- payments (read-only from the browser; server writes) ------------------
alter table public.payments enable row level security;

revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;

drop policy if exists "Payer or admin reads payments" on public.payments;
create policy "Payer or admin reads payments"
  on public.payments for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- ---- payment_methods -------------------------------------------------------
alter table public.payment_methods enable row level security;

revoke all on public.payment_methods from anon, authenticated;
grant select, delete on public.payment_methods to authenticated;
grant insert (brand, last4, exp_month, exp_year, cardholder_name, is_default)
  on public.payment_methods to authenticated;
grant update (exp_month, exp_year, cardholder_name, is_default)
  on public.payment_methods to authenticated;

drop policy if exists "Owner or admin reads payment methods" on public.payment_methods;
create policy "Owner or admin reads payment methods"
  on public.payment_methods for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Owner adds payment methods" on public.payment_methods;
create policy "Owner adds payment methods"
  on public.payment_methods for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Owner updates payment methods" on public.payment_methods;
create policy "Owner updates payment methods"
  on public.payment_methods for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Owner removes payment methods" on public.payment_methods;
create policy "Owner removes payment methods"
  on public.payment_methods for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---- audit_log -------------------------------------------------------------
alter table public.audit_log enable row level security;

revoke all on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

drop policy if exists "Admins read the audit log" on public.audit_log;
create policy "Admins read the audit log"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- ---- Function grants -------------------------------------------------------
-- Helpers are used inside policies, which also run for signed-out visitors.
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_listing_host(text) to anon, authenticated;

revoke execute on function public.log_action(text, text, text, jsonb)
  from public, anon, authenticated;

-- RPCs: signed-in users only. Each checks the caller's role itself.
do $$
declare
  f text;
begin
  foreach f in array array[
    'public.submit_listing(text)',
    'public.review_listing(text, boolean, text)',
    'public.archive_listing(text)',
    'public.submit_blog_post(text)',
    'public.review_blog_post(text, boolean, text)',
    'public.archive_blog_post(text)',
    'public.review_host_application(uuid, boolean, text)',
    'public.admin_set_user_role(uuid, public.user_role)',
    'public.admin_set_user_suspended(uuid, boolean)',
    'public.admin_dashboard_stats()',
    'public.create_booking(text, date, date, integer, integer, integer)',
    'public.cancel_booking(uuid, text)',
    'public.complete_past_bookings()'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;


-- ============================================================================
-- 7. Storage buckets for uploaded images
-- ============================================================================
-- Files go under a folder named after the uploader's user id, e.g.
--   supabase.storage.from("avatars").upload(`${user.id}/avatar.png`, file)
-- Public buckets: read them with getPublicUrl(), no sign-in needed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('listing-images', 'listing-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('blog-images', 'blog-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "JumRok images are publicly readable" on storage.objects;
create policy "JumRok images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('avatars', 'listing-images', 'blog-images'));

-- Anyone signed in can upload an avatar; only hosts/admins upload listing
-- and blog images. Always into their own folder.
drop policy if exists "Users upload into their own folder" on storage.objects;
create policy "Users upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'listing-images', 'blog-images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (
      bucket_id = 'avatars'
      or public.current_user_role() in ('host', 'admin')
    )
  );

drop policy if exists "Users replace their own files; admins any" on storage.objects;
create policy "Users replace their own files; admins any"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'listing-images', 'blog-images')
    and ((storage.foldername(name))[1] = (select auth.uid())::text
         or public.is_admin())
  );

drop policy if exists "Users delete their own files; admins any" on storage.objects;
create policy "Users delete their own files; admins any"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'listing-images', 'blog-images')
    and ((storage.foldername(name))[1] = (select auth.uid())::text
         or public.is_admin())
  );


-- ============================================================================
-- 8. Backfill profiles for accounts created before this schema
-- ============================================================================

insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  left(coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    ''
  ), 120),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

insert into public.profile_private (id, email)
select u.id, coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;


-- ============================================================================
-- Making the first admin
-- ============================================================================
-- Nobody can promote themselves from the app. Sign up normally, then run
-- this once in the SQL Editor (which bypasses RLS):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
