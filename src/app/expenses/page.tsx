"use client"

import { useState, useMemo, useEffect } from "react"
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

export default function ExpensesPage() {
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
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Expenses</h1>
              {searchParams.get('search') && (
                <Badge variant="secondary" className="animate-pulse">
                  <Search className="h-3 w-3 mr-1" />
                  Searching: &quot;{searchParams.get('search')}&quot;
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
                <Badge variant="default" className="animate-pulse bg-blue-500 hover:bg-blue-600">
                  <span className="text-white">📍 Expense Highlighted</span>
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
            <Button onClick={() => setIsAddExpenseOpen(true)}>
              Add Expense
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
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
                />

                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle>
                All Expenses ({filteredAndSortedExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses found
                </div>
              ) : (
                <div className="space-y-4">
                  {currentExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      id={`expense-${expense.id}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                    >
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
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedExpenses.length)} of {filteredAndSortedExpenses.length} expenses
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
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
            initialData={editingExpense || undefined}
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