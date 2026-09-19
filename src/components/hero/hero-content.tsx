import * as React from "react"
import { cn } from "cn"

export type HeroContentProps = {
  /** Small tracked caption above the heading. Arrays are joined with "·". */
  eyebrow?: React.ReactNode | string[]
  title: React.ReactNode
  description?: React.ReactNode
  /** Heading level, for pages where the hero is not the page's `h1`. */
  as?: "h1" | "h2"
  className?: string
}

/**
 * The text block of the hero: eyebrow, heading and supporting copy.
 *
 * Colours are fixed light because this always sits over a photograph, so it
 * reads the same in either theme.
 */
export function HeroContent({
  eyebrow,
  title,
  description,
  as: Heading = "h1",
  className,
}: HeroContentProps) {
  const eyebrowContent = Array.isArray(eyebrow) ? eyebrow.join(" · ") : eyebrow

  return (
    <div className={cn("flex max-w-2xl flex-col gap-4", className)}>
      {eyebrowContent ? (
        <p className="text-[0.7rem] font-medium tracking-[0.18em] text-white/80 uppercase sm:text-xs">
          {eyebrowContent}
        </p>
      ) : null}

      <Heading className="font-heading text-4xl leading-[1.08] font-bold text-balance text-white sm:text-5xl lg:text-6xl">
        {title}
      </Heading>

      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-pretty text-white/85 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
