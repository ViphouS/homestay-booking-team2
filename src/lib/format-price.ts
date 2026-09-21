// src/lib/format-price.ts
//
// Your Price type has { amount, currency, unit }. `currency` might be a symbol
// ("$") or a code ("USD") — this handles both so you don't have to care.

export function formatPrice(amount: number, currency: string): string {
  if (/^[A-Za-z]{3}$/.test(currency)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return `${currency}${amount}`;
}

/** "night", "/night" and "per night" all become "night". */
export function formatUnit(unit: string): string {
  return unit.replace(/^\s*\/?\s*(per\s+)?/i, "").trim() || "night";
}