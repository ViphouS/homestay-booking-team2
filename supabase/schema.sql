-- JumRok database schema.
-- Run in the Supabase Dashboard: SQL Editor > New query > paste > Run.
-- Keep src/types/database.ts in step with this file.

-- Listings: flattened version of the `Listing` type in src/types/listing.ts
-- (nested objects like price/rating/host become prefixed columns).
create table if not exists public.listings (
  id               text primary key,
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
  rating_score     numeric not null default 0,
  review_count     integer not null default 0,
  max_guests       integer not null check (max_guests > 0),
  beds             integer not null default 1,
  room_type        text not null default '',
  room_size_value  numeric not null default 0,
  room_size_unit   text not null default 'm²',
  facilities       text[] not null default '{}',
  experiences      text[] not null default '{}',
  host_name        text not null default '',
  host_avatar_url  text not null default '',
  created_at       timestamptz not null default now()
);

-- Row Level Security: the catalogue is public read-only from the browser.
-- Writes go through the dashboard or a service-role key, never the client.
alter table public.listings enable row level security;

drop policy if exists "Listings are publicly readable" on public.listings;
create policy "Listings are publicly readable"
  on public.listings for select
  using (true);
