"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Expense } from "@/types/expense"
import { formatCurrency } from "@/lib/format"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RecentExpensesProps {
  expenses: Expense[]
}

const categoryColors = {
  // Expense categories
  Food: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Transportation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Healthcare: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  Travel: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Bills: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  // Income categories
  Salary: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Freelance: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  Investment: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  Business: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Gift: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  Bonus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Rental: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const formatAmount = (amount: number) => formatCurrency(amount, "INR")
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5)

  return (
    <TooltipProvider>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold">Recent Expenses</CardTitle>
              <p className="text-xs text-muted-foreground">Your latest financial activity</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <p className="text-sm sm:text-base font-medium">No expenses yet</p>
                <p className="text-xs sm:text-sm">Add your first expense or income to get started</p>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <Tooltip key={expense.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-muted/30 p-3 rounded-lg transition-all duration-200 group hover:shadow-sm">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          expense.transaction_type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        } group-hover:scale-125 transition-transform duration-200`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{expense.title || 'No description'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(expense.transaction_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge className={`text-xs px-2 py-1 rounded-lg ${categoryColors[expense.category as keyof typeof categoryColors] || categoryColors.Other} hidden sm:inline-flex`}>
                          {expense.category}
                        </Badge>
                        <span className={`text-xs font-semibold ${
                          expense.transaction_type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {expense.transaction_type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{expense.title || 'No description'}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} • {new Date(expense.transaction_date).toLocaleString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}