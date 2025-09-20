"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { Expense } from "@/types/expense"
import { Savings } from "@/types/savings"
import { formatCurrency, getLocalizedText } from "@/lib/user-preferences"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

// Currency formatting function - now using user preferences
const formatCurrencyWithPreferences = (amount: number, currency: string, language: string): string => {
  return formatCurrency(amount, currency, language)
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
  const { preferences } = useUserPreferences()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savings, setSavings] = useState<Savings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    window.addEventListener('refreshDashboard', handleRefresh)
    return () => window.removeEventListener('refreshDashboard', handleRefresh)
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

  // Calculate monthly budget progress (assuming ₹50,000 budget)
  const getBudgetProgress = () => {
    const { totalExpenses } = getCurrentMonthData()
    const monthlyBudget = 50000
    const progress = Math.min((totalExpenses / monthlyBudget) * 100, 100)
    const isOverBudget = totalExpenses > monthlyBudget

    return { progress, isOverBudget, totalExpenses, monthlyBudget }
  }

  // Calculate savings goal progress
  const getSavingsGoalProgress = () => {
    if (!savings || savings.length === 0) {
      return { progress: 0, totalTarget: 0, totalSaved: 0 }
    }

    const totalTarget = savings.reduce((sum, goal) => sum + (goal.target_amount || 0), 0)
    const totalSaved = savings.reduce((sum, goal) => sum + (goal.saved_amount || 0), 0)
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

    return { progress, totalTarget, totalSaved }
  }

  // Calculate expense category breakdown
  const getCategoryBreakdown = () => {
    if (!expenses || expenses.length === 0) return []
    
    const categoryTotals = expenses
      .filter(expense => expense && expense.transaction_type === 'expense')
      .reduce((acc, expense) => {
        const category = expense.category || 'Other'
        const amount = expense.amount || 0
        acc[category] = (acc[category] || 0) + amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount || 0,
      percentage: 0 // Will be calculated after we have total
    }))
  }

  // Calculate recent transactions (last 10)
  const getRecentTransactions = () => {
    if (!expenses || expenses.length === 0) return []
    
    return expenses
      .slice(0, 10)
      .map(expense => ({
        ...expense,
        formattedAmount: formatCurrencyWithPreferences(expense.amount || 0, preferences.currency, preferences.language),
        formattedDate: expense.transaction_date 
          ? new Date(expense.transaction_date).toLocaleDateString(preferences.language === 'hi' ? 'hi-IN' : 'en-US', {
              month: 'short',
              day: 'numeric'
            })
          : 'Unknown Date'
      }))
  }

  // Calculate monthly income vs expenses for the last 6 months
  const getMonthlyTrends = () => {
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
  const categoryData = getCategoryBreakdown()
  const recentTransactions = getRecentTransactions()
  const monthlyTrends = getMonthlyTrends()

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
        {/* Top Row - KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* This Month's Income */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    {getLocalizedText('dashboard.income', preferences.language)}
                  </CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatCurrencyWithPreferences(totalIncome, preferences.currency, preferences.language)}
                  </div>
                  <div className="flex items-center text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {getLocalizedText('dashboard.incomeSources', preferences.language)}
                  </div>
                  <div className="mt-3 w-full bg-green-200/30 dark:bg-green-800/30 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
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
              <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50 dark:border-red-800/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                    {getLocalizedText('dashboard.expenses', preferences.language)}
                  </CardTitle>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {formatCurrencyWithPreferences(totalExpenses, preferences.currency, preferences.language)}
                  </div>
                  <div className="flex items-center text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    {getLocalizedText('dashboard.totalSpending', preferences.language)}
                  </div>
                  <div className="mt-3 w-full bg-red-200/30 dark:bg-red-800/30 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full w-2/3 transition-all duration-1000"></div>
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
              <Card className={`hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group ${
                monthlySavings >= 0 
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-800/50'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-800/50'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    monthlySavings >= 0 
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-orange-700 dark:text-orange-300'
                  }`}>
                    {getLocalizedText('dashboard.savings', preferences.language)}
                  </CardTitle>
                  <div className={`p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                    monthlySavings >= 0 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      : 'bg-gradient-to-br from-orange-500 to-red-600'
                  }`}>
                    <PiggyBank className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold mb-2 ${
                    monthlySavings >= 0 
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatCurrencyWithPreferences(monthlySavings, preferences.currency, preferences.language)}
                  </div>
                  <div className={`flex items-center text-xs mt-1 ${
                    monthlySavings >= 0 
                      ? 'text-emerald-600/70 dark:text-emerald-400/70'
                      : 'text-orange-600/70 dark:text-orange-400/70'
                  }`}>
                    {monthlySavings >= 0 ? (
                      <>
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {getLocalizedText('dashboard.positiveSavings', preferences.language)}
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        {getLocalizedText('dashboard.overBudget', preferences.language)}
                      </>
                    )}
                  </div>
                  <div className={`mt-3 w-full rounded-full h-2 ${
                    monthlySavings >= 0 
                      ? 'bg-emerald-200/30 dark:bg-emerald-800/30'
                      : 'bg-orange-200/30 dark:bg-orange-800/30'
                  }`}>
                    <div className={`h-2 rounded-full transition-all duration-1000 ${
                      monthlySavings >= 0 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-4/5'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 w-3/5'
                    }`}></div>
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
              <Card className={`hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group ${
                savingsRate >= 20 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50'
                  : savingsRate >= 10
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200/50 dark:border-amber-800/50'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50 dark:border-red-800/50'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    savingsRate >= 20 
                      ? 'text-blue-700 dark:text-blue-300'
                      : savingsRate >= 10
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {getLocalizedText('dashboard.savingsRate', preferences.language)}
                  </CardTitle>
                  <div className={`p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                    savingsRate >= 20 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : savingsRate >= 10
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
                      : 'bg-gradient-to-br from-red-500 to-rose-600'
                  }`}>
                    <Target className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold mb-2 ${
                    savingsRate >= 20 
                      ? 'text-blue-600 dark:text-blue-400'
                      : savingsRate >= 10
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(savingsRate)}
                  </div>
                  <div className={`flex items-center text-xs mt-1 ${
                    savingsRate >= 20 
                      ? 'text-blue-600/70 dark:text-blue-400/70'
                      : savingsRate >= 10
                      ? 'text-amber-600/70 dark:text-amber-400/70'
                      : 'text-red-600/70 dark:text-red-400/70'
                  }`}>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Savings ÷ Income × 100
                  </div>
                  <div className={`mt-3 w-full rounded-full h-2 ${
                    savingsRate >= 20 
                      ? 'bg-blue-200/30 dark:bg-blue-800/30'
                      : savingsRate >= 10
                      ? 'bg-amber-200/30 dark:bg-amber-800/30'
                      : 'bg-red-200/30 dark:bg-red-800/30'
                  }`}>
                    <div className={`h-2 rounded-full transition-all duration-1000 ${
                      savingsRate >= 20 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : savingsRate >= 10
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`} style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Budget Progress */}
          <Card className={`lg:col-span-1 hover:shadow-lg transition-all duration-300 ${
            budgetData.isOverBudget 
              ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50 dark:border-red-800/50'
              : 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-800/50'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                budgetData.isOverBudget 
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}>
                <div className={`p-2 rounded-lg ${
                  budgetData.isOverBudget 
                    ? 'bg-red-100 dark:bg-red-900/40'
                    : 'bg-emerald-100 dark:bg-emerald-900/40'
                }`}>
                  <Wallet className="h-5 w-5" />
                </div>
                {getLocalizedText('dashboard.budgetProgress', preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{getLocalizedText('dashboard.spentThisMonth', preferences.language)}</span>
                  <span className={`font-medium ${
                    budgetData.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {formatCurrencyWithPreferences(budgetData.totalExpenses, preferences.currency, preferences.language)}
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={budgetData.progress} 
                    className={`h-3 ${
                      budgetData.isOverBudget ? '[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-600' : '[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-600'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-medium ${
                      budgetData.isOverBudget ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {formatPercentage(budgetData.progress)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{getLocalizedText('dashboard.budget', preferences.language)}: {formatCurrencyWithPreferences(budgetData.monthlyBudget, preferences.currency, preferences.language)}</span>
                  <span className={budgetData.isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                    {budgetData.isOverBudget ? getLocalizedText('dashboard.overBudget', preferences.language) : getLocalizedText('dashboard.onTrack', preferences.language)}
                  </span>
                </div>
              </div>
              {budgetData.isOverBudget && (
                <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>Over budget by {formatCurrencyWithPreferences(budgetData.totalExpenses - budgetData.monthlyBudget, preferences.currency, preferences.language)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Savings Goal Progress */}
          <Card className="lg:col-span-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <PiggyBank className="h-5 w-5" />
                </div>
                {getLocalizedText('dashboard.savingsGoal', preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {savings.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saved amount</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrencyWithPreferences(savingsGoalData.totalSaved, preferences.currency, preferences.language)}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={savingsGoalData.progress} 
                        className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-600" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {formatPercentage(savingsGoalData.progress)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {formatCurrencyWithPreferences(savingsGoalData.totalTarget, preferences.currency, preferences.language)}</span>
                      <span className="text-blue-500">On Track</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">Active Goals:</div>
                    {savings.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="flex justify-between items-center p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                        <span className="truncate text-sm font-medium">{goal.goal_name}</span>
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:text-blue-300">
                          {formatPercentage((goal.saved_amount / goal.target_amount) * 100)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <PiggyBank className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium">No savings goals set</p>
                  <p className="text-xs mt-1">Create your first savings goal to track progress</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Category Breakdown */}
          <Card className="lg:col-span-1 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <BarChart3 className="h-5 w-5" />
                </div>
                {getLocalizedText('dashboard.categoryBreakdown', preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryDataWithPercentages.length > 0 ? (
                <div className="h-80 relative">
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
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        strokeWidth={0}
                        animationBegin={0}
                        animationDuration={1500}
                        label={({ name, percentage }) => (
                          <text 
                            x={0} 
                            y={0} 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            className="fill-current text-xs font-medium"
                          >
                            {(percentage as number) > 5 ? `${name}\n${(percentage as number).toFixed(1)}%` : ''}
                          </text>
                        )}
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
                                  <div>Amount: {formatCurrencyWithPreferences(data.value || 0, preferences.currency, preferences.language)}</div>
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
                  
                  {/* Legend */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="grid grid-cols-2 gap-2 max-h-20 overflow-y-auto">
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
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{getLocalizedText('dashboard.noExpenseData', preferences.language)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Trends + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200/50 dark:border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/40">
                  <Activity className="h-5 w-5" />
                </div>
                {getLocalizedText('dashboard.recentTransactions', preferences.language)}
              </CardTitle>
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
                    <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium">{getLocalizedText('dashboard.noTransactions', preferences.language)}</p>
                    <p className="text-xs mt-1">{getLocalizedText('dashboard.recentTransactionsWillAppear', preferences.language)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expenses Chart */}
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200/50 dark:border-indigo-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <Calendar className="h-5 w-5" />
                </div>
                {getLocalizedText('dashboard.incomeVsExpenses', preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      tickFormatter={(value) => formatCurrencyWithPreferences(value, preferences.currency, preferences.language)} 
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
                                    {formatCurrencyWithPreferences(entry?.value as number || 0, preferences.currency, preferences.language)}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
