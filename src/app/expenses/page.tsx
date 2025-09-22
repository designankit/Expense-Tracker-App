"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
// Note: Language support removed
import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { Expense } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Currency formatting function
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`
}

// Date formatting function
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

type SortField = 'date' | 'amount' | 'category'
type SortDirection = 'asc' | 'desc'
type DateFilter = 'this-month' | 'last-month' | 'custom' | 'all'

interface FilterState {
  search: string
  category: string
  dateFilter: DateFilter
  customDateFrom: string
  customDateTo: string
}

interface ExpenseFormData {
  title: string
  amount: string
  category: string
  transaction_date: string
  transaction_type: 'income' | 'expense'
}

function ExpensesPageContent() {
  const { user, supabase } = useSupabase()
  // Note: Language preferences removed
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // State management
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedExpenseId, setHighlightedExpenseId] = useState<string | null>(null)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    dateFilter: 'all',
    customDateFrom: '',
    customDateTo: ''
  })
  const itemsPerPage = 10

  // Refresh function to force re-fetch
  const refreshExpenses = useCallback(async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (error) throw error

      setExpenses(data || [])
      console.log('Expenses refreshed:', data?.length || 0, 'expenses')
    } catch (err) {
      console.error('Error refreshing expenses:', err)
    }
  }, [user, supabase])

  // Handle search parameter from URL
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }))
    }
  }, [searchParams])

  // Handle highlight parameter from URL
  useEffect(() => {
    const highlightId = searchParams.get('highlight')
    if (highlightId) {
      setHighlightedExpenseId(highlightId)
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedExpenseId(null), 3000)
    }
  }, [searchParams])

  // Debug: Log when expenses state changes
  useEffect(() => {
    console.log('Expenses state updated:', expenses.length, 'expenses')
  }, [expenses])

  // Fetch expenses from Supabase
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user || !supabase) return

      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setExpenses(data || [])
      } catch (err) {
        console.error('Error fetching expenses:', err)
        setError('Failed to load expenses. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [user, supabase, toast])

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set(expenses.map(expense => expense.category).filter((category): category is string => Boolean(category)))
    return Array.from(categories).sort()
  }, [expenses])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter(expense => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = expense.title?.toLowerCase().includes(searchLower) || false
        const matchesCategory = expense.category?.toLowerCase().includes(searchLower) || false
        if (!matchesTitle && !matchesCategory) return false
      }

      // Category filter
      if (filters.category && filters.category !== 'all' && expense.category !== filters.category) {
        return false
      }

      // Date filter
      if (filters.dateFilter !== 'all' && expense.transaction_date) {
        const expenseDate = new Date(expense.transaction_date)
        const now = new Date()
        
        switch (filters.dateFilter) {
          case 'this-month':
            if (expenseDate.getMonth() !== now.getMonth() || expenseDate.getFullYear() !== now.getFullYear()) {
              return false
            }
            break
          case 'last-month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            if (expenseDate.getMonth() !== lastMonth.getMonth() || expenseDate.getFullYear() !== lastMonth.getFullYear()) {
              return false
            }
            break
          case 'custom':
            if (filters.customDateFrom) {
              const fromDate = new Date(filters.customDateFrom)
              if (expenseDate < fromDate) return false
            }
            if (filters.customDateTo) {
              const toDate = new Date(filters.customDateTo)
              if (expenseDate > toDate) return false
            }
            break
        }
      }

      return true
    })

    // Sort expenses
    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number

      switch (sortField) {
        case 'date':
          aValue = new Date(a.transaction_date || '').getTime()
          bValue = new Date(b.transaction_date || '').getTime()
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'category':
          aValue = a.category || ''
          bValue = b.category || ''
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [expenses, filters, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex)

  // Calculate summary data
  const summaryData = useMemo(() => {
    const now = new Date()
    const currentMonthExpenses = expenses.filter(expense => {
      if (!expense.transaction_date || expense.transaction_type !== 'expense') return false
      const expenseDate = new Date(expense.transaction_date)
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Category breakdown
    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      acc[category] = (acc[category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0
    })).sort((a, b) => b.value - a.value)

    return {
      totalSpent,
      categoryBreakdown
    }
  }, [expenses])

  // Handle form submission
  const handleSubmit = async (formData: ExpenseFormData) => {
    if (!user || !supabase) return

    setIsSubmitting(true)
    try {
      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        transaction_date: formData.transaction_date,
        transaction_type: formData.transaction_type,
        user_id: user.id
      }

      if (editingExpense) {
        // Update existing expense
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)
          .eq('user_id', user.id)

        if (error) throw error

        // Update local state
        setExpenses(prev => prev.map(expense => 
          expense.id === editingExpense.id 
            ? { ...expense, ...expenseData }
            : expense
        ))

        toast({
          title: "Success",
          description: "Expense updated successfully!",
        })

        // Trigger dashboard refresh
        console.log('Triggering dashboard refresh after expense update')
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
      } else {
        // Create new expense
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('expenses')
          .insert([expenseData])
          .select()

        if (error) throw error

        // Update local state
        if (data && data[0]) {
          console.log('Adding new expense to state:', data[0])
          setExpenses(prev => {
            const newExpenses = [data[0], ...prev]
            console.log('Updated expenses array:', newExpenses.length, 'expenses')
            return newExpenses
          })
        }

        toast({
          title: "Success",
          description: "Expense added successfully!",
        })

        // Force refresh to ensure UI updates
        setTimeout(() => {
          refreshExpenses()
        }, 500)

        // Trigger dashboard refresh
        console.log('Triggering dashboard refresh from expenses page')
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
      }

      // Close dialog and reset state
      setIsAddExpenseOpen(false)
      setEditingExpense(null)
      
      // Force a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('Dialog closed, expenses should be updated')
      }, 100)
    } catch (error) {
      console.error('Error saving expense:', error)
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!user || !supabase) return

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setExpenses(prev => prev.filter(expense => expense.id !== id))

      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      })
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // Handle edit
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsAddExpenseOpen(true)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      dateFilter: 'all',
      customDateFrom: '',
      customDateTo: ''
    })
    setCurrentPage(1)
  }

  // Chart colors
  const COLORS = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#14B8A6'
  ]

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Expenses</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate">
                  Expenses
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Manage your income and expenses
                </p>
              </div>
              <Button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add Expense</span>
              </Button>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Total Spent This Month */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-red-400/5 to-pink-500/10 dark:from-red-900/30 dark:via-red-800/20 dark:to-pink-900/30 border-red-200/30 dark:border-red-800/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 dark:from-red-500/10 dark:to-pink-500/10" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-red-700 dark:text-rose-300 truncate">
                      This Month&apos;s Expenses
                    </CardTitle>
                    <p className="text-xs text-red-600/70 dark:text-rose-400/70 hidden sm:block">
                      Total spent this month
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg flex-shrink-0">
                    <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-currency text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 dark:text-rose-400 mb-1 sm:mb-2">
                    {formatCurrency(summaryData.totalSpent)}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-meta text-red-600/70 dark:text-rose-400/70">
                      Current month spending
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Total Transactions */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-indigo-500/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-indigo-900/30 border-blue-200/30 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-slate-300 truncate">
                      Total Transactions
                    </CardTitle>
                    <p className="text-xs text-blue-600/70 dark:text-slate-400/70 hidden sm:block">
                      All time transactions
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-data text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {expenses.length}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-meta text-blue-600/70 dark:text-slate-400/70">
                      {filteredAndSortedExpenses.length} visible
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Category */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-violet-500/10 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-violet-900/30 border-purple-200/30 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300 truncate">
                      Top Category
                    </CardTitle>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 hidden sm:block">
                      Highest spending category
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg flex-shrink-0">
                    <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  {summaryData.categoryBreakdown.length > 0 ? (
                    <>
                      <div className="text-sm sm:text-base font-semibold text-purple-600 dark:text-purple-400 mb-1 truncate">
                        {summaryData.categoryBreakdown[0].name}
                      </div>
                      <div className="text-currency text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1 sm:mb-2">
                        {formatCurrency(summaryData.categoryBreakdown[0].value)}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-meta text-purple-600/70 dark:text-purple-400/70">
                          {summaryData.categoryBreakdown[0].percentage.toFixed(1)}% of total
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2 sm:py-4">
                      <div className="text-xs sm:text-sm text-purple-600/70 dark:text-purple-400/70">
                        No expenses this month
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown - New Design */}
            {summaryData.categoryBreakdown.length > 0 && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200/50 dark:border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <PieChartIcon className="h-5 w-5 text-purple-600" />
                    Category Breakdown
                  </CardTitle>
                  <p className="text-meta text-gray-600 dark:text-gray-400">
                    Spending distribution by category this month
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summaryData.categoryBreakdown.slice(0, 5).map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <div className="text-subtitle text-gray-900 dark:text-white font-medium">
                              {category.name}
                            </div>
                            <div className="text-meta text-gray-600 dark:text-gray-400">
                              {category.percentage.toFixed(1)}% of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-currency text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(category.value)}
                          </div>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${category.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {summaryData.categoryBreakdown.length > 5 && (
                      <div className="text-center pt-2">
                        <span className="text-meta text-gray-500 dark:text-gray-400">
                          +{summaryData.categoryBreakdown.length - 5} more categories
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search expenses..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-8 sm:pl-10 py-2 sm:py-2.5 text-sm"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="py-2 sm:py-2.5 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date Filter */}
                  <Select
                    value={filters.dateFilter}
                    onValueChange={(value: DateFilter) => setFilters(prev => ({ ...prev, dateFilter: value }))}
                  >
                    <SelectTrigger className="py-2 sm:py-2.5 text-sm">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Custom Date Range */}
                  {filters.dateFilter === 'custom' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
                      <Input
                        type="date"
                        placeholder="From Date"
                        value={filters.customDateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, customDateFrom: e.target.value }))}
                        className="py-2 sm:py-2.5 text-sm"
                      />
                      <Input
                        type="date"
                        placeholder="To Date"
                        value={filters.customDateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, customDateTo: e.target.value }))}
                        className="py-2 sm:py-2.5 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters} className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4">
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                  <CardTitle className="text-sm sm:text-base">
                    All Expenses ({filteredAndSortedExpenses.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={`${sortField}-${sortDirection}`}
                      onValueChange={(value) => {
                        const [field, direction] = value.split('-') as [SortField, SortDirection]
                        setSortField(field)
                        setSortDirection(direction)
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm py-2 sm:py-2.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                        <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                        <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                        <SelectItem value="category-asc">Category (A to Z)</SelectItem>
                        <SelectItem value="category-desc">Category (Z to A)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentExpenses.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <Wallet className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2">No expenses found</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                      {filters.search || filters.category || filters.dateFilter !== 'all'
                        ? 'Try adjusting your filters or add a new expense.'
                        : 'Start by adding your first expense.'
                      }
                    </p>
                    <Button onClick={() => setIsAddExpenseOpen(true)} className="text-sm sm:text-base">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                            <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Date</th>
                            <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Category</th>
                            <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Description</th>
                            <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Type</th>
                            <th className="text-right py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Amount</th>
                            <th className="text-center py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentExpenses.map((expense) => (
                            <tr 
                              key={expense.id} 
                              className={`border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300 ${
                                highlightedExpenseId === expense.id 
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-lg' 
                                  : ''
                              }`}
                            >
                              <td className="py-3 px-3 lg:px-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                  <span className="text-xs sm:text-sm">{formatDate(expense.transaction_date || '')}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 lg:px-4">
                                <Badge variant="outline" className="text-xs">
                                  {expense.category || 'Other'}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 lg:px-4">
                                <div className="max-w-xs truncate text-xs sm:text-sm" title={expense.title}>
                                  {expense.title || 'No description'}
                                </div>
                              </td>
                              <td className="py-3 px-3 lg:px-4">
                                <Badge 
                                  variant={expense.transaction_type === 'income' ? 'default' : 'secondary'}
                                  className={`text-xs ${expense.transaction_type === 'income' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {expense.transaction_type}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 lg:px-4 text-right">
                                <span className={`font-semibold text-xs sm:text-sm ${
                                  expense.transaction_type === 'income' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-rose-400'
                                }`}>
                                  {expense.transaction_type === 'income' ? '+' : '-'}
                                  {formatCurrency(expense.amount)}
                                </span>
                              </td>
                              <td className="py-3 px-3 lg:px-4">
                                <div className="flex justify-center gap-1 sm:gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(expense)}
                                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                        >
                                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit expense</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setDeleteConfirmId(expense.id)}
                                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete expense</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3 sm:space-y-4">
                      {currentExpenses.map((expense) => (
                        <Card 
                          key={expense.id} 
                          className={`p-3 sm:p-4 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                            highlightedExpenseId === expense.id 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-lg' 
                              : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {expense.category || 'Other'}
                                </Badge>
                                <Badge 
                                  variant={expense.transaction_type === 'income' ? 'default' : 'secondary'}
                                  className={`text-xs ${expense.transaction_type === 'income' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}
                                >
                                  {expense.transaction_type}
                                </Badge>
                              </div>
                              <h3 className="font-medium mb-1 text-sm sm:text-base truncate">
                                {expense.title || 'No description'}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(expense.transaction_date || '')}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <p className={`font-bold text-base sm:text-lg ${
                                expense.transaction_type === 'income' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-rose-400'
                              }`}>
                                {expense.transaction_type === 'income' ? '+' : '-'}
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="flex-1 text-xs sm:text-sm py-2"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(expense.id)}
                              className="flex-1 text-xs sm:text-sm py-2 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Delete
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedExpenses.length)} of {filteredAndSortedExpenses.length} expenses
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-xs sm:text-sm py-2 px-3 sm:px-4"
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                          </Button>
                          <span className="text-xs sm:text-sm px-2 sm:px-3">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="text-xs sm:text-sm py-2 px-3 sm:px-4"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Expense Dialog */}
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'Update the expense details below.' : 'Add a new income or expense transaction.'}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm
                initialData={editingExpense}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => {
                  setIsAddExpenseOpen(false)
                  setEditingExpense(null)
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Expense</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this expense? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}

// Expense Form Component
interface ExpenseFormProps {
  initialData: Expense | null
  onSubmit: (data: ExpenseFormData) => void
  isSubmitting: boolean
  onCancel: () => void
}

function ExpenseForm({ initialData, onSubmit, isSubmitting, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: initialData?.title || '',
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || '',
    transaction_date: initialData?.transaction_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    transaction_type: initialData?.transaction_type || 'expense'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.amount || !formData.category.trim()) {
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Transaction Type</label>
        <Select
          value={formData.transaction_type}
          onValueChange={(value: 'income' | 'expense') => setFormData(prev => ({ ...prev, transaction_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          placeholder="Enter description..."
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Input
          placeholder="Enter category..."
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <Input
          type="date"
          value={formData.transaction_date}
          onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
          required
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? 'Update Expense' : 'Add Expense'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    }>
      <ExpensesPageContent />
    </Suspense>
  )
}