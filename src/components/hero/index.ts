/**
 * Hero section — public surface.
 *
 * Drop-in usage:
 *   <HeroSection onSearch={(values) => ...} />
 *
 * Or compose the pieces yourself; every field below is controlled.
 */

export { HeroSection, type HeroSectionProps } from "./hero-section"
export { HeroContent, type HeroContentProps } from "./hero-content"
export { SearchBar, type SearchBarProps } from "./search-bar"
export { LocationInput, type LocationInputProps } from "./location-input"
export {
  CheckInDatePicker,
  CheckOutDatePicker,
  type DatePickerFieldProps,
} from "./date-picker-field"
export { GuestSelector, type GuestSelectorProps } from "./guest-selector"
export { SearchButton, type SearchButtonProps } from "./search-button"
export { SearchFieldTrigger, type SearchFieldTriggerProps } from "./search-field"

export type { GuestCounts, SearchValues } from "./types"
export { DEFAULT_SEARCH_VALUES, EMPTY_GUESTS, formatGuests } from "./utils"
