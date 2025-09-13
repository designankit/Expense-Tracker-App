export interface Expense {
  id: string
  amount: number
  category: string
  type: 'expense' | 'income'
  date: string
  note?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseData {
  amount: number
  category: string
  type: 'expense' | 'income'
  date: string
  note?: string
}

export interface UpdateExpenseData extends CreateExpenseData {
  id: string
}

class ApiService {
  private baseUrl = '/api'

  async getExpenses(): Promise<Expense[]> {
    try {
      console.log('API: Fetching expenses from:', `${this.baseUrl}/expenses`)
      const response = await fetch(`${this.baseUrl}/expenses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are included
      })
      
      console.log('API: Response status:', response.status)
      console.log('API: Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API: Error response:', errorText)
        throw new Error(`Failed to fetch expenses: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API: Expenses fetched successfully:', data.length, 'items')
      return data
    } catch (error) {
      console.error('API: Fetch error:', error)
      throw error
    }
  }

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await fetch(`${this.baseUrl}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create expense')
    }
    return response.json()
  }

  async updateExpense(data: UpdateExpenseData): Promise<Expense> {
    const response = await fetch(`${this.baseUrl}/expenses/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update expense')
    }
    return response.json()
  }

  async deleteExpense(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error('Failed to delete expense')
    }
  }

  // Helper methods for calculations
  getTotal(expenses: Expense[]): number {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  getTotalThisMonth(expenses: Expense[]): number {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return (
          expense.type === 'expense' &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  getByCategory(expenses: Expense[]): { category: string; total: number }[] {
    const categoryTotals = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total
    }))
  }

  getMonthlyTotals(expenses: Expense[], months = 6): { month: string; expenses: number; income: number }[] {
    const now = new Date()
    const result: { month: string; expenses: number; income: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })

      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        )
      })

      const expenseTotal = monthExpenses
        .filter((expense) => expense.type === 'expense')
        .reduce((sum, expense) => sum + expense.amount, 0)

      const incomeTotal = monthExpenses
        .filter((expense) => expense.type === 'income')
        .reduce((sum, expense) => sum + expense.amount, 0)

      result.push({
        month: monthKey,
        expenses: expenseTotal,
        income: incomeTotal,
      })
    }

    return result
  }
}

export const apiService = new ApiService()
