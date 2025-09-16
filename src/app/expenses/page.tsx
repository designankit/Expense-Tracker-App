"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
// Demo expense type
interface Expense {
  id: string
  amount: number
  category: string
  type: "expense" | "income"
  date: string
  note?: string
  userId: string
  createdAt: string
  updatedAt: string
}
import { formatDate } from "@/lib/format"
import { useToast } from "@/hooks/use-toast"
import { AppLayout } from "@/components/layout/app-layout"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"

type SortField = 'date' | 'amount'
type SortDirection = 'asc' | 'desc'

interface FilterState {
  search: string
  category: string
  dateFrom: string
  dateTo: string
}

function ExpensesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  // Currency formatting function
  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  })

  const itemsPerPage = 10

  // Handle search parameter from URL - real-time updates
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    const expenseId = searchParams.get('id')
    
    if (searchQuery !== null) {
      setFilters(prev => ({ ...prev, search: searchQuery }))
    }
    
    // If an expense ID is provided, scroll to that expense with enhanced highlighting
    if (expenseId && expenses.length > 0 && !isLoading) {
      // Check if the expense exists in all expenses (not just filtered ones)
      const expenseExists = expenses.some(expense => expense.id === expenseId)
      
      if (!expenseExists) {
        console.log(`Expense ${expenseId} not found in expenses list`)
        toast({
          title: "Expense Not Found",
          description: "The selected expense could not be found",
          variant: "destructive",
          duration: 4000,
        })
        return
      }
      
      // Calculate filtered and sorted expenses here to avoid hoisting issues
      const filtered = expenses.filter(expense => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          const matchesNote = expense.note?.toLowerCase().includes(searchLower) || false
          const matchesCategory = expense.category.toLowerCase().includes(searchLower)
          if (!matchesNote && !matchesCategory) return false
        }

        // Category filter
        if (filters.category && filters.category !== "all" && expense.category !== filters.category) return false

        // Date range filter
        if (filters.dateFrom) {
          const expenseDate = new Date(expense.date)
          const fromDate = new Date(filters.dateFrom)
          if (expenseDate < fromDate) return false
        }

        if (filters.dateTo) {
          const expenseDate = new Date(expense.date)
          const toDate = new Date(filters.dateTo)
          if (expenseDate > toDate) return false
        }

        return true
      })

      // Sort expenses
      const filteredAndSorted = filtered.sort((a, b) => {
        let aValue: number, bValue: number

        if (sortField === 'date') {
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
        } else {
          aValue = a.amount
          bValue = b.amount
        }

        if (sortDirection === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
      
      // Check if expense is in current filtered and sorted expenses
      const expenseInFiltered = filteredAndSorted.some(expense => expense.id === expenseId)
      
      if (!expenseInFiltered) {
        console.log(`Expense ${expenseId} is filtered out`)
        toast({
          title: "Expense Hidden",
          description: "The selected expense is hidden by current filters. Clear filters to see it.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }
      
      // Find which page the expense is on
      const expenseIndex = filteredAndSorted.findIndex(expense => expense.id === expenseId)
      const targetPage = Math.floor(expenseIndex / itemsPerPage) + 1
      
      // If expense is not on current page, navigate to the correct page
      if (targetPage !== currentPage) {
        console.log(`Expense is on page ${targetPage}, current page is ${currentPage}`)
        setCurrentPage(targetPage)
        
        // Wait for page to update, then highlight
        setTimeout(() => {
          attemptHighlight()
        }, 500)
      } else {
        // Expense is on current page, highlight immediately
        attemptHighlight()
      }
      
      function attemptHighlight(attempt = 1) {
        const element = document.getElementById(`expense-${expenseId}`)
        
        if (element) {
          console.log(`Found expense element on attempt ${attempt}`)
          
          // Scroll to the element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Show toast notification for highlighted expense
          toast({
            title: "Expense Found",
            description: `Scrolled to selected expense`,
            duration: 3000,
          })
          
          // Enhanced highlighting with multiple effects
          element.classList.add(
            'ring-4', 
            'ring-blue-500', 
            'ring-opacity-70',
            'bg-blue-50/80',
            'dark:bg-blue-950/30',
            'border-blue-300',
            'dark:border-blue-700',
            'shadow-lg',
            'shadow-blue-500/25',
            'animate-pulse'
          )
          
          // Remove highlighting after 5 seconds with fade effect
          setTimeout(() => {
            element.classList.add('transition-all', 'duration-1000')
            element.classList.remove(
              'ring-4', 
              'ring-blue-500', 
              'ring-opacity-70',
              'bg-blue-50/80',
              'dark:bg-blue-950/30',
              'border-blue-300',
              'dark:border-blue-700',
              'shadow-lg',
              'shadow-blue-500/25',
              'animate-pulse'
            )
          }, 5000)
        } else if (attempt < 10) {
          // If element not found, try again after a delay
          console.log(`Expense element not found, attempt ${attempt}, retrying...`)
          setTimeout(() => attemptHighlight(attempt + 1), 300)
        } else {
          // If still not found after 10 attempts, show error
          console.error(`Could not find expense element with ID: expense-${expenseId}`)
          toast({
            title: "Highlighting Failed",
            description: "Could not highlight the expense. Please try again.",
            variant: "destructive",
            duration: 3000,
          })
        }
      }
    }
  }, [searchParams, expenses, toast, currentPage, itemsPerPage, filters, sortField, sortDirection, isLoading])

  useEffect(() => {
    // Demo data
    const demoExpenses: Expense[] = [
      {
        id: "1",
        amount: 1500,
        category: "Food",
        type: "expense",
        date: new Date().toISOString(),
        note: "Lunch at restaurant",
        userId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2", 
        amount: 5000,
        category: "Income",
        type: "income",
        date: new Date().toISOString(),
        note: "Freelance work",
        userId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    setExpenses(demoExpenses)
    setIsLoading(false)
  }, [])

  // Get unique categories from expenses
  const uniqueCategories = useMemo(() => {
    const categories = new Set(expenses.map(expense => expense.category))
    return Array.from(categories).sort()
  }, [expenses])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter(expense => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesNote = expense.note?.toLowerCase().includes(searchLower) || false
        const matchesCategory = expense.category.toLowerCase().includes(searchLower)
        if (!matchesNote && !matchesCategory) return false
      }

      // Category filter
      if (filters.category && filters.category !== "all" && expense.category !== filters.category) return false

      // Date range filter
      if (filters.dateFrom) {
        const expenseDate = new Date(expense.date)
        const fromDate = new Date(filters.dateFrom)
        if (expenseDate < fromDate) return false
      }

      if (filters.dateTo) {
        const expenseDate = new Date(expense.date)
        const toDate = new Date(filters.dateTo)
        if (expenseDate > toDate) return false
      }

      return true
    })

    // Sort expenses
    return filtered.sort((a, b) => {
      let aValue: number, bValue: number

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime()
        bValue = new Date(b.date).getTime()
      } else {
        aValue = a.amount
        bValue = b.amount
      }

      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }, [expenses, filters, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex)

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsAddExpenseOpen(true)
  }

  const handleDelete = async (id: string) => {
    // Demo mode - just remove from local state
    setExpenses(prev => prev.filter(expense => expense.id !== id))
    toast({
      title: "Demo Mode",
      description: "Expense would be deleted in demo mode.",
    })
  }

  const handleExpenseAdded = async () => {
    // Demo mode - no need to refresh, just close dialog
    setEditingExpense(null)
    setIsAddExpenseOpen(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    })
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
              <div className="flex flex-wrap gap-2">
                {searchParams.get('search') && (
                  <Badge variant="secondary" className="animate-pulse text-xs sm:text-sm">
                    <Search className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Searching: </span>&quot;{searchParams.get('search')}&quot;
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, search: '' }))
                        router.push('/expenses')
                      }}
                      className="ml-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <span className="sr-only">Clear search</span>
                      ×
                    </button>
                  </Badge>
                )}
                {searchParams.get('id') && (
                  <Badge variant="default" className="animate-pulse bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm">
                    <span className="text-white">📍 <span className="hidden sm:inline">Expense Highlighted</span><span className="sm:hidden">Highlighted</span></span>
                    <button
                      onClick={() => router.push('/expenses')}
                      className="ml-2 hover:bg-blue-400 rounded-full p-0.5"
                    >
                      <span className="sr-only">Clear highlight</span>
                      <span className="text-white">×</span>
                    </button>
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={() => setIsAddExpenseOpen(true)} className="w-full sm:w-auto">
              Add Expense
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>

                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-10 sm:h-11">
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

                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="h-10 sm:h-11"
                />

                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="h-10 sm:h-11"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">
                All Expenses ({filteredAndSortedExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm sm:text-base">No expenses found</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {currentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      id={`expense-${expense.id}`}
                      className="border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md overflow-hidden"
                    >
                      {/* Mobile Layout */}
                      <div className="block sm:hidden p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate">{expense.category}</h3>
                              <Badge 
                                variant={expense.type === 'income' ? 'default' : 'secondary'}
                                className="text-xs flex-shrink-0"
                              >
                                {expense.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {expense.note || 'No note'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(expense.date)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <p className={`font-bold text-lg ${
                              expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                            </p>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(expense)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(expense.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between p-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.note || 'No note'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{formatDate(expense.date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <Badge variant={expense.type === 'income' ? 'default' : 'secondary'}>
                              {expense.type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className={`font-bold text-lg ${
                              expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedExpenses.length)} of {filteredAndSortedExpenses.length} expenses
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <span className="text-xs sm:text-sm px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Expense Dialog */}
          <AddExpenseDialog
            open={isAddExpenseOpen}
            onOpenChange={setIsAddExpenseOpen}
            initialData={editingExpense ? {
              id: editingExpense.id,
              title: editingExpense.title,
              amount: editingExpense.amount,
              category: editingExpense.category,
              transaction_date: editingExpense.transaction_date,
              transaction_type: editingExpense.transaction_type
            } : undefined}
            onSubmit={() => {
              // Demo mode - just show success message
              toast({
                title: "Demo Mode",
                description: "Expense would be saved in demo mode.",
              })
            }}
            onExpenseAdded={handleExpenseAdded}
          />
        </div>
      </AppLayout>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    }>
      <ExpensesPageContent />
    </Suspense>
  )
}