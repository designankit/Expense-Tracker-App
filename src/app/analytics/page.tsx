"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartSkeleton, SummaryCardSkeleton } from "@/components/ui/loading-skeletons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { formatCurrency } from "@/lib/user-preferences"
import { supabase } from "@/lib/supabaseClient"
import { useSupabase } from "@/components/supabase-provider"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar,
  Filter,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Repeat
} from "lucide-react"

// Types
interface Transaction {
  id: string
  user_id: string
  title: string
  amount: number
  category: string | null
  transaction_date: string | null
  transaction_type: 'income' | 'expense'
  created_at: string
}

interface SavingsGoal {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  saved_amount: number
  target_date: string | null
  priority: 'High' | 'Medium' | 'Low'
  goal_icon: string
  description: string | null
  created_at: string
}

// Color palettes
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#06b6d4'
}

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
]

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useSupabase()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError)
          setTransactions([])
        } else {
          setTransactions(transactionsData || [])
        }

        // Fetch savings goals
        const { data: savingsData, error: savingsError } = await supabase
          .from('savings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (savingsError) {
          console.error('Error fetching savings goals:', savingsError)
          setSavingsGoals([])
        } else {
          setSavingsGoals(savingsData || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching data:', error)
        setTransactions([])
        setSavingsGoals([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Filter transactions based on time range and category
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Apply time range filter
    const now = new Date()
    const filterDate = new Date()

    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.transaction_date || t.created_at)
      return transactionDate >= filterDate
    })

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    return filtered
  }, [transactions, timeRange, categoryFilter])

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))]
    return uniqueCategories
  }, [transactions])

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netFlow = income - expenses
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

    return { income, expenses, netFlow, savingsRate }
  }, [filteredTransactions])

  // Calculate financial health score
  const financialHealthScore = useMemo(() => {
    const { income, expenses, savingsRate } = financialMetrics
    
    let score = 0
    
    // Savings rate component (40% of score)
    if (savingsRate >= 20) score += 40
    else if (savingsRate >= 10) score += 30
    else if (savingsRate >= 5) score += 20
    else if (savingsRate > 0) score += 10
    
    // Income vs expenses ratio (30% of score)
    if (income > expenses) score += 30
    else if (income > expenses * 0.8) score += 20
    else if (income > expenses * 0.6) score += 10
    
    // Budget adherence (30% of score)
    score += 30
    
    return Math.min(100, Math.max(0, score))
  }, [financialMetrics])

  // Prepare data for charts
  const incomeExpensesData = useMemo(() => {
    const data: { [key: string]: { income: number; expenses: number; date: string } } = {}
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date || transaction.created_at)
      const key = timeRange === 'week' 
        ? date.toISOString().split('T')[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!data[key]) {
        data[key] = { income: 0, expenses: 0, date: key }
      }
      
      if (transaction.transaction_type === 'income') {
        data[key].income += transaction.amount
      } else {
        data[key].expenses += transaction.amount
      }
    })
    
    return Object.values(data).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredTransactions, timeRange])

  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {}
    
    filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Uncategorized'
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount
      })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions])

  const topCategories = categoryData.slice(0, 3)

  // Savings insights
  const savingsInsights = useMemo(() => {
    const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.saved_amount, 0)
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const progressPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
    
    // Calculate monthly savings rate
    const monthlyIncome = financialMetrics.income
    const monthlySavings = financialMetrics.netFlow
    const monthlySavingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0
    
    // Predict time to reach next goal
    const nextGoal = savingsGoals.find(goal => goal.saved_amount < goal.target_amount)
    let predictionText = "No active savings goals"
    
    if (nextGoal && monthlySavings > 0) {
      const remainingAmount = nextGoal.target_amount - nextGoal.saved_amount
      const monthsToGoal = Math.ceil(remainingAmount / monthlySavings)
      predictionText = `At your current saving rate, you'll reach ${nextGoal.goal_name} in ${monthsToGoal} months.`
    }
    
    return {
      totalSaved,
      totalTarget,
      progressPercentage,
      monthlySavingsRate,
      predictionText
    }
  }, [savingsGoals, financialMetrics])

  // Recurring transactions analysis
  const recurringTransactions = useMemo(() => {
    const recurring: { [key: string]: { title: string; category: string | null; amount: number; count: number; lastDate: string } } = {}
    
    filteredTransactions.forEach(transaction => {
      const key = `${transaction.title}-${transaction.category}-${transaction.amount}`
      if (recurring[key]) {
        recurring[key].count += 1
        const transactionDate = new Date(transaction.transaction_date || transaction.created_at)
        const lastDate = new Date(recurring[key].lastDate)
        if (transactionDate > lastDate) {
          recurring[key].lastDate = transaction.transaction_date || transaction.created_at
        }
      } else {
        recurring[key] = {
          title: transaction.title,
          category: transaction.category,
          amount: transaction.amount,
          count: 1,
          lastDate: transaction.transaction_date || transaction.created_at
        }
      }
    })
    
    return Object.values(recurring)
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredTransactions])

  if (isLoading || authLoading) {
    return (
      <AuthGuard requireOnboarding={true}>
        <AppLayout>
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </div>
            <ChartSkeleton />
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  // Show empty state if no data
  if (transactions.length === 0 && savingsGoals.length === 0) {
    return (
      <AuthGuard requireOnboarding={true}>
        <AppLayout>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
                <p className="text-muted-foreground mb-4">
                  {user?.id 
                    ? 'Start by adding some expenses or income to see your analytics.'
                    : 'Please log in to view your analytics.'
                  }
                </p>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireOnboarding={true}>
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Your financial insights and trends
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last month</SelectItem>
                      <SelectItem value="year">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category || ''}>
                          {category || 'Uncategorized'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Health Score */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Financial Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{financialHealthScore}/100</span>
                  <Badge variant={financialHealthScore >= 70 ? "default" : financialHealthScore >= 40 ? "secondary" : "destructive"}>
                    {financialHealthScore >= 70 ? "Excellent" : financialHealthScore >= 40 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
                <Progress value={financialHealthScore} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {financialHealthScore >= 70 
                    ? "Great job! You're managing your finances well."
                    : financialHealthScore >= 40 
                    ? "You're on the right track. Consider increasing your savings rate."
                    : "Focus on reducing expenses and increasing your savings rate."
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(financialMetrics.income)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {formatCurrency(financialMetrics.expenses)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-rose-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Net Flow</p>
                    <p className={`text-2xl font-bold ${financialMetrics.netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(financialMetrics.netFlow)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                    <p className="text-2xl font-bold text-slate-600">
                      {financialMetrics.savingsRate.toFixed(1)}%
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-slate-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expenses Trends */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Income vs Expenses Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeExpensesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke={CHART_COLORS.success}
                      fill={CHART_COLORS.success}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke={CHART_COLORS.danger}
                      fill={CHART_COLORS.danger}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((category.amount / financialMetrics.expenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Insights */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Savings Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(savingsInsights.totalSaved)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-600">
                      {formatCurrency(savingsInsights.totalTarget)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Target</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {savingsInsights.progressPercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{savingsInsights.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={savingsInsights.progressPercentage} className="h-2" />
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">💡 Insight</p>
                  <p className="text-sm text-muted-foreground">{savingsInsights.predictionText}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Transactions */}
          {recurringTransactions.length > 0 && (
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Recurring Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {recurringTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-slate-500 rounded-full" />
                          <div>
                            <p className="font-medium">{transaction.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.category || 'Uncategorized'} • {transaction.count} times
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            Last: {new Date(transaction.lastDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  )
}