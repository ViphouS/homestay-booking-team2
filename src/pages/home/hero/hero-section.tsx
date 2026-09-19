import * as React from "react"
import { cn } from "cn"

import { HeroContent } from "./hero-content"
import { SearchBar } from "./search-bar"
import type { SearchValues } from "./types"

/** Cambodian countryside — palms against misty green hills. Swap via `imageSrc`. */
const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1728740303677-da7b05eba98e?auto=format&fit=crop&w=2000&q=80"

export type HeroSectionProps = {
  imageSrc?: string
  /** Describe the scene. Pass "" if a future layout makes the image decorative. */
  imageAlt?: string
  eyebrow?: React.ReactNode | string[]
  title?: React.ReactNode
  description?: React.ReactNode
  /** Seeds the search bar. */
  defaultSearchValues?: Partial<SearchValues>
  searchLabel?: string
  onSearch?: (values: SearchValues) => void
  className?: string
}

/**
 * Landing hero: a full-bleed photograph card with the headline over it and the
 * search bar straddling its bottom edge.
 *
 * Widths follow the team's layout scale — 1280 page / 1180 card / 1020 search
 * bar. The bar stacks into rows below `lg` and becomes a single pill above it.
 */
export function HeroSection({
  imageSrc = DEFAULT_HERO_IMAGE,
  imageAlt = "Sugar palms above green rice fields at the foot of misty hills in Cambodia",
  eyebrow = ["Cambodia", "Homestays", "Local people", "Real experiences"],
  title = "Discover Authentic Homestays in Cambodia",
  description = "Book charming local stays, experience Khmer hospitality, and explore Cambodia through the people who call it home.",
  defaultSearchValues,
  searchLabel,
  onSearch,
  className,
}: HeroSectionProps) {
  return (
    <section className={cn("w-full py-6 sm:py-8", className)}>
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto w-full max-w-[1180px]">
          <div className="relative overflow-hidden rounded-3xl bg-muted lg:rounded-[2rem]">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 size-full object-cover"
              loading="eager"
              decoding="async"
            />
            {/* Scrims: one from the left for the headline, one from the
                bottom so the search bar has a calm edge to sit against. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-r from-black/65 from-20% via-black/25 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
            />

            <div className="relative flex min-h-[460px] flex-col justify-center px-6 pt-14 pb-20 sm:min-h-[520px] sm:px-10 sm:pt-16 sm:pb-24 lg:min-h-[600px] lg:px-14 lg:pt-20 lg:pb-28">
              <HeroContent
                eyebrow={eyebrow}
                title={title}
                description={description}
              />
            </div>
          </div>

          <div className="relative mx-auto -mt-10 w-full max-w-[1020px] px-4 sm:px-6 lg:-mt-12 lg:px-0">
            <SearchBar
              defaultValues={defaultSearchValues}
              searchLabel={searchLabel}
              onSearch={onSearch}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
