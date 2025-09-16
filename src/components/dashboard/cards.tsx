"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  PiggyBank, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react"
import { formatPercentage } from "@/lib/format"
import { Expense } from "@/types/expense"
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


export function Cards({ expenses }: CardsProps) {
  const formatAmount = (amount: number) => formatCurrency(amount, "INR")
  
  // Helper functions for calculations
  const getTotalExpenses = () => {
    return expenses
      .filter(expense => expense.transaction_type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalThisMonthExpenses = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'expense' &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalIncome = () => {
    return expenses
      .filter(expense => expense.transaction_type === 'income')
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getTotalThisMonthIncome = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'income' &&
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  // Calculate real data
  const totalExpenses = getTotalExpenses()
  const thisMonthExpenses = getTotalThisMonthExpenses()
  const totalIncome = getTotalIncome()
  const thisMonthIncome = getTotalThisMonthIncome()
  
  // Calculate savings rate (income - expenses = savings)
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
                <div className={`p-2 rounded-xl ${getTotalExpensesColor()} group-hover:scale-110 transition-transform duration-300`}>
                  {getTotalExpensesIcon()}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{formatAmount(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  All time expenses
                </p>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total amount spent across all expense categories</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month
                </CardTitle>
                <div className={`p-2 rounded-xl ${getThisMonthColor()} group-hover:scale-110 transition-transform duration-300`}>
                  {getThisMonthIcon()}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-red-400">{formatAmount(thisMonthExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  Current month expenses
                </p>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-1.5 rounded-full w-2/3 transition-all duration-500"></div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Expenses for the current month</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <div className="p-2 rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{formatAmount(totalIncome)}</div>
                <p className="text-xs text-muted-foreground">
                  All time income
                </p>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total income from all sources</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
                <div className={`p-2 rounded-xl ${getSavingsRateColor()} group-hover:scale-110 transition-transform duration-300`}>
                  {getSavingsRateIcon()}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatPercentage(savingsRate)}</div>
                <p className="text-xs text-muted-foreground">
                  This month&apos;s savings
                </p>
                <div className="w-full bg-muted/30 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    savingsRate < 0 ? 'bg-gradient-to-r from-red-500 to-red-600 w-1/4' :
                    savingsRate < 10 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 w-1/3' :
                    savingsRate < 30 ? 'bg-gradient-to-r from-blue-500 to-blue-600 w-2/3' :
                    'bg-gradient-to-r from-green-500 to-green-600 w-4/5'
                  }`}></div>
                </div>
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