import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Share2, Bookmark, Star, MapPin, Bed } from "lucide-react"
import { differenceInCalendarDays } from "date-fns"

import { useListings } from "@/hooks/use-listings"
import { getIconForLabel } from "@/lib/amenity-icons"
import { formatPrice, formatUnit } from "@/lib/format-price"
import type { Listing } from "@/types/listing"
import {
  CheckInDatePicker,
  CheckOutDatePicker,
  GuestSelector,
  DEFAULT_SEARCH_VALUES,
} from "@/pages/home/hero"

import BookingModal from "./BookingModal"

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-headline mb-4 text-2xl text-primary">{children}</h2>
  )
}

function HostAvatar({ name, avatar }: { name: string; avatar: string }) {
  const [failed, setFailed] = useState(false)

  if (failed || !avatar) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#AEBBA8] font-medium text-white">
        {name[0]}
      </div>
    )
  }

  return (
    <img
      src={avatar}
      alt={name}
      onError={() => setFailed(true)}
      className="h-14 w-14 rounded-full object-cover"
    />
  )
}

function HeroImage({ stay }: { stay: Listing }) {
  const [failed, setFailed] = useState(false)
  const src = stay.images[0] ?? stay.thumbnailUrl

  if (failed) {
    return (
      <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D] sm:h-80 md:h-[420px]" />
    )
  }

  return (
    <img
      src={src}
      alt={stay.name}
      onError={() => setFailed(true)}
      className="h-64 w-full object-cover sm:h-80 md:h-[420px]"
    />
  )
}

