/**
 * Format a number as currency using Intl.NumberFormat
 * @param amount - The number to format
 * @param currency - The currency code (default: 'INR')
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Formatted currency string like "₹1,234.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format an ISO date string to a readable format
 * @param iso - ISO date string (e.g., "2024-01-15")
 * @param format - Format type: 'short', 'long', 'iso' (default: 'short')
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Formatted date string
 */
export function formatDate(
  iso: string,
  format: 'short' | 'long' | 'iso' = 'short',
  locale: string = 'en-IN'
): string {
  const date = new Date(iso)
  
  // Validate date
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  switch (format) {
    case 'iso':
      return iso // Return as-is for ISO format
    case 'long':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    case 'short':
    default:
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
  }
}

/**
 * Format a date for display in tables/lists (compact format)
 * @param iso - ISO date string
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Compact date string like "15 Jan 2024"
 */
export function formatDateCompact(iso: string, locale: string = 'en-IN'): string {
  const date = new Date(iso)
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Format a date relative to now (e.g., "2 days ago", "yesterday")
 * @param iso - ISO date string
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Relative date string
 */
export function formatDateRelative(iso: string, locale: string = 'en-IN'): string {
  const date = new Date(iso)
  const now = new Date()
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffInMs = date.getTime() - now.getTime()
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60))
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.round(diffInMs / (1000 * 60))
      return rtf.format(diffInMinutes, 'minute')
    }
    return rtf.format(diffInHours, 'hour')
  }

  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, 'day')
  }

  if (Math.abs(diffInDays) < 30) {
    const diffInWeeks = Math.round(diffInDays / 7)
    return rtf.format(diffInWeeks, 'week')
  }

  if (Math.abs(diffInDays) < 365) {
    const diffInMonths = Math.round(diffInDays / 30)
    return rtf.format(diffInMonths, 'month')
  }

  const diffInYears = Math.round(diffInDays / 365)
  return rtf.format(diffInYears, 'year')
}

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Formatted number string like "1,234"
 */
export function formatNumber(num: number, locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format a percentage
 * @param value - The decimal value (e.g., 0.15 for 15%)
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Formatted percentage string like "15%"
 */
export function formatPercentage(value: number, locale: string = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}
