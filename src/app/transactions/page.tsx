/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { Expense, ExpenseInsert, ExpenseUpdate } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus,
  AlertCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { ExpensesTabContent } from "@/components/transactions/ExpensesTabContent"
import { IncomesTabContent } from "@/components/transactions/IncomesTabContent"


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

interface TransactionFormData {
  title: string
  amount: string
  category: string
  transaction_date: string
  transaction_type: 'income' | 'expense'
}

function TransactionsPageContent() {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const searchParams = useSearchParams()

  // State management
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedTransactionId, setHighlightedTransactionId] = useState<string | null>(null)
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Expense | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    dateFilter: 'all',
    customDateFrom: '',
    customDateTo: ''
  })
  const itemsPerPage = 10


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
      setHighlightedTransactionId(highlightId)
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedTransactionId(null), 3000)
    }
  }, [searchParams])

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || !supabase) return

      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await (supabase as any)
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setTransactions(data || [])
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError('Failed to load transactions. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load transactions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, supabase, toast])

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set(transactions.map(transaction => transaction.category).filter((category): category is string => Boolean(category)))
    return Array.from(categories).sort()
  }, [transactions])

  // Filter transactions by type and other filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      const expectedType = activeTab === 'expenses' ? 'expense' : 'income'
      if (transaction.transaction_type !== expectedType) return false

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesTitle = transaction.title?.toLowerCase().includes(searchLower) || false
        const matchesCategory = transaction.category?.toLowerCase().includes(searchLower) || false
        if (!matchesTitle && !matchesCategory) return false
      }

      // Category filter
      if (filters.category && filters.category !== 'all' && transaction.category !== filters.category) {
        return false
      }

      // Date filter
      if (filters.dateFilter !== 'all' && transaction.transaction_date) {
        const transactionDate = new Date(transaction.transaction_date)
        const now = new Date()
        
        switch (filters.dateFilter) {
          case 'this-month':
            if (transactionDate.getMonth() !== now.getMonth() || transactionDate.getFullYear() !== now.getFullYear()) {
              return false
            }
            break
          case 'last-month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            if (transactionDate.getMonth() !== lastMonth.getMonth() || transactionDate.getFullYear() !== lastMonth.getFullYear()) {
              return false
            }
            break
          case 'custom':
            if (filters.customDateFrom) {
              const fromDate = new Date(filters.customDateFrom)
              if (transactionDate < fromDate) return false
            }
            if (filters.customDateTo) {
              const toDate = new Date(filters.customDateTo)
              if (transactionDate > toDate) return false
            }
            break
        }
      }

      return true
    })
  }, [transactions, activeTab, filters])

  // Sort filtered transactions
  const filteredAndSortedTransactions = useMemo(() => {
    return filteredTransactions.sort((a, b) => {
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
  }, [filteredTransactions, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredAndSortedTransactions.slice(startIndex, endIndex)

  // Calculate summary data for current tab
  const summaryData = useMemo(() => {
    const now = new Date()
    const currentMonthTransactions = transactions.filter(transaction => {
      const expectedType = activeTab === 'expenses' ? 'expense' : 'income'
      if (!transaction.transaction_date || transaction.transaction_type !== expectedType) return false
      const transactionDate = new Date(transaction.transaction_date)
      return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear()
    })

    const totalAmount = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Category breakdown
    const categoryTotals = currentMonthTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Other'
      acc[category] = (acc[category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: totalAmount > 0 ? (value / totalAmount) * 100 : 0
    })).sort((a, b) => b.value - a.value)

    return {
      totalAmount,
      categoryBreakdown,
      totalTransactions: currentMonthTransactions.length
    }
  }, [transactions, activeTab])

  // Chart data for trends
  const chartData = useMemo(() => {
    const now = new Date()
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return {
        month: date.toLocaleDateString('en-IN', { month: 'short' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        expenses: 0,
        incomes: 0
      }
    }).reverse()

    transactions.forEach(transaction => {
      const expectedType = activeTab === 'expenses' ? 'expense' : 'income'
      if (transaction.transaction_type !== expectedType || !transaction.transaction_date) return
      
      const transactionDate = new Date(transaction.transaction_date)
      const monthIndex = last6Months.findIndex(
        item => item.monthIndex === transactionDate.getMonth() && item.year === transactionDate.getFullYear()
      )
      
      if (monthIndex !== -1) {
        if (activeTab === 'expenses') {
          last6Months[monthIndex].expenses += transaction.amount
        } else {
          last6Months[monthIndex].incomes += transaction.amount
        }
      }
    })

    return last6Months
  }, [transactions, activeTab])

  // Handle form submission
  const handleSubmit = async (formData: TransactionFormData) => {
    if (!user || !supabase) return

    setIsSubmitting(true)
    try {
      const transactionData: ExpenseInsert = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        transaction_date: formData.transaction_date,
        transaction_type: formData.transaction_type,
        user_id: user.id
      }

      if (editingTransaction) {
        // Update existing transaction
        const updateData: ExpenseUpdate = {
          title: formData.title,
          amount: parseFloat(formData.amount),
          category: formData.category,
          transaction_date: formData.transaction_date,
          transaction_type: formData.transaction_type
        }
        const { error } = await (supabase as any)
          .from('expenses')
          .update(updateData)
          .eq('id', editingTransaction.id)
          .eq('user_id', user.id)

        if (error) throw error

        // Update local state
        setTransactions(prev => prev.map(transaction => 
          transaction.id === editingTransaction.id 
            ? { ...transaction, ...transactionData }
            : transaction
        ))

        toast({
          title: "Success",
          description: "Transaction updated successfully!",
        })
      } else {
        // Create new transaction
        const { data, error } = await (supabase as any)
          .from('expenses')
          .insert([transactionData])
          .select()

        if (error) throw error

        // Update local state
        if (data && data[0]) {
          setTransactions(prev => [data[0], ...prev])
        }

        // Add notification
        const transactionType = formData.transaction_type === 'income' ? 'Income' : 'Expense'
        await addNotification({
          title: `${transactionType} Added`,
          message: `Added ${transactionType.toLowerCase()} of ₹${formData.amount} for ${formData.category}`,
          type: 'success',
          actionUrl: '/transactions'
        })

        toast({
          title: "Success",
          description: "Transaction added successfully!",
        })
      }

      // Close dialog and reset state
      setIsAddTransactionOpen(false)
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
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
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))

      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
      })
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // Handle edit
  const handleEdit = (transaction: Expense) => {
    setEditingTransaction(transaction)
    setIsAddTransactionOpen(true)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
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
                <h2 className="text-xl font-semibold mb-2">Error Loading Transactions</h2>
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
                  Transactions
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Manage your income and expense transactions
                </p>
              </div>
              <Button 
                onClick={() => setIsAddTransactionOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'expenses' | 'incomes')} className="w-full">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="w-full max-w-md">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expenses" className="flex items-center gap-2 group">
                      <TrendingDown className="h-4 w-4 transition-colors group-data-[state=active]:text-red-600" />
                      <span>Expenses</span>
                      <div className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-red-100 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:bg-red-900/30 dark:group-data-[state=active]:text-red-400">
                        {transactions.filter(t => t.transaction_type === 'expense').length}
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="incomes" className="flex items-center gap-2 group">
                      <TrendingUp className="h-4 w-4 transition-colors group-data-[state=active]:text-green-600" />
                      <span>Incomes</span>
                      <div className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-data-[state=active]:bg-green-100 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:bg-green-900/30 dark:group-data-[state=active]:text-green-400">
                        {transactions.filter(t => t.transaction_type === 'income').length}
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Quick Stats Bar */}
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Expenses: ₹{summaryData.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Incomes: ₹{transactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <TabsContent value="expenses" className="space-y-6">
                <ExpensesTabContent 
                  transactions={currentTransactions}
                  summaryData={summaryData}
                  chartData={chartData}
                  filteredAndSortedTransactions={filteredAndSortedTransactions}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  highlightedTransactionId={highlightedTransactionId}
                  uniqueCategories={uniqueCategories}
                  filters={filters}
                  setFilters={setFilters}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  setSortField={setSortField}
                  setSortDirection={setSortDirection}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirmId}
                  onAddTransaction={() => setIsAddTransactionOpen(true)}
                />
              </TabsContent>

              <TabsContent value="incomes" className="space-y-6">
                <IncomesTabContent 
                  transactions={currentTransactions}
                  summaryData={summaryData}
                  chartData={chartData}
                  filteredAndSortedTransactions={filteredAndSortedTransactions}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  highlightedTransactionId={highlightedTransactionId}
                  uniqueCategories={uniqueCategories}
                  filters={filters}
                  setFilters={setFilters}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  setSortField={setSortField}
                  setSortDirection={setSortDirection}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirmId}
                  onAddTransaction={() => setIsAddTransactionOpen(true)}
                />
              </TabsContent>
            </Tabs>

          {/* Add/Edit Transaction Dialog */}
          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </DialogTitle>
                <DialogDescription>
                  {editingTransaction ? 'Update the transaction details below.' : 'Add a new income or expense transaction.'}
                </DialogDescription>
              </DialogHeader>
              <TransactionForm
                initialData={editingTransaction}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => {
                  setIsAddTransactionOpen(false)
                  setEditingTransaction(null)
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Transaction</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this transaction? This action cannot be undone.
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
        </div>
      </AppLayout>
    </AuthGuard>
  )
}

// Transaction Form Component
interface TransactionFormProps {
  initialData: Expense | null
  onSubmit: (data: TransactionFormData) => void
  isSubmitting: boolean
  onCancel: () => void
}

function TransactionForm({ initialData, onSubmit, isSubmitting, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
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
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({ ...prev, amount: '100' }))}
            className="text-xs"
          >
            ₹100
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({ ...prev, amount: '500' }))}
            className="text-xs"
          >
            ₹500
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData(prev => ({ ...prev, amount: '2000' }))}
            className="text-xs"
          >
            ₹2000
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Food & Dining">Food & Dining</SelectItem>
            <SelectItem value="Transportation">Transportation</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Groceries">Groceries</SelectItem>
            <SelectItem value="Personal Care">Personal Care</SelectItem>
            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
            <SelectItem value="Insurance">Insurance</SelectItem>
            <SelectItem value="Investment">Investment</SelectItem>
            <SelectItem value="Salary">Salary</SelectItem>
            <SelectItem value="Freelance">Freelance</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Gift">Gift</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
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
          {initialData ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </DialogFooter>
    </form>
  )
}


export default function TransactionsPage() {
  return (
    <Suspense fallback={(
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
    )}>
      <TransactionsPageContent />
    </Suspense>
  )
}
