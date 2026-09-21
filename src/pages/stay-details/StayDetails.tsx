import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Share2, Bookmark, Star, MapPin, Bed, Users } from "lucide-react";

import { useListings } from "@/hooks/use-listings";
import { getIconForLabel } from "@/lib/amenity-icons";
import { formatPrice, formatUnit } from "@/lib/format-price";
import type { Listing } from "@/types/listing";

import BookingModal from "./BookingModal";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-headline text-2xl text-primary mb-4">{children}</h2>;
}

function HostAvatar({ name, avatar }: { name: string; avatar: string }) {
  const [failed, setFailed] = useState(false);

  if (failed || !avatar) {
    return (
      <div className="w-14 h-14 rounded-full bg-[#AEBBA8] flex items-center justify-center text-white font-medium shrink-0">
        {name[0]}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      onError={() => setFailed(true)}
      className="w-14 h-14 rounded-full object-cover"
    />
  );
}

function HeroImage({ stay }: { stay: Listing }) {
  const [failed, setFailed] = useState(false);
  const src = stay.images[0] ?? stay.thumbnailUrl;

  if (failed) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-[420px] rounded-2xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
    );
  }

  return (
    <img
      src={src}
      alt={stay.name}
      onError={() => setFailed(true)}
      className="w-full h-64 sm:h-80 md:h-[420px] object-cover"
    />
  );
}

