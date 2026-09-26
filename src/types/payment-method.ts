/** A saved card — masked details only, never a full number or CVC. */
export type PaymentMethod = {
  id: string
  brand: string
  last4: string
  /** "MM/YY", built from the stored month and year. */
  expiry: string
  cardholderName: string
  isDefault: boolean
}
