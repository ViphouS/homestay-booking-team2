import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Star, Users } from "lucide-react";
import { cn } from "cn";

import type { Listing } from "@/types/listing";

const ALL_REGIONS = "All";

export function ListingSection() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [activeRegion, setActiveRegion] = useState(ALL_REGIONS);

  useEffect(() => {
    let cancelled = false;

    fetch("/data/listings.json")
      .then((res) => res.json())
      .then((data: Listing[]) => {
        if (!cancelled) setListings(data);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const regions = useMemo(() => {
    if (!listings) return [];
    return Array.from(new Set(listings.map((l) => l.location.region)));
  }, [listings]);

  const visibleListings = useMemo(() => {
    if (!listings) return [];
    if (activeRegion === ALL_REGIONS) return listings;
    return listings.filter((l) => l.location.region === activeRegion);
  }, [listings, activeRegion]);

  return (
    <section className="bg-[#F3EFE8] px-6 py-16 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#203C2D]/60">
            Explore Cambodia
          </p>
          <h2 className="mb-4 font-heading text-3xl text-[#203C2D] md:text-4xl">
            Where Comfort Meets Local Experience
          </h2>
          <p className="text-sm text-[#203C2D]/70">
            Discover unique homestays, meet local people, and experience a
            more personal side of Cambodia.
          </p>
        </div>

        {regions.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {[ALL_REGIONS, ...regions].map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                  region === activeRegion
                    ? "bg-[#203C2D] text-white"
                    : "bg-[#AEBBA8]/30 text-[#203C2D] hover:bg-[#AEBBA8]/50"
                )}
              >
                {region}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings === null
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] animate-pulse rounded-3xl bg-[#AEBBA8]/25"
                />
              ))
            : visibleListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
        </div>

        {listings !== null && visibleListings.length === 0 && (
          <p className="mt-8 text-center text-sm text-[#203C2D]/60">
            No homestays found for this region yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="relative h-[360px] overflow-hidden rounded-3xl shadow-sm">
      {imageFailed ? (
        <div className="absolute inset-0 bg-gradient-to-br from-[#AEBBA8] to-[#203C2D]" />
      ) : (
        <img
          src={listing.thumbnailUrl}
          alt={listing.name}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#112C20]/90 via-[#112C20]/10 to-transparent" />

      <div className="absolute inset-x-4 bottom-4 text-white">
        <h3 className="font-heading text-xl leading-tight">{listing.name}</h3>
        <p className="mb-3 text-xs text-white/80">
          {listing.location.region} · {listing.tagline}
        </p>

        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-xs text-[#F8DD95]">
              <Star className="size-3.5 fill-current" />
              <span>
                {listing.rating.score.toFixed(1)} · {listing.capacity.maxGuests}{" "}
                <Users className="inline size-3 -translate-y-px" /> ·{" "}
                {listing.beds} Bed{listing.beds === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-lg font-bold">
              ${listing.price.amount}
              <span className="text-xs font-medium text-white/80">
                /{listing.price.unit}
              </span>
            </p>
          </div>

          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EFB7A8] text-[#203C2D]">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
