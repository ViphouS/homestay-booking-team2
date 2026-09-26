import * as React from "react"
import type { FormEvent } from "react"
import { CreditCard } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  addPaymentMethod,
  listPaymentMethods,
  removePaymentMethod,
} from "@/lib/payment-methods-client"
import type { PaymentMethod } from "@/types/payment-method"

/**
 * "Payment Methods" tab content.
 *
 * Saved cards from the `payment_methods` table. No real payment processing:
 * only masked card data (brand, last 4, expiry — never the full number) is
 * sent to the database. The first card saved becomes the default.
 */
export function PaymentMethods() {
  const { user } = useAuth()

  const [methods, setMethods] = React.useState<PaymentMethod[] | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)
  const [cardholderName, setCardholderName] = React.useState("")
  const [cardNumber, setCardNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const refresh = React.useCallback((userId: string) => {
    return listPaymentMethods(userId).then(setMethods)
  }, [])

  React.useEffect(() => {
    if (!user) return
    refresh(user.id)
  }, [user, refresh])

  if (!user) return null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    setIsSaving(true)
    try {
      await addPaymentMethod({
        cardNumber,
        expiry,
        cardholderName,
      })
      await refresh(user.id)
      setCardholderName("")
      setCardNumber("")
      setExpiry("")
      setIsAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    setError(null)
    try {
      await removePaymentMethod(id)
      await refresh(user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && !isAdding ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {methods === null ? (
        <p className="text-sm text-muted-foreground">
          Loading your payment methods…
        </p>
      ) : methods.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground">
          No saved payment methods yet.
        </p>
      ) : methods.length > 0 ? (
        <div className="flex flex-col gap-3">
          {methods.map((method) => (
            <Card key={method.id} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {method.brand} •••• {method.last4}
                      {method.isDefault ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {method.cardholderName} · Expires {method.expiry}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(method.id)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-name">Name on card</Label>
            <Input
              id="payment-name"
              required
              value={cardholderName}
              onChange={(event) => setCardholderName(event.target.value)}
              placeholder="Sokha Chan"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-number">Card number</Label>
            <Input
              id="payment-number"
              required
              inputMode="numeric"
              maxLength={19}
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              placeholder="1234 1234 1234 1234"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-expiry">Expiry</Label>
            <Input
              id="payment-expiry"
              required
              placeholder="MM/YY"
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save card"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => setIsAdding(true)}
        >
          Add payment method
        </Button>
      )}
    </div>
  )
}

export default PaymentMethods