function BookingSidebar({ stay }: { stay: Listing }) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(DEFAULT_SEARCH_VALUES.guests)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCheckInChange = (nextCheckIn: Date | undefined) => {
    setCheckIn(nextCheckIn)
    setCheckOut((previous) =>
      previous && nextCheckIn && previous <= nextCheckIn ? undefined : previous
    )
  }

  const nights =
    checkIn && checkOut ? differenceInCalendarDays(checkOut, checkIn) : 0
  const hasValidStay = nights > 0
  // Exactly what `create_booking` charges: nightly price × nights.
  const total = stay.price.amount * nights

  return (
    <aside className="border-tertiary font-body h-fit w-full shrink-0 rounded-2xl border bg-white p-6 lg:sticky lg:top-24 lg:w-[360px]">
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-primary">
          {formatPrice(stay.price.amount, stay.price.currency)}
        </span>
        <span className="text-sm text-gray-500">
          {" "}
          / {formatUnit(stay.price.unit)}
        </span>
      </div>

      <div className="border-tertiary mb-3 grid grid-cols-2 overflow-hidden rounded-xl border">
        <CheckInDatePicker
          value={checkIn}
          onValueChange={handleCheckInChange}
          className="border-tertiary w-full border-t-0 border-r p-3 lg:w-full lg:border-l-0"
        />
        <CheckOutDatePicker
          value={checkOut}
          onValueChange={setCheckOut}
          minDate={checkIn}
          className="w-full border-t-0 p-3 lg:w-full lg:border-l-0"
        />
      </div>

      <div className="border-tertiary mb-4 rounded-xl border">
        <GuestSelector
          value={guests}
          onValueChange={setGuests}
          className="w-full p-3 lg:w-full"
        />
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={!hasValidStay}
        className="mb-4 w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Reserve Homestay
      </button>

      {hasValidStay ? (
        <>
          <div className="mb-4 text-center text-xs text-gray-500">
            You won't be charged yet
          </div>

          <div className="border-tertiary space-y-2 border-t pt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>
                {formatPrice(stay.price.amount, stay.price.currency)} × {nights}{" "}
                nights
              </span>
              <span>{formatPrice(total, stay.price.currency)}</span>
            </div>
          </div>

          <div className="border-tertiary mt-4 flex justify-between border-t pt-4 text-base font-semibold text-primary">
            <span>Total</span>
            <span>{formatPrice(total, stay.price.currency)}</span>
          </div>
        </>
      ) : (
        <div className="border-tertiary border-t pt-4 text-center text-xs text-gray-500">
          Select check-in and check-out dates to see the total
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listingId={stay.id}
        stayName={stay.name}
        currency={stay.price.currency}
        pricePerNight={stay.price.amount}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        nights={nights}
        total={total}
      />
    </aside>
  )
}

export function StayDetails() {
  const { id } = useParams()
  const { listings, hasError } = useListings()

  if (listings === null)
    return <div className="p-10 text-center text-gray-500">Loading...</div>
  if (hasError)
    return (
      <div className="p-10 text-center text-gray-500">
        Couldn't load stays right now.
      </div>
    )

  const stay = listings.find((l) => l.id === id)
  if (!stay)
    return <div className="p-10 text-center text-gray-500">Stay not found</div>

  return (
    <main className="font-body mx-auto max-w-[1100px] px-4 py-10 text-gray-800 sm:px-6">
      {/* Breadcrumb + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <nav className="flex gap-2 text-gray-500">
          <Link to="/explore">Explore</Link>
          <span className="mx-1">/</span>
          <span>{stay.location.region}</span>
          <span className="mx-1">/</span>
          <span>{stay.name}</span>
        </nav>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-gray-600 hover:text-black">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-black">
            <Bookmark size={16} /> Save
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-headline mb-2 text-3xl leading-tight text-primary md:text-4xl">
        {stay.name}
      </h1>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Star size={14} className="fill-secondary stroke-secondary" />
          {stay.rating.score.toFixed(2)} · {stay.rating.reviewCount} reviews
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {stay.location.area}, {stay.location.region} ·
          Sleeps up to {stay.capacity.maxGuests} guests
        </span>
      </div>

      {/* Hero image */}
      <div className="mb-10 overflow-hidden rounded-2xl">
        <HeroImage stay={stay} />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Left column */}
        <div className="flex-1">
          {/* Host */}
          <div className="border-tertiary mb-6 flex items-center gap-4 border-b pb-6">
            <HostAvatar name={stay.host.name} avatar={stay.host.avatarUrl} />
            <div>
              <div className="font-medium text-primary">
                Hosted by {stay.host.name}
              </div>
              <div className="text-sm text-gray-500">{stay.category}</div>
            </div>
          </div>

          {/* Highlights, from your experiences list */}
          {stay.experiences.length > 0 && (
            <div className="border-tertiary mb-6 grid grid-cols-1 gap-6 border-b pb-6 sm:grid-cols-3">
              {stay.experiences.slice(0, 3).map((label) => {
                const Icon = getIconForLabel(label)
                return (
                  <div key={label} className="flex gap-3">
                    <Icon size={22} className="shrink-0 text-primary" />
                    <div className="text-sm font-medium">{label}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Description */}
          <div className="border-tertiary mb-8 border-b pb-8">
            <SectionHeading>About this stay</SectionHeading>
            <p className="text-sm leading-relaxed text-gray-700">
              {stay.description}
            </p>
          </div>

          {/* Room details */}
          <div className="border-tertiary mb-8 border-b pb-8">
            <SectionHeading>Room Details</SectionHeading>
            <div className="border-tertiary bg-neutral flex items-start gap-3 rounded-xl border p-4">
              <Bed size={18} className="mt-0.5 text-primary" />
              <div>
                <div className="text-sm font-medium">{stay.roomType}</div>
                <div className="text-xs text-gray-500">
                  {stay.beds} bed{stay.beds === 1 ? "" : "s"} ·{" "}
                  {stay.roomSize.value} {stay.roomSize.unit} · Up to{" "}
                  {stay.capacity.maxGuests} guests
                </div>
              </div>
            </div>
          </div>

          {/* Amenities, from your facilities list */}
          {stay.facilities.length > 0 && (
            <div className="border-tertiary mb-8 border-b pb-8">
              <SectionHeading>What This Stay Offers</SectionHeading>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {stay.facilities.map((label) => {
                  const Icon = getIconForLabel(label)
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Icon size={18} className="text-primary" />
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Reviews summary */}
          <div className="border-tertiary mb-8 border-b pb-8">
            <div className="mb-2 flex items-center gap-2">
              <Star size={18} className="fill-secondary stroke-secondary" />
              <SectionHeading>
                {stay.rating.score.toFixed(2)} Rating ·{" "}
                {stay.rating.reviewCount} Guest Reviews
              </SectionHeading>
            </div>
            <p className="text-sm text-gray-500">
              Guest reviews for this stay are coming soon.
            </p>
          </div>

          {/* Location */}
          <div>
            <SectionHeading>Location</SectionHeading>
            <div className="bg-neutral flex h-[240px] w-full items-center justify-center rounded-xl text-sm text-gray-400">
              Map goes here
            </div>
          </div>
        </div>

        {/* Right column — sticky booking sidebar */}
        <BookingSidebar stay={stay} />
      </div>
    </main>
  )
}