function BookingSidebar({ stay }: { stay: Listing }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nights = 5; // placeholder until real date logic is wired up
  const subtotal = stay.price.amount * nights;
  const cleaningFee = 8;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <aside className="w-full lg:w-[360px] shrink-0 rounded-2xl border border-tertiary bg-white p-6 lg:sticky lg:top-24 h-fit font-body">
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-semibold text-primary">
          {formatPrice(stay.price.amount, stay.price.currency)}
        </span>
        <span className="text-sm text-gray-500"> / {formatUnit(stay.price.unit)}</span>
      </div>

      <div className="grid grid-cols-2 border border-tertiary rounded-xl overflow-hidden mb-3">
        <label className="p-3 border-r border-tertiary">
          <span className="block text-[10px] tracking-wide text-gray-500">Check-in</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-sm bg-transparent outline-none"
          />
        </label>
        <label className="p-3">
          <span className="block text-[10px] tracking-wide text-gray-500">Check-out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-sm bg-transparent outline-none"
          />
        </label>
      </div>

      <label className="flex items-center justify-between border border-tertiary rounded-xl p-3 mb-4">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} /> Guests
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="w-6 h-6 rounded-full border border-tertiary flex items-center justify-center text-sm"
            aria-label="Decrease guests"
          >
            −
          </button>
          <span className="text-sm w-4 text-center">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(stay.capacity.maxGuests, g + 1))}
            className="w-6 h-6 rounded-full border border-tertiary flex items-center justify-center text-sm"
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
      </label>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-full py-3 bg-primary text-white text-sm font-medium mb-4 transition-opacity hover:opacity-90"
      >
        Reserve Homestay
      </button>

      <div className="text-xs text-gray-500 text-center mb-4">
        You won't be charged yet
      </div>

      <div className="space-y-2 text-sm text-gray-600 border-t border-tertiary pt-4">
        <div className="flex justify-between">
          <span>
            {formatPrice(stay.price.amount, stay.price.currency)} × {nights} nights
          </span>
          <span>{formatPrice(subtotal, stay.price.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>{formatPrice(cleaningFee, stay.price.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>{formatPrice(serviceFee, stay.price.currency)}</span>
        </div>
      </div>

      <div className="flex justify-between text-base font-semibold text-primary mt-4 pt-4 border-t border-tertiary">
        <span>Total due</span>
        <span>{formatPrice(total, stay.price.currency)}</span>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stayName={stay.name}
        currency={stay.price.currency}
        pricePerNight={stay.price.amount}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        nights={nights}
        subtotal={subtotal}
        cleaningFee={cleaningFee}
        serviceFee={serviceFee}
        total={total}
      />
    </aside>
  );
}

export function StayDetails() {
  const { id } = useParams();
  const { listings, hasError } = useListings();

  if (listings === null)
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (hasError)
    return <div className="p-10 text-center text-gray-500">Couldn't load stays right now.</div>;

  const stay = listings.find((l) => l.id === id);
  if (!stay) return <div className="p-10 text-center text-gray-500">Stay not found</div>;

  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 font-body text-gray-800">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-4 text-sm flex-wrap gap-2">
        <nav className="text-gray-500 flex gap-2">
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
      <h1 className="font-headline text-3xl md:text-4xl leading-tight text-primary mb-2">
        {stay.name}
      </h1>
      <div className="flex items-center gap-3 text-sm text-gray-600 mb-6 flex-wrap">
        <span className="flex items-center gap-1">
          <Star size={14} className="fill-secondary stroke-secondary" />
          {stay.rating.score.toFixed(2)} · {stay.rating.reviewCount} reviews
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {stay.location.area}, {stay.location.region} · Sleeps up to{" "}
          {stay.capacity.maxGuests} guests
        </span>
      </div>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-10">
        <HeroImage stay={stay} />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left column */}
        <div className="flex-1">
          {/* Host */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-tertiary">
            <HostAvatar name={stay.host.name} avatar={stay.host.avatarUrl} />
            <div>
              <div className="font-medium text-primary">Hosted by {stay.host.name}</div>
              <div className="text-sm text-gray-500">{stay.category}</div>
            </div>
          </div>

          {/* Highlights, from your experiences list */}
          {stay.experiences.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 mb-6 border-b border-tertiary">
              {stay.experiences.slice(0, 3).map((label) => {
                const Icon = getIconForLabel(label);
                return (
                  <div key={label} className="flex gap-3">
                    <Icon size={22} className="text-primary shrink-0" />
                    <div className="text-sm font-medium">{label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          <div className="pb-8 mb-8 border-b border-tertiary">
            <SectionHeading>About this stay</SectionHeading>
            <p className="text-sm leading-relaxed text-gray-700">{stay.description}</p>
          </div>

          {/* Room details */}
          <div className="pb-8 mb-8 border-b border-tertiary">
            <SectionHeading>Room Details</SectionHeading>
            <div className="rounded-xl border border-tertiary bg-neutral p-4 flex items-start gap-3">
              <Bed size={18} className="text-primary mt-0.5" />
              <div>
                <div className="text-sm font-medium">{stay.roomType}</div>
                <div className="text-xs text-gray-500">
                  {stay.beds} bed{stay.beds === 1 ? "" : "s"} · {stay.roomSize.value}{" "}
                  {stay.roomSize.unit} · Up to {stay.capacity.maxGuests} guests
                </div>
              </div>
            </div>
          </div>

          {/* Amenities, from your facilities list */}
          {stay.facilities.length > 0 && (
            <div className="pb-8 mb-8 border-b border-tertiary">
              <SectionHeading>What This Stay Offers</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stay.facilities.map((label) => {
                  const Icon = getIconForLabel(label);
                  return (
                    <div key={label} className="flex items-center gap-2 text-sm">
                      <Icon size={18} className="text-primary" />
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews summary */}
          <div className="pb-8 mb-8 border-b border-tertiary">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="fill-secondary stroke-secondary" />
              <SectionHeading>
                {stay.rating.score.toFixed(2)} Rating · {stay.rating.reviewCount} Guest Reviews
              </SectionHeading>
            </div>
            <p className="text-sm text-gray-500">Guest reviews for this stay are coming soon.</p>
          </div>

          {/* Location */}
          <div>
            <SectionHeading>Location</SectionHeading>
            <div className="w-full h-[240px] rounded-xl bg-neutral flex items-center justify-center text-sm text-gray-400">
              Map goes here
            </div>
          </div>
        </div>

        {/* Right column — sticky booking sidebar */}
        <BookingSidebar stay={stay} />
      </div>
    </main>
  );
}