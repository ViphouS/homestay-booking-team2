import type { PaymentMethod } from "@/types/payment-method"

/**
 * Mock payment methods "backend" — same swappable-mock pattern as
 * `auth-client.ts`. Only masked/derived card data is ever stored, matching
 * the "demo checkout, no real payment processed" note in `BookingModal`.
 */

const PAYMENT_METHODS_KEY = "jumrok-mock-payment-methods"

function readPaymentMethods(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(PAYMENT_METHODS_KEY)
    return raw ? (JSON.parse(raw) as PaymentMethod[]) : []
  } catch {
    return []
  }
}

function writePaymentMethods(methods: PaymentMethod[]) {
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods))
}

export async function listPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  return readPaymentMethods().filter((method) => method.userId === userId)
}

export type AddPaymentMethodInput = Omit<
  PaymentMethod,
  "id" | "brand" | "last4"
> & {
  cardNumber: string
}

/** Guesses a card brand from its leading digits — display-only, never real validation. */
function detectBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, "")
  if (digits.startsWith("4")) return "Visa"
  if (/^5[1-5]/.test(digits)) return "Mastercard"
  if (/^3[47]/.test(digits)) return "Amex"
  return "Card"
}

export async function addPaymentMethod(
  input: AddPaymentMethodInput
): Promise<PaymentMethod> {
  const digits = input.cardNumber.replace(/\s/g, "")

  const method: PaymentMethod = {
    id: crypto.randomUUID(),
    userId: input.userId,
    brand: detectBrand(digits),
    last4: digits.slice(-4),
    expiry: input.expiry,
    cardholderName: input.cardholderName,
  }

  writePaymentMethods([...readPaymentMethods(), method])

  return method
}

export async function removePaymentMethod(id: string): Promise<void> {
  writePaymentMethods(readPaymentMethods().filter((method) => method.id !== id))
}
