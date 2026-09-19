import * as React from "react"
import { cn } from "cn"

import { Input } from "@/components/ui/input"

import {
  searchFieldClassName,
  searchFieldLabelClassName,
  searchFieldValueClassName,
} from "./utils"

export type LocationInputProps = {
  value: string
  onValueChange: (value: string) => void
  label?: string
  placeholder?: string
  /** Set when several instances share a page, to keep the label association unique. */
  id?: string
  className?: string
}

/**
 * Free-text destination field.
 *
 * Controlled — the parent owns the value. Swap the `Input` for a combobox
 * later without changing this component's contract.
 */
export function LocationInput({
  value,
  onValueChange,
  label = "Where to?",
  placeholder = "Search destinations",
  id,
  className,
}: LocationInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn(searchFieldClassName, className)}>
      <label htmlFor={inputId} className={searchFieldLabelClassName}>
        {label}
      </label>
      <Input
        id={inputId}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          searchFieldValueClassName,
          "h-auto rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-sm"
        )}
      />
    </div>
  )
}
