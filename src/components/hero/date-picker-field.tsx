import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent } from "@/components/ui/popover"

import { SearchFieldTrigger } from "./search-field"
import { formatSearchDate, startOfToday } from "./utils"

export type DatePickerFieldProps = {
  value: Date | undefined
  onValueChange: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  /** Earliest selectable date. Defaults to today. */
  minDate?: Date
  className?: string
}

/**
 * Shared implementation behind {@link CheckInDatePicker} and
 * {@link CheckOutDatePicker}. Not exported — consume one of those two so the
 * copy and the min-date rules stay consistent across the app.
 */
function DatePickerField({
  value,
  onValueChange,
  label,
  placeholder,
  minDate,
  className,
}: DatePickerFieldProps & { label: string; placeholder: string }) {
  const [open, setOpen] = React.useState(false)
  const earliest = minDate ?? startOfToday()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <SearchFieldTrigger
        label={label}
        value={formatSearchDate(value, placeholder)}
        isPlaceholder={!value}
        className={className}
      />
      <PopoverContent align="start" className="w-auto p-2">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value ?? earliest}
          startMonth={earliest}
          disabled={{ before: earliest }}
          onSelect={(date) => {
            onValueChange(date)
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** Arrival date. Cannot be set earlier than today. */
export function CheckInDatePicker({
  label = "Check in",
  placeholder = "Add date",
  ...props
}: DatePickerFieldProps) {
  return <DatePickerField label={label} placeholder={placeholder} {...props} />
}

/**
 * Departure date. Pass `minDate={checkIn}` so a traveller cannot pick a
 * departure before their arrival.
 */
export function CheckOutDatePicker({
  label = "Check out",
  placeholder = "Add date",
  ...props
}: DatePickerFieldProps) {
  return <DatePickerField label={label} placeholder={placeholder} {...props} />
}
