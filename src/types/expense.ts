export interface Expense {
  id: string
  user_id: string
  title: string
  amount: number
  category: string
  transaction_date: string
  transaction_type: 'income' | 'expense'
  created_at: string
}

export interface CreateExpense {
  title: string
  amount: number
  category: string
  transaction_date: string
  transaction_type: 'income' | 'expense'
}
