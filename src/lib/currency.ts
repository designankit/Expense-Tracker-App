// Currency symbols and formatting
export const CURRENCY_CONFIG = {
  INR: { symbol: "₹", code: "INR", locale: "en-IN" },
  USD: { symbol: "$", code: "USD", locale: "en-US" },
  EUR: { symbol: "€", code: "EUR", locale: "en-EU" },
  GBP: { symbol: "£", code: "GBP", locale: "en-GB" },
  JPY: { symbol: "¥", code: "JPY", locale: "ja-JP" },
  CAD: { symbol: "C$", code: "CAD", locale: "en-CA" },
  AUD: { symbol: "A$", code: "AUD", locale: "en-AU" }
} as const

export type CurrencyCode = keyof typeof CURRENCY_CONFIG

export function formatCurrency(amount: number, currency: CurrencyCode = "INR"): string {
  const config = CURRENCY_CONFIG[currency]
  
  if (!config) {
    console.warn(`Unknown currency: ${currency}, falling back to INR`)
    return formatCurrency(amount, "INR")
  }

  // For currencies that don't use decimals (like JPY)
  const decimals = currency === "JPY" ? 0 : 2
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `${config.symbol}${amount.toFixed(decimals)}`
  }
}

export function getCurrencySymbol(currency: CurrencyCode = "INR"): string {
  return CURRENCY_CONFIG[currency]?.symbol || "₹"
}

// Convert amount from one currency to another (simplified - in production you'd use real exchange rates)
export function convertCurrency(
  amount: number, 
  fromCurrency: CurrencyCode, 
  toCurrency: CurrencyCode
): number {
  // This is a simplified conversion - in production you'd fetch real exchange rates
  const exchangeRates: Record<string, number> = {
    "INR": 1,
    "USD": 83.5, // 1 USD = 83.5 INR
    "EUR": 91.2, // 1 EUR = 91.2 INR
    "GBP": 105.8, // 1 GBP = 105.8 INR
    "JPY": 0.56, // 1 JPY = 0.56 INR
    "CAD": 61.2, // 1 CAD = 61.2 INR
    "AUD": 54.8, // 1 AUD = 54.8 INR
  }

  if (fromCurrency === toCurrency) return amount
  
  // Convert to INR first, then to target currency
  const inrAmount = amount * exchangeRates[fromCurrency]
  return inrAmount / exchangeRates[toCurrency]
}

// Get user's currency preference from session/database
// Note: This function should be called from server-side API routes only
// For client-side usage, use the session data instead
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserCurrency(_userId: string): Promise<CurrencyCode> {
  // This function is deprecated - use session data instead
  console.warn("getUserCurrency is deprecated. Use session data instead.")
  return "INR"
}
