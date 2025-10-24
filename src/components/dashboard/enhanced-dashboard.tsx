"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Expense } from "@/types/expense"
import { Savings } from "@/types/savings"
import { formatCurrency } from "@/lib/user-preferences"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Target,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { UpcomingRecurring } from "./upcoming-recurring"

// Currency formatting function
const formatCurrencyWithPreferences = (amount: number): string => {
  return formatCurrency(amount)
}

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

interface EnhancedDashboardProps {
  className?: string
  onRefresh?: () => void
}

export function EnhancedDashboard({ className }: EnhancedDashboardProps) {
  const { user, supabase } = useSupabase()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savings, setSavings] = useState<Savings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecentTransactionsMonth, setSelectedRecentTransactionsMonth] = useState<string>('current')
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState<string>('current')
  const [selectedCategoryMonth, setSelectedCategoryMonth] = useState<string>('current')
  const [selectedIncomeExpensesYear, setSelectedIncomeExpensesYear] = useState<string>('current')

  // Refresh function to re-fetch data
  const refreshData = useCallback(async () => {
    if (!user || !supabase) return

    try {
      setLoading(true)
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (expensesError) throw expensesError

      const { data: savingsData, error: savingsError } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (savingsError) throw savingsError

      setExpenses(expensesData || [])
      setSavings(savingsData || [])
      console.log('Dashboard data refreshed:', expensesData?.length || 0, 'expenses,', savingsData?.length || 0, 'savings')
    } catch (err) {
      console.error('Error refreshing dashboard data:', err)
      setError('Failed to refresh dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Fetch all data from Supabase
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Dashboard received refresh event')
      refreshData()
    }

    const handleTransactionAdded = () => {
      console.log('Dashboard detected transactionAdded')
      refreshData()
    }

    window.addEventListener('refreshDashboard', handleRefresh)
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh)
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [refreshData])

  // Calculate KPIs for current month
  const getCurrentMonthData = () => {
    if (!expenses || expenses.length === 0) {
      return { totalIncome: 0, totalExpenses: 0, monthlySavings: 0, savingsRate: 0 }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthExpenses = expenses.filter(expense => {
      if (!expense || !expense.transaction_date) return false
      const expenseDate = new Date(expense.transaction_date)
      return (
        expense.transaction_type === 'expense' &&
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      )
    })

    const currentMonthIncome = expenses.filter(expense => {
      if (!expense || !expense.transaction_date) return false
      const expenseDate = new Date(expense.transaction_date)
      return (
        expense.transaction_type === 'income' &&
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      )
    })

    const totalIncome = currentMonthIncome.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const savings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

    return { totalIncome, totalExpenses, monthlySavings: savings, savingsRate }
  }


  // Calculate monthly budget progress with month filter
  const getBudgetProgress = () => {
    let totalExpenses = 0
    let totalIncome = 0
    const monthlyBudget = 50000
    
    if (selectedBudgetMonth === 'current') {
      // Use current month data
      const currentData = getCurrentMonthData()
      totalExpenses = currentData.totalExpenses
      totalIncome = currentData.totalIncome
    } else {
      // Filter for specific month
      const [year, month] = selectedBudgetMonth.split('-').map(Number)
      
      const monthExpenses = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'expense' &&
          expenseDate.getFullYear() === year &&
          expenseDate.getMonth() === month
        )
      })
      
      const monthIncome = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'income' &&
          expenseDate.getFullYear() === year &&
          expenseDate.getMonth() === month
        )
      })
      
      totalExpenses = monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      totalIncome = monthIncome.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    }
    
    const progress = Math.min((totalExpenses / monthlyBudget) * 100, 100)
    const isOverBudget = totalExpenses > monthlyBudget

    return { 
      progress, 
      isOverBudget, 
      totalExpenses, 
      totalIncome,
      monthlyBudget
    }
  }

  // Calculate progress bar percentages for top row cards
  const getProgressPercentages = () => {
    const { totalIncome, totalExpenses, monthlySavings } = getCurrentMonthData()
    
    // Income progress (scaled to ₹100,000 max for better visualization)
    const incomeProgress = Math.min((totalIncome / 100000) * 100, 100)
    
    // Expenses progress (scaled to ₹100,000 max for better visualization)
    const expensesProgress = Math.min((totalExpenses / 100000) * 100, 100)
    
    // Savings progress (scaled to ₹50,000 max for better visualization)
    const savingsProgress = Math.min(Math.abs(monthlySavings) / 50000 * 100, 100)
    
    return { incomeProgress, expensesProgress, savingsProgress }
  }

  // Calculate savings goal progress
  const getSavingsGoalProgress = () => {
    if (!savings || savings.length === 0) {
      return { progress: 0, totalTarget: 0, totalSaved: 0, filteredSavings: [] }
    }

    const totalTarget = savings.reduce((sum, goal) => sum + (goal.target_amount || 0), 0)
    const totalSaved = savings.reduce((sum, goal) => sum + (goal.saved_amount || 0), 0)
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return { progress, totalTarget, totalSaved, filteredSavings: savings }
  }

  // Calculate expense category breakdown
  const getCategoryBreakdown = (monthFilter?: string) => {
    if (!expenses || expenses.length === 0) return []
    
    // Filter expenses by month if specified
    let filteredExpenses = expenses
    if (monthFilter && monthFilter !== 'current') {
      const [year, month] = monthFilter.split('-').map(Number)
      
      filteredExpenses = expenses.filter(expense => {
        if (!expense.transaction_date) return true
        const expenseDate = new Date(expense.transaction_date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
      })
    }
    
    const categoryTotals = filteredExpenses
      .filter(expense => expense && expense.transaction_type === 'expense')
      .reduce((acc, expense) => {
        const category = expense.category || 'Other'
        const amount = expense.amount || 0
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(categoryTotals)
      .filter(([category, amount]) => category && amount > 0) // Filter out invalid entries
      .map(([category, amount]) => ({
        name: category.trim() || 'Other', // Ensure name is valid
        value: amount || 0,
        percentage: 0 // Will be calculated after we have total
      }))
      .sort((a, b) => b.value - a.value) // Sort by amount descending
  }

  // Get available months for filtering (from user account creation to current month)
  const getAvailableMonths = () => {
    if (!user?.created_at) return []
    
    const months = []
    const currentDate = new Date()
    const accountCreationDate = new Date(user.created_at)
    
    // Start from the month when user created account
    const startDate = new Date(accountCreationDate.getFullYear(), accountCreationDate.getMonth(), 1)
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    
    // Generate months from account creation to current month
    const currentMonth = new Date()
    let iterDate = new Date(startDate)
    
    while (iterDate <= endDate) {
      const isCurrentMonth = iterDate.getFullYear() === currentMonth.getFullYear() && 
                            iterDate.getMonth() === currentMonth.getMonth()
      
      months.push({
        key: `${iterDate.getFullYear()}-${iterDate.getMonth()}`,
        label: iterDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isCurrent: isCurrentMonth,
        year: iterDate.getFullYear(),
        month: iterDate.getMonth()
      })
      
      // Move to next month
      iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 1)
    }
    
    // Sort newest first
    return months.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }


  // Get available years for filtering (keep for other components)
  const getAvailableYears = () => {
    if (!expenses || expenses.length === 0) return []
    
    const yearsSet = new Set<number>()
    const currentDate = new Date()
    
    // Add current year
    yearsSet.add(currentDate.getFullYear())
    
    // Add years from existing transactions
    expenses.forEach(expense => {
      if (expense && expense.transaction_date) {
        const expenseDate = new Date(expense.transaction_date)
        yearsSet.add(expenseDate.getFullYear())
      }
    })
    
    // Convert to array and sort (newest first)
    return Array.from(yearsSet)
      .sort((a, b) => b - a)
      .map(year => ({
        key: year.toString(),
        label: year.toString(),
        isCurrent: year === currentDate.getFullYear()
      }))
  }

  // Calculate recent transactions with month filter
  const getRecentTransactions = () => {
    if (!expenses || expenses.length === 0) return []
    
    let filteredExpenses = expenses
    
    // Apply month filter
    if (selectedRecentTransactionsMonth === 'current') {
      // Filter for current month
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      
      filteredExpenses = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth
      })
    } else {
      // Filter for specific month
      const [year, month] = selectedRecentTransactionsMonth.split('-').map(Number)
      
      filteredExpenses = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return expenseDate.getFullYear() === year && expenseDate.getMonth() === month
      })
    }
    
    // Sort by transaction date (newest first) and limit to 10
    return filteredExpenses
      .sort((a, b) => {
        if (!a.transaction_date || !b.transaction_date) return 0
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      })
      .slice(0, 10)
      .map(expense => ({
        ...expense,
        formattedAmount: formatCurrencyWithPreferences(expense.amount || 0),
        formattedDate: expense.transaction_date 
          ? new Date(expense.transaction_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
          : 'Unknown Date'
      }))
  }

  // Calculate monthly income vs expenses for the last 6 months or specific year
  const getMonthlyTrends = (yearFilter?: string) => {
    if (!expenses || expenses.length === 0) {
      // Return empty months if no data
      const now = new Date()
      const months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString('en-US', { month: 'short' })
        months.push({
          month: monthName,
          income: 0,
          expenses: 0
        })
      }
      return months
    }
    
    // If specific year is selected, show monthly data for that year
    if (yearFilter && yearFilter !== 'current') {
      const targetYear = parseInt(yearFilter)
      const months = []
      
      // Generate all 12 months for the selected year
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(targetYear, month, 1).toLocaleDateString('en-US', { month: 'short' })
        
        const monthExpenses = expenses.filter(expense => {
          if (!expense || !expense.transaction_date) return false
          const expenseDate = new Date(expense.transaction_date)
          return (
            expense.transaction_type === 'expense' &&
            expenseDate.getMonth() === month &&
            expenseDate.getFullYear() === targetYear
          )
        })
        
        const monthIncome = expenses.filter(expense => {
          if (!expense || !expense.transaction_date) return false
          const expenseDate = new Date(expense.transaction_date)
          return (
            expense.transaction_type === 'income' &&
            expenseDate.getMonth() === month &&
            expenseDate.getFullYear() === targetYear
          )
        })
        
        months.push({
          month: monthName,
          income: monthIncome.reduce((sum, expense) => sum + (expense.amount || 0), 0),
          expenses: monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
        })
      }
      
      return months
    }
    
    // Default: show last 6 months
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthExpenses = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'expense' &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        )
      })
      
      const monthIncome = expenses.filter(expense => {
        if (!expense || !expense.transaction_date) return false
        const expenseDate = new Date(expense.transaction_date)
        return (
          expense.transaction_type === 'income' &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        )
      })
      
      months.push({
        month: monthName,
        income: monthIncome.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        expenses: monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      })
    }
    
    return months
  }

  // Enhanced color palette for charts with gradients
  const COLORS = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6'
  ]

  const GRADIENT_COLORS = [
    { from: '#8B5CF6', to: '#A855F7' }, // Purple
    { from: '#06B6D4', to: '#0891B2' }, // Cyan
    { from: '#10B981', to: '#059669' }, // Green
    { from: '#F59E0B', to: '#D97706' }, // Amber
    { from: '#EF4444', to: '#DC2626' }, // Red
    { from: '#EC4899', to: '#DB2777' }, // Pink
    { from: '#6366F1', to: '#4F46E5' }, // Indigo
    { from: '#84CC16', to: '#65A30D' }, // Lime
    { from: '#F97316', to: '#EA580C' }, // Orange
    { from: '#14B8A6', to: '#0D9488' }  // Teal
  ]

  const { totalIncome, totalExpenses, monthlySavings, savingsRate } = getCurrentMonthData()
  const budgetData = getBudgetProgress()
  const savingsGoalData = getSavingsGoalProgress()
  const categoryData = getCategoryBreakdown(selectedCategoryMonth)
  const recentTransactions = getRecentTransactions()
  const monthlyTrends = getMonthlyTrends(selectedIncomeExpensesYear)
  const { incomeProgress, expensesProgress, savingsProgress } = getProgressPercentages()

  // Calculate percentages for category breakdown
  const totalExpenseAmount = categoryData.reduce((sum, cat) => sum + cat.value, 0)
  const categoryDataWithPercentages = categoryData.map(cat => ({
    ...cat,
    percentage: totalExpenseAmount > 0 ? (cat.value / totalExpenseAmount) * 100 : 0
  }))

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Monthly Summary Widget */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <BarChart3 className="h-5 w-5" />
              </div>
              This Month&apos;s Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income */}
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  {formatCurrencyWithPreferences(totalIncome)}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">Income</div>
              </div>
              
              {/* Expenses */}
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-1">
                  {formatCurrencyWithPreferences(totalExpenses)}
                </div>
                <div className="text-sm text-rose-600 dark:text-rose-300 font-medium">Expenses</div>
              </div>
              
              {/* Savings */}
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  monthlySavings >= 0 
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {formatCurrencyWithPreferences(monthlySavings)}
                </div>
                <div className={`text-sm font-medium ${
                  monthlySavings >= 0 
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-orange-600 dark:text-orange-300'
                }`}>
                  Savings ({formatPercentage(savingsRate)})
                </div>
              </div>
            </div>
            
            {/* Difference indicator */}
            <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center justify-center gap-2">
                {monthlySavings >= 0 ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">
                      You saved {formatCurrencyWithPreferences(monthlySavings)} this month
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-600 dark:text-orange-300 font-medium">
                      You overspent by {formatCurrencyWithPreferences(Math.abs(monthlySavings))} this month
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Row - KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* This Month's Income */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Income
                  </CardTitle>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    {formatCurrencyWithPreferences(totalIncome)}
                  </div>
                  <div className="flex items-center text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Income Sources
                  </div>
                  <div className="mt-3 w-full bg-emerald-200/40 dark:bg-emerald-900/40 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${incomeProgress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300">
                        {incomeProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total income received this month</p>
            </TooltipContent>
          </Tooltip>

          {/* This Month's Expenses */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expenses
                  </CardTitle>
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                    {formatCurrencyWithPreferences(totalExpenses)}
                  </div>
                  <div className="flex items-center text-xs text-rose-700/70 dark:text-rose-400/70 mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Total Spending
                  </div>
                  <div className="mt-3 w-full bg-rose-200/40 dark:bg-rose-900/40 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-red-600 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${expensesProgress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-300">
                        {expensesProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total expenses this month</p>
            </TooltipContent>
          </Tooltip>

          {/* This Month's Savings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-900/20 border-gray-200 dark:border-gray-800`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium text-muted-foreground`}>
                    Savings
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${
                    monthlySavings >= 0 
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-orange-50 text-orange-600'
                  }`}>
                    <PiggyBank className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold mb-2 ${
                    monthlySavings >= 0 
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatCurrencyWithPreferences(monthlySavings)}
                  </div>
                  <div className={`flex items-center text-xs mt-1 ${
                    monthlySavings >= 0 
                      ? 'text-emerald-700/70 dark:text-emerald-400/70'
                      : 'text-orange-700/70 dark:text-orange-400/70'
                  }`}>
                    {monthlySavings >= 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Positive Savings
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        Over Budget
                      </>
                    )}
                  </div>
                  <div className={`mt-3 w-full rounded-full h-3 relative ${
                    monthlySavings >= 0 
                      ? 'bg-emerald-200/40 dark:bg-emerald-900/40'
                      : 'bg-orange-200/40 dark:bg-orange-900/40'
                  }`}>
                    <div 
                      className={`h-3 rounded-full transition-all duration-700 ${
                        monthlySavings >= 0 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                          : 'bg-gradient-to-r from-orange-500 to-amber-600'
                      }`}
                      style={{ 
                        width: `${savingsProgress}%` 
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-bold ${
                        monthlySavings >= 0 
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-orange-600 dark:text-orange-300'
                      }`}>
                        {savingsProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Savings = Income - Expenses</p>
            </TooltipContent>
          </Tooltip>

          {/* Savings Rate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-900/20 border-gray-200 dark:border-gray-800`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium text-muted-foreground`}>
                    Savings Rate
                  </CardTitle>
                  <div className={`p-3 rounded-xl ${
                    savingsRate >= 20 
                      ? 'bg-emerald-50 text-emerald-600'
                      : savingsRate >= 10
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    <Target className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold mb-2 ${
                    savingsRate >= 20 
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : savingsRate >= 10
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {formatPercentage(savingsRate)}
                  </div>
                  <div className={`flex items-center text-xs mt-1 ${
                    savingsRate >= 20 
                      ? 'text-emerald-700/70 dark:text-emerald-400/70'
                      : savingsRate >= 10
                      ? 'text-amber-700/70 dark:text-amber-400/70'
                      : 'text-rose-700/70 dark:text-rose-400/70'
                  }`}>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Savings ÷ Income × 100
                  </div>
                  <div className={`mt-3 w-full rounded-full h-3 relative ${
                    savingsRate >= 20 
                      ? 'bg-emerald-200/40 dark:bg-emerald-900/40'
                      : savingsRate >= 10
                      ? 'bg-amber-200/40 dark:bg-amber-900/40'
                      : 'bg-rose-200/40 dark:bg-rose-900/40'
                  }`}>
                    <div className={`h-3 rounded-full transition-all duration-700 ${
                      savingsRate >= 20 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                        : savingsRate >= 10
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`} style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-bold ${
                        savingsRate >= 20 
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : savingsRate >= 10
                          ? 'text-amber-600 dark:text-amber-300'
                          : 'text-rose-600 dark:text-rose-300'
                      }`}>
                        {Math.min(savingsRate, 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Savings Rate = (Savings ÷ Income) × 100</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Middle Row - Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Recurring Transactions */}
          <UpcomingRecurring />

          {/* Monthly Budget Progress */}
          <Card className={`hover:shadow-xl transition-all duration-300 ${
            budgetData.isOverBudget 
              ? 'bg-gradient-to-br from-red-50/80 to-rose-50/80 border-red-200/60 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800/60'
              : 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-emerald-200/60 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800/60'
          } backdrop-blur-sm`}>
            <CardHeader className="pb-6">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-start gap-3 text-emerald-900 dark:text-emerald-100 mb-4">
                    <div className={`p-3 rounded-xl shadow-lg flex-shrink-0 ${
                      budgetData.isOverBudget 
                        ? 'bg-gradient-to-br from-red-500 to-rose-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold mb-1">Budget Progress</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
                        {selectedBudgetMonth === 'current' 
                          ? 'Current month budget tracking' 
                          : `Monthly budget tracking for ${getAvailableMonths().find(m => m.key === selectedBudgetMonth)?.label || 'selected month'}`
                        }
                      </div>
                    </div>
                  </CardTitle>
                  
                  {/* Status indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      budgetData.progress >= 100 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : budgetData.progress >= 80
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {budgetData.progress >= 100 
                        ? '🚨 Budget Exceeded' 
                        : budgetData.progress >= 80
                        ? '⚠️ Budget Alert'
                        : '✅ On Track'
                      }
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {budgetData.progress >= 100 
                        ? 'Consider reducing expenses' 
                        : budgetData.progress >= 80
                        ? 'Monitor your spending'
                        : 'Keep up the good work!'
                      }
                    </div>
                  </div>
                </div>
                
                {/* Month Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Filter by month:</div>
                  <Select value={selectedBudgetMonth} onValueChange={setSelectedBudgetMonth}>
                    <SelectTrigger className="w-full sm:w-52 h-10 text-sm border-2 border-emerald-200 dark:border-emerald-800 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <SelectValue placeholder="Select month" className="truncate text-left" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm min-w-[220px]">
                      <SelectItem value="current" className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm flex-shrink-0"></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-300">Current</div>
                          </div>
                        </div>
                      </SelectItem>
                      {getAvailableMonths().filter(month => !month.isCurrent).map((month) => (
                        <SelectItem key={month.key} value={month.key} className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm flex-shrink-0"></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-700 dark:text-gray-300">{month.label}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Progress Section */}
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="space-y-4">
                  {/* Spending Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {selectedBudgetMonth === 'current' 
                          ? 'Spent This Month' 
                          : `Spent in ${getAvailableMonths().find(m => m.key === selectedBudgetMonth)?.label || 'selected month'}`
                        }
                      </div>
                      <div className={`text-2xl font-bold ${
                        budgetData.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {formatCurrencyWithPreferences(budgetData.totalExpenses)}
                      </div>
                    </div>
                    <div className="space-y-2 text-left sm:text-right">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Budget
                      </div>
                      <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrencyWithPreferences(budgetData.monthlyBudget)}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className={`w-full h-6 rounded-full overflow-hidden shadow-inner ${
                        budgetData.progress >= 100 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : budgetData.progress >= 80
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            budgetData.progress >= 100 
                              ? 'bg-gradient-to-r from-red-500 via-red-500 to-red-600' 
                              : budgetData.progress >= 80
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600'
                              : 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600'
                          }`}
                          style={{ width: `${Math.min(budgetData.progress, 100)}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap ${
                          budgetData.progress >= 100 
                            ? 'text-red-700 bg-red-100/80 dark:text-red-200 dark:bg-red-900/50' 
                            : budgetData.progress >= 80
                            ? 'text-amber-700 bg-amber-100/80 dark:text-amber-200 dark:bg-amber-900/50'
                            : 'text-emerald-700 bg-emerald-100/80 dark:text-emerald-200 dark:bg-emerald-900/50'
                        }`}>
                          {formatPercentage(budgetData.progress)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                      <div className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                        budgetData.progress >= 100 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : budgetData.progress >= 80
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {budgetData.progress >= 100 
                          ? '🚨 Over Budget' 
                          : budgetData.progress >= 80
                          ? '⚠️ Near Limit'
                          : '✅ Under Budget'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Budget Metrics */}
                <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Budget Metrics</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Remaining</span>
                      <span className={`font-semibold text-right ml-2 ${
                        (budgetData.monthlyBudget - budgetData.totalExpenses) > 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrencyWithPreferences(Math.max(0, budgetData.monthlyBudget - budgetData.totalExpenses))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Daily Average</span>
                      <span className="font-semibold text-right ml-2 text-gray-700 dark:text-gray-300">
                        {formatCurrencyWithPreferences(budgetData.totalExpenses / new Date().getDate())}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Projected</span>
                      <span className="font-semibold text-right ml-2 text-gray-700 dark:text-gray-300">
                        {formatCurrencyWithPreferences((budgetData.totalExpenses / new Date().getDate()) * 30)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monthly Summary */}
                <div className="bg-white/40 dark:bg-gray-800/40 rounded-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Monthly Summary</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Income</span>
                      <span className="font-semibold text-right ml-2 text-green-600 dark:text-green-400">
                        {formatCurrencyWithPreferences(budgetData.totalIncome)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Savings</span>
                      <span className={`font-semibold text-right ml-2 ${
                        (budgetData.totalIncome - budgetData.totalExpenses) >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {formatCurrencyWithPreferences(budgetData.totalIncome - budgetData.totalExpenses)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">Savings Rate</span>
                      <span className={`font-semibold text-right ml-2 ${
                        ((budgetData.totalIncome - budgetData.totalExpenses) / budgetData.totalIncome * 100) >= 20
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : ((budgetData.totalIncome - budgetData.totalExpenses) / budgetData.totalIncome * 100) >= 10
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {budgetData.totalIncome > 0 ? formatPercentage((budgetData.totalIncome - budgetData.totalExpenses) / budgetData.totalIncome * 100) : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {budgetData.isOverBudget && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-red-700 dark:text-red-300">Budget Exceeded</div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      You&apos;ve overspent by {formatCurrencyWithPreferences(budgetData.totalExpenses - budgetData.monthlyBudget)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Goal Progress */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <PiggyBank className="h-5 w-5" />
                </div>
                Savings Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savingsGoalData.filteredSavings && savingsGoalData.filteredSavings.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saved amount</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyWithPreferences(savingsGoalData.totalSaved)}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={savingsGoalData.progress} 
                        className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-600" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-emerald-600">
                          {formatPercentage(savingsGoalData.progress)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {formatCurrencyWithPreferences(savingsGoalData.totalTarget)}</span>
                      <span className="text-emerald-600">On Track</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">Active Goals:</div>
                    {savingsGoalData.filteredSavings.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex justify-between items-center p-2 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">
                        <span className="truncate text-sm font-medium">{goal.goal_name}</span>
                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:text-emerald-300">
                          {formatPercentage((goal.saved_amount / goal.target_amount) * 100)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <PiggyBank className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">No goals set</p>
                  <p className="text-xs mt-1">Create your first savings goal to start tracking progress.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Category Breakdown */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  Category Breakdown
                </CardTitle>
                
                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Filter by month:</div>
                  <Select value={selectedCategoryMonth} onValueChange={setSelectedCategoryMonth}>
                    <SelectTrigger className="w-full sm:w-52 h-10 text-sm border-2 border-emerald-200 dark:border-emerald-800 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <SelectValue placeholder="Select month" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm min-w-[220px]">
                      <SelectItem value="current" className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm flex-shrink-0"></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-300">Current</div>
                          </div>
                        </div>
                      </SelectItem>
                      {getAvailableMonths().filter(month => !month.isCurrent).map((month) => (
                        <SelectItem key={month.key} value={month.key} className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm flex-shrink-0"></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-700 dark:text-gray-300 truncate">{month.label}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categoryDataWithPercentages && categoryDataWithPercentages.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <defs>
                        {GRADIENT_COLORS.map((gradient, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={gradient.from} />
                            <stop offset="100%" stopColor={gradient.to} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={categoryDataWithPercentages}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        strokeWidth={0}
                        animationBegin={0}
                        animationDuration={1500}
                        label={false}
                        labelLine={false}
                      >
                        {categoryDataWithPercentages.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#gradient-${index})`}
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        content={(props) => {
                          const { active, payload } = props || {};
                          if (active && payload && payload.length) {
                            const data = payload[0]?.payload;
                            if (!data) return null;
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: payload[0]?.color || '#8884d8' }}
                                  />
                                  <span className="font-medium text-sm">{data.name || 'Unknown'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <div>Amount: {formatCurrencyWithPreferences(data.value || 0)}</div>
                                  <div>Percentage: {(data.percentage || 0).toFixed(1)}%</div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2">
                    {categoryDataWithPercentages.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate text-muted-foreground">{entry.name}</span>
                        <span className="text-xs font-medium ml-auto">{entry.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium">No expenses yet</p>
                  <p className="text-xs mt-1">Categories will appear after your first transaction.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Bottom Row - Trends + Activity */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Transactions */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-gray-200/50 dark:border-gray-800/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40">
                    <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Recent Transactions</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      {selectedRecentTransactionsMonth === 'current' ? 'Current month activity' : `Transactions from ${getAvailableMonths().find(m => m.key === selectedRecentTransactionsMonth)?.label || 'selected month'}`}
                    </div>
                  </div>
                </CardTitle>
                
                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Filter by month:</div>
                  <Select value={selectedRecentTransactionsMonth} onValueChange={setSelectedRecentTransactionsMonth}>
                    <SelectTrigger className="w-full sm:w-56 h-11 text-sm border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-all duration-200 shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <SelectValue placeholder="Select month" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm min-w-[220px]">
                      <SelectItem value="current" className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm flex-shrink-0"></div>
                          <div className="min-w-0">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-300">Current</div>
                          </div>
                        </div>
                      </SelectItem>
                      {getAvailableMonths().filter(month => !month.isCurrent).map((month) => (
                        <SelectItem key={month.key} value={month.key} className="focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 dark:focus:from-emerald-900/30 dark:focus:to-teal-900/30 cursor-pointer">
                          <div className="flex items-center gap-3 py-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm flex-shrink-0"></div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-700 dark:text-gray-300 truncate">{month.label}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                        transaction.transaction_type === 'income' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/50 dark:border-green-800/50'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-red-200/50 dark:border-red-800/50'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-sm ${
                          transaction.transaction_type === 'income' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{transaction.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                transaction.transaction_type === 'income'
                                  ? 'border-green-300 text-green-700 dark:text-green-300'
                                  : 'border-red-300 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {transaction.category}
                            </Badge>
                            <span>{transaction.formattedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${
                        transaction.transaction_type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}{transaction.formattedAmount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">
                      {selectedRecentTransactionsMonth === 'current' 
                        ? 'No transactions yet' 
                        : `No transactions found for ${getAvailableMonths().find(m => m.key === selectedRecentTransactionsMonth)?.label || 'selected month'}`
                      }
                    </p>
                    <p className="text-xs mt-1">
                      {selectedRecentTransactionsMonth === 'current' 
                        ? 'Add your first expense to see it here.' 
                        : 'Try selecting a different month or add transactions for this period.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expenses Chart */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-indigo-200/50 dark:border-indigo-800/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                    <Calendar className="h-5 w-5" />
                  </div>
                  Income vs Expenses
                </CardTitle>
                
                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Filter by year:</div>
                  <Select value={selectedIncomeExpensesYear} onValueChange={setSelectedIncomeExpensesYear}>
                    <SelectTrigger className="w-full sm:w-40 h-9 text-sm border-2 border-indigo-200 dark:border-indigo-800 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        <SelectValue placeholder="Select year" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-sm">
                      <SelectItem value="current" className="focus:bg-gradient-to-r focus:from-indigo-50 focus:to-purple-50 dark:focus:from-indigo-900/30 dark:focus:to-purple-900/30 cursor-pointer">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                          <div>
                            <div className="font-semibold text-indigo-700 dark:text-indigo-300">Current</div>
                          </div>
                        </div>
                      </SelectItem>
                      {getAvailableYears().filter(year => !year.isCurrent).map((year) => (
                        <SelectItem key={year.key} value={year.key} className="focus:bg-gradient-to-r focus:from-indigo-50 focus:to-purple-50 dark:focus:from-indigo-900/30 dark:focus:to-purple-900/30 cursor-pointer">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm"></div>
                            <div>
                              <div className="font-semibold text-gray-700 dark:text-gray-300">{year.label}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {monthlyTrends.some(month => month.income > 0 || month.expenses > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="rgba(148, 163, 184, 0.2)" 
                        strokeOpacity={0.3}
                      />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: 'currentColor' }}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                        tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrencyWithPreferences(value)} 
                        tick={{ fontSize: 12, fill: 'currentColor' }}
                        axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                        tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                      />
                      <RechartsTooltip 
                        content={(props) => {
                          const { active, payload, label } = props || {};
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                                <div className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                  {label || 'Unknown Month'}
                                </div>
                                {payload.map((entry, index) => (
                                  <div key={index} className="flex items-center gap-2 mb-1">
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: entry?.color || '#8884d8' }}
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {entry?.dataKey === 'income' ? 'Income' : 'Expenses'}:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {formatCurrencyWithPreferences(entry?.value as number || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => (
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {value === 'income' ? 'Income' : value === 'expenses' ? 'Expenses' : value}
                          </span>
                        )}
                      />
                      <Bar 
                        dataKey="income" 
                        fill="url(#incomeGradient)" 
                        name="Income"
                        radius={[4, 4, 0, 0]}
                        animationBegin={0}
                        animationDuration={1500}
                      />
                      <Bar 
                        dataKey="expenses" 
                        fill="url(#expensesGradient)" 
                        name="Expenses"
                        radius={[4, 4, 0, 0]}
                        animationBegin={300}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 relative">
                  {/* Faded placeholder chart */}
                  <div className="absolute inset-0 opacity-30">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { month: 'Jan', income: 25000, expenses: 20000 },
                        { month: 'Feb', income: 30000, expenses: 22000 },
                        { month: 'Mar', income: 28000, expenses: 18000 },
                        { month: 'Apr', income: 32000, expenses: 25000 },
                        { month: 'May', income: 29000, expenses: 21000 },
                        { month: 'Jun', income: 35000, expenses: 23000 }
                      ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="placeholderIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
                          </linearGradient>
                          <linearGradient id="placeholderExpensesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#DC2626" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="rgba(148, 163, 184, 0.1)" 
                          strokeOpacity={0.2}
                        />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: 'rgba(148, 163, 184, 0.5)' }}
                          axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                          tickLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: 'rgba(148, 163, 184, 0.5)' }}
                          axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                          tickLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                        />
                        <Bar 
                          dataKey="income" 
                          fill="url(#placeholderIncomeGradient)" 
                          name="Income"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="expenses" 
                          fill="url(#placeholderExpensesGradient)" 
                          name="Expenses"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Overlay message */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/40 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-indigo-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {selectedIncomeExpensesYear === 'current' 
                          ? 'Add transactions to unlock insights' 
                          : 'No data for selected year'
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedIncomeExpensesYear === 'current' 
                          ? 'on your spending trends' 
                          : 'Try selecting a different year'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </TooltipProvider>
  )
}
