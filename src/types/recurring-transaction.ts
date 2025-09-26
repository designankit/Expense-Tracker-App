import { RecurringTransaction, RecurringTransactionInsert, RecurringTransactionUpdate } from './database'

export type { RecurringTransaction, RecurringTransactionInsert, RecurringTransactionUpdate }

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface CreateRecurringTransaction {
  title: string
  amount: number
  category?: string
  transaction_type: 'income' | 'expense'
  frequency: Frequency
  start_date: string
  end_date?: string
}

export interface RecurringTransactionFormData extends CreateRecurringTransaction {
  is_recurring: boolean
}

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

export function calculateNextDueDate(
  frequency: Frequency,
  currentDate: Date
): Date {
  const nextDate = new Date(currentDate)
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }
  
  return nextDate
}

export function formatFrequency(frequency: Frequency): string {
  return FREQUENCY_OPTIONS.find(option => option.value === frequency)?.label || frequency
}
