"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react"
import { formatPercentage } from "@/lib/format"
import { Expense } from "@/lib/api"
// Currency formatting function
const formatCurrency = (amount: number, currency: string = "INR"): string => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
  }
  return `${symbols[currency as keyof typeof symbols] || "₹"}${amount.toLocaleString()}`
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CardsProps {
  expenses: Expense[]
}

function IconBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className={`h-8 w-8 rounded-md flex items-center justify-center ${color}`}>
      {children}
    </div>
  )
}

export function Cards({ expenses }: CardsProps) {
  const formatAmount = (amount: number) => formatCurrency(amount, "INR")
  
  // Helper functions for calculations
  const getTotal = () => {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalThisMonth = () => {
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

  const getByCategory = () => {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)
  }
  
  // Calculate real data
  const totalExpenses = getTotal()
  const thisMonthExpenses = getTotalThisMonth()
  const categoriesData = getByCategory()
  const uniqueCategories = Object.keys(categoriesData).length
  
  // Calculate savings rate (simplified: assume income - expenses = savings)
  const thisMonthIncome = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return (
        expense.type === 'income' &&
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, expense) => sum + expense.amount, 0)
  
  const savingsRate = thisMonthIncome > 0 
    ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 
    : 0

  // Dynamic icon and color selection based on data
  const getTotalExpensesIcon = () => {
    if (totalExpenses === 0) return <AlertCircle className="h-4 w-4" />
    if (totalExpenses < 1000) return <Wallet className="h-4 w-4" />
    if (totalExpenses < 10000) return <DollarSign className="h-4 w-4" />
    return <BarChart3 className="h-4 w-4" />
  }

  const getTotalExpensesColor = () => {
    if (totalExpenses === 0) return "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
    if (totalExpenses < 1000) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    if (totalExpenses < 10000) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
  }

  const getThisMonthIcon = () => {
    if (thisMonthExpenses === 0) return <CheckCircle className="h-4 w-4" />
    if (thisMonthExpenses < 500) return <TrendingDown className="h-4 w-4" />
    if (thisMonthExpenses > totalExpenses * 0.1) return <TrendingUp className="h-4 w-4" />
    return <Zap className="h-4 w-4" />
  }

  const getThisMonthColor = () => {
    if (thisMonthExpenses === 0) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
    if (thisMonthExpenses < 500) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    if (thisMonthExpenses < 2000) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
    return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
  }

  const getCategoriesIcon = () => {
    if (uniqueCategories === 0) return <XCircle className="h-4 w-4" />
    if (uniqueCategories < 3) return <CreditCard className="h-4 w-4" />
    if (uniqueCategories < 6) return <BarChart3 className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  const getCategoriesColor = () => {
    if (uniqueCategories === 0) return "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300"
    if (uniqueCategories < 3) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    if (uniqueCategories < 6) return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
  }

  const getSavingsRateIcon = () => {
    if (savingsRate < 0) return <XCircle className="h-4 w-4" />
    if (savingsRate < 10) return <AlertCircle className="h-4 w-4" />
    if (savingsRate < 30) return <TrendingUp className="h-4 w-4" />
    return <PiggyBank className="h-4 w-4" />
  }

  const getSavingsRateColor = () => {
    if (savingsRate < 0) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    if (savingsRate < 10) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
    if (savingsRate < 30) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <IconBadge color={getTotalExpensesColor()}>
                  {getTotalExpensesIcon()}
                </IconBadge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  All time expenses
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total amount spent across all categories</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <IconBadge color={getThisMonthColor()}>
                  {getThisMonthIcon()}
                </IconBadge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(thisMonthExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  Current month expenses
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Expenses for the current month</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <IconBadge color={getCategoriesColor()}>
                  {getCategoriesIcon()}
                </IconBadge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueCategories}</div>
                <p className="text-xs text-muted-foreground">
                  Active categories
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Number of expense categories used</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <IconBadge color={getSavingsRateColor()}>
                  {getSavingsRateIcon()}
                </IconBadge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(savingsRate / 100)}</div>
                <p className="text-xs text-muted-foreground">
                  This month savings
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentage of income saved this month</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
