import * as React from "react"

import { Input } from "@/components/ui/input"

export type PriceRangeFieldProps = {
  min: number | undefined
  max: number | undefined
  /** Fired once the traveller finishes editing, not on every keystroke. */
  onRangeChange: (range: {
    min: number | undefined
    max: number | undefined
  }) => void
  /** Shown as the input placeholders — the catalogue's real bounds. */
  bounds?: { min: number; max: number }
}

const toDraft = (value: number | undefined) =>
  value === undefined ? "" : String(value)

const toAmount = (draft: string) => {
  const trimmed = draft.trim()
  if (!trimmed) return undefined
  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

/**
 * Nightly price floor and ceiling.
 *
 * Edits are held locally and committed on blur or Enter, so that typing "28"
 * does not briefly search for "$2" as each keystroke lands in the URL.
 */
export function PriceRangeField({
  min,
  max,
  onRangeChange,
  bounds,
}: PriceRangeFieldProps) {
  const [draft, setDraft] = React.useState({
    min: toDraft(min),
    max: toDraft(max),
  })
  const [seed, setSeed] = React.useState({ min, max })

  // Re-seed when the range changes from elsewhere ("Clear all", a chip's ×).
  // Adjusting during render keeps the inputs in step without an effect's
  // extra paint.
  if (seed.min !== min || seed.max !== max) {
    setSeed({ min, max })
    setDraft({ min: toDraft(min), max: toDraft(max) })
  }

  const commit = () => {
    const next = { min: toAmount(draft.min), max: toAmount(draft.max) }

    // An inverted range is almost certainly a typo — swap rather than
    // returning zero results.
    if (
      next.min !== undefined &&
      next.max !== undefined &&
      next.min > next.max
    ) {
      onRangeChange({ min: next.max, max: next.min })
      return
    }

    onRangeChange(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const minId = React.useId()
  const maxId = React.useId()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Price per night
      </legend>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor={minId} className="sr-only">
            Minimum price per night
          </label>
          <Input
            id={minId}
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={bounds ? `$${bounds.min}` : "Min"}
            value={draft.min}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, min: event.target.value }))
            }
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        </div>
        <span aria-hidden="true" className="text-muted-foreground">
          —
        </span>
        <div className="flex-1">
          <label htmlFor={maxId} className="sr-only">
            Maximum price per night
          </label>
          <Input
            id={maxId}
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={bounds ? `$${bounds.max}` : "Max"}
            value={draft.max}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, max: event.target.value }))
            }
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </fieldset>
  )
}
