import { format, parseISO } from "date-fns"

/**
 * "12 Jan 2026" from an ISO date or timestamp.
 *
 * `parseISO` reads a date-only value like "2026-01-12" (what the database
 * returns for check-in/out) as local midnight; `new Date()` would read it as
 * UTC and could show the previous day west of Greenwich.
 */
export function formatDay(value: string): string {
  return format(parseISO(value), "dd MMM yyyy")
}
