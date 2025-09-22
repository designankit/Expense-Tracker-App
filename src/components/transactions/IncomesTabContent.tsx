"use client"

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
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { Expense } from "@/types/database"

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

interface IncomesTabContentProps {
  transactions: Expense[]
  summaryData: {
    totalAmount: number
    categoryBreakdown: Array<{ name: string; value: number; percentage: number }>
    totalTransactions: number
  }
  chartData: Array<{ month: string; incomes: number }>
  filteredAndSortedTransactions: Expense[]
  totalPages: number
  currentPage: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
  startIndex: number
  endIndex: number
  highlightedTransactionId: string | null
  uniqueCategories: string[]
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  sortField: SortField
  sortDirection: SortDirection
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  onEdit: (transaction: Expense) => void
  onDelete: (id: string) => void
  onAddTransaction: () => void
}

export function IncomesTabContent({
  transactions,
  summaryData,
  chartData,
  filteredAndSortedTransactions,
  totalPages,
  currentPage,
  setCurrentPage,
  startIndex,
  endIndex,
  highlightedTransactionId,
  uniqueCategories,
  filters,
  setFilters,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  onEdit,
  onDelete,
  onAddTransaction,
}: IncomesTabContentProps) {
  // Chart colors for income
  const COLORS = [
    '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
    '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'
  ]

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Income This Month */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-400/5 to-emerald-500/10 dark:from-green-900/30 dark:via-green-800/20 dark:to-emerald-900/30 border-green-200/30 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-xs sm:text-sm font-semibold text-green-700 dark:text-emerald-300 truncate">
                This Month&apos;s Income
              </CardTitle>
              <p className="text-xs text-green-600/70 dark:text-emerald-400/70 hidden sm:block">
                Total earned this month
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-currency text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-emerald-400 mb-1 sm:mb-2">
              {formatCurrency(summaryData.totalAmount)}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-meta text-green-600/70 dark:text-emerald-400/70">
                {summaryData.totalTransactions} transactions
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
                Total Income
              </CardTitle>
              <p className="text-xs text-blue-600/70 dark:text-slate-400/70 hidden sm:block">
                All time income
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-data text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-slate-400 mb-1 sm:mb-2">
              {filteredAndSortedTransactions.length}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-meta text-blue-600/70 dark:text-slate-400/70">
                {filteredAndSortedTransactions.length} visible
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Income Source */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-violet-500/10 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-violet-900/30 border-purple-200/30 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
            <div className="space-y-1 min-w-0 flex-1">
              <CardTitle className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-indigo-300 truncate">
                Top Income Source
              </CardTitle>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 hidden sm:block">
                Highest earning category
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
                  No income this month
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Income Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <RechartsTooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Income']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="incomes" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Source Breakdown */}
      {summaryData.categoryBreakdown.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              Income Source Breakdown
            </CardTitle>
            <p className="text-meta text-gray-600 dark:text-gray-400">
              Income distribution by source this month
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
                    +{summaryData.categoryBreakdown.length - 5} more sources
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
                placeholder="Search income..."
                value={filters.search}
                onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, search: e.target.value }))}
                className="pl-8 sm:pl-10 py-2 sm:py-2.5 text-sm"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="py-2 sm:py-2.5 text-sm">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
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

      {/* Income Table */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <CardTitle className="text-sm sm:text-base">
              All Income ({filteredAndSortedTransactions.length})
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
                  <SelectItem value="category-asc">Source (A to Z)</SelectItem>
                  <SelectItem value="category-desc">Source (Z to A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <DollarSign className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No income found</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.category || filters.dateFilter !== 'all'
                  ? 'Try adjusting your filters or add a new income entry.'
                  : 'Start by adding your first income entry.'
                }
              </p>
              <Button onClick={onAddTransaction} className="text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
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
                      <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Source</th>
                      <th className="text-left py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Description</th>
                      <th className="text-right py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Amount</th>
                      <th className="text-center py-3 px-3 lg:px-4 font-medium text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className={`border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300 ${
                          highlightedTransactionId === transaction.id 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-lg' 
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3 lg:px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm">{formatDate(transaction.transaction_date || '')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 lg:px-4">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-emerald-300 dark:border-green-800">
                            {transaction.category || 'Other'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 lg:px-4">
                          <div className="max-w-xs truncate text-xs sm:text-sm" title={transaction.title}>
                            {transaction.title || 'No description'}
                          </div>
                        </td>
                        <td className="py-3 px-3 lg:px-4 text-right">
                          <span className="font-semibold text-xs sm:text-sm text-green-600 dark:text-emerald-400">
                            +{formatCurrency(transaction.amount)}
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
                                    onClick={() => onEdit(transaction)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit income</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(transaction.id)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete income</p>
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
                {transactions.map((transaction) => (
                  <Card 
                    key={transaction.id} 
                    className={`p-3 sm:p-4 transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                      highlightedTransactionId === transaction.id 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-lg' 
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-emerald-300 dark:border-green-800">
                            {transaction.category || 'Other'}
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1 text-sm sm:text-base truncate">
                          {transaction.title || 'No description'}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.transaction_date || '')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-base sm:text-lg text-green-600 dark:text-emerald-400">
                          +{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(transaction)}
                        className="flex-1 text-xs sm:text-sm py-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(transaction.id)}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} income entries
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
  )
}
