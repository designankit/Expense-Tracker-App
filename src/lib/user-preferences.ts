import { supabase } from './supabaseClient'

export interface UserPreferences {
  timezone: string
  budget_style: string
  default_savings_percentage: number
  selected_categories: string[]
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  timezone: 'Asia/Kolkata',
  budget_style: 'balanced',
  default_savings_percentage: 20,
  selected_categories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare']
}

/**
 * Get user preferences from the database
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('timezone, budget_style, default_savings_percentage, selected_categories')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      console.warn('Could not fetch user preferences, using defaults:', error)
      return DEFAULT_PREFERENCES
    }

    return {
      timezone: (profile as Record<string, unknown>).timezone as string || DEFAULT_PREFERENCES.timezone,
      budget_style: (profile as Record<string, unknown>).budget_style as string || DEFAULT_PREFERENCES.budget_style,
      default_savings_percentage: (profile as Record<string, unknown>).default_savings_percentage as number || DEFAULT_PREFERENCES.default_savings_percentage,
      selected_categories: (profile as Record<string, unknown>).selected_categories as string[] || DEFAULT_PREFERENCES.selected_categories
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Format currency as INR
 */
export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    console.warn('Intl.NumberFormat failed, falling back to manual formatting:', error)
    return `₹${amount.toLocaleString('en-IN')}`
  }
}

// Note: Language support has been removed. All text is now in English only.
