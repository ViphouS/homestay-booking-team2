import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database"
import type { PaymentMethod } from "@/types/payment-method"

/**
 * Saved cards, backed by the `payment_methods` table. Only masked details
 * (brand, last 4, expiry) are ever sent — the table has no column that could
 * hold a full card number or CVC.
 */

type PaymentMethodRow = Database["public"]["Tables"]["payment_methods"]["Row"]

function toPaymentMethod(row: PaymentMethodRow): PaymentMethod {
  const month = String(row.exp_month).padStart(2, "0")
  const year = String(row.exp_year).slice(-2)
  return {
    id: row.id,
    brand: row.brand,
    last4: row.last4,
    expiry: `${month}/${year}`,
    cardholderName: row.cardholder_name,
    isDefault: row.is_default,
  }
}

export async function listPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(toPaymentMethod)
}

export type AddPaymentMethodInput = {
  cardholderName: string
  cardNumber: string
  /** "MM/YY" or "MM/YYYY". */
  expiry: string
}

/** Guesses a card brand from its leading digits — display-only, never real validation. */
function detectBrand(digits: string): string {
  if (digits.startsWith("4")) return "Visa"
  if (/^5[1-5]/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "Amex"
  return "Card"
}

function parseExpiry(expiry: string): { month: number; year: number } {
  const match = expiry.trim().match(/^(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/)
  const month = match ? Number(match[1]) : NaN
  if (!match || month < 1 || month > 12) {
    throw new Error("Enter the expiry as MM/YY.")
  }
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2])
  return { month, year }
}

export async function addPaymentMethod(
  input: AddPaymentMethodInput
): Promise<void> {
  const digits = input.cardNumber.replace(/\s/g, "")
  if (!/^\d{12,19}$/.test(digits)) {
    throw new Error("Enter a valid card number.")
  }
  const { month, year } = parseExpiry(input.expiry)

  // Only the masked parts leave the browser.
  const { error } = await supabase.from("payment_methods").insert({
    brand: detectBrand(digits),
    last4: digits.slice(-4),
    exp_month: month,
    exp_year: year,
    cardholder_name: input.cardholderName.trim(),
  })
  if (error) throw new Error(error.message)
}

export async function removePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase.from("payment_methods").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
