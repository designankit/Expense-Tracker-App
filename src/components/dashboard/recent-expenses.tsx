"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Expense } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { useCurrency } from "@/hooks/use-currency"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RecentExpensesProps {
  expenses: Expense[]
}

const categoryColors: Record<string, string> = {
  Food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Transportation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Bills: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Healthcare: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  Shopping: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  Education: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Travel: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  Salary: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Freelance: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  Investment: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  Business: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  Gift: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const { formatAmount } = useCurrency()
  
  // Get recent expenses (last 5, sorted by date descending)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm">Add your first expense or income to get started</p>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <Tooltip key={expense.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          expense.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{expense.note || 'No description'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={categoryColors[expense.category] || categoryColors.Other}>
                          {expense.category}
                        </Badge>
                        <span className={`text-sm font-medium ${
                          expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expense.type === 'income' ? 'Income' : 'Expense'} - {expense.note || 'No description'}</p>
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