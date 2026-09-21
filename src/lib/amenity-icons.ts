// src/lib/amenity-icons.ts
//
// Your listings store facilities and experiences as plain strings
// (e.g. "Free bicycles"), so this picks an icon by looking for keywords in the
// text. Anything that doesn't match gets a check mark. To give a new keyword
// its own icon, add a line to RULES — earlier lines win.

import {
  Bike,
  Wifi,
  Utensils,
  Waves,
  Ship,
  Bath,
  Bed,
  Sunrise,
  Sprout,
  Fan,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const RULES: Array<[RegExp, LucideIcon]> = [
  [/bike|bicycle|cycl/i, Bike],
  [/wi-?fi|internet/i, Wifi],
  [/meal|breakfast|lunch|dinner|cook|kitchen|food|dining/i, Utensils],
  [/boat|kayak|canoe|ferry|cruise/i, Ship],
  [/lake|pond|pool|swim|river|water/i, Waves],
  [/shower|bath|toilet/i, Bath],
  [/bed|linen|sheet/i, Bed],
  [/sunrise|sunset|view|balcony|terrace|veranda/i, Sunrise],
  [/farm|harvest|plant|garden|pepper|fruit|orchard|rice/i, Sprout],
  [/air.?con|fan|cooling/i, Fan],
];

export function getIconForLabel(label: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(label)) return icon;
  }
  return Check;
}