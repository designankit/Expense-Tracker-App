"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { RecurringTransaction } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Calendar, 
  AlertCircle,
  Bell,
  Repeat
} from 'lucide-react'
import { formatCurrency } from '@/lib/user-preferences'

interface UpcomingRecurringProps {
  className?: string
}

export function UpcomingRecurring({ className }: UpcomingRecurringProps) {
  const { user, supabase } = useSupabase()
  const [upcomingTransactions, setUpcomingTransactions] = useState<RecurringTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUpcomingRecurring = useCallback(async () => {
    if (!user || !supabase) return

    try {
      setIsLoading(true)
      setError(null)

      // Get recurring expense transactions that are due in the next 90 days
      const today = new Date()
      const nextThreeMonths = new Date()
      nextThreeMonths.setDate(today.getDate() + 90)

      // Get only future recurring expense transactions (not past dates)
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('transaction_type', 'expense') // Only show expenses
        .gte('next_due_date', today.toISOString().split('T')[0]) // Only show upcoming (not past)
        .lte('next_due_date', nextThreeMonths.toISOString().split('T')[0])
        .order('next_due_date', { ascending: true })

      if (error) {
        throw error
      }

      setUpcomingTransactions(data || [])
      
      // Debug logging to help troubleshoot
      console.log('=== RECURRING TRANSACTIONS DEBUG ===')
      console.log('Date range:', today.toISOString().split('T')[0], 'to', nextThreeMonths.toISOString().split('T')[0], '(upcoming only)')
      console.log('Upcoming recurring transactions found:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('Upcoming transactions:', data)
      } else {
        // Check if there are any recurring transactions at all
        const { data: allRecurring, error: allError } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', user.id)
        
        if (!allError) {
          console.log('Total recurring transactions in database:', allRecurring?.length || 0)
          if (allRecurring && allRecurring.length > 0) {
            console.log('All recurring transactions:', allRecurring)
            console.log('Active recurring transactions:', allRecurring.filter((t: RecurringTransaction) => t.is_active))
            console.log('Expense recurring transactions:', allRecurring.filter((t: RecurringTransaction) => t.transaction_type === 'expense'))
            
            // Check each transaction's next_due_date
            allRecurring.forEach((transaction: RecurringTransaction, index: number) => {
              console.log(`Transaction ${index + 1}:`, {
                title: transaction.title,
                next_due_date: transaction.next_due_date,
                is_active: transaction.is_active,
                transaction_type: transaction.transaction_type,
                isInRange: transaction.next_due_date >= today.toISOString().split('T')[0] && 
                          transaction.next_due_date <= nextThreeMonths.toISOString().split('T')[0],
                daysFromNow: Math.ceil((new Date(transaction.next_due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              })
            })
          } else {
            console.log('No recurring transactions found in database')
          }
        } else {
          console.error('Error fetching all recurring transactions:', allError)
        }
      }
    } catch (err) {
      console.error('Error fetching upcoming recurring transactions:', err)
      setError('Failed to load upcoming transactions')
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchUpcomingRecurring()
  }, [fetchUpcomingRecurring])

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchUpcomingRecurring()
    }

    const handleTransactionAdded = () => {
      fetchUpcomingRecurring()
    }

    window.addEventListener('refreshDashboard', handleRefresh)
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh)
      window.removeEventListener('transactionAdded', handleTransactionAdded)
    }
  }, [fetchUpcomingRecurring])


  // Calendar component
  const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()
      
      const days = []
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null)
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day))
      }
      
      return days
    }
    
    const getTransactionsForDate = (date: Date) => {
      const dateString = date.toISOString().split('T')[0]
      const transactions = upcomingTransactions.filter(transaction => 
        transaction.next_due_date === dateString
      )
      
      // Debug logging for specific dates
      if (transactions.length > 0) {
        console.log(`Found ${transactions.length} transactions for ${dateString}:`, transactions)
      }
      
      return transactions
    }
    
    const getTransactionColor = (transaction: RecurringTransaction) => {
      // Since we only show expenses now, use different colors based on urgency
      const date = new Date(transaction.next_due_date)
      const today = new Date()
      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 0) return 'bg-red-500' // Due today
      if (diffDays <= 1) return 'bg-red-500' // Due tomorrow
      if (diffDays <= 3) return 'bg-orange-500' // Due soon
      if (diffDays <= 7) return 'bg-yellow-500' // This week
      return 'bg-blue-500' // Upcoming
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    }
    
    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    }
    
    const days = getDaysInMonth(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Debug logging for calendar view
    console.log('Calendar view - Total upcoming transactions:', upcomingTransactions.length)
    console.log('Calendar view - Upcoming transactions:', upcomingTransactions)
    
    return (
      <div className="space-y-2">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {formatDate(currentDate)}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              →
            </Button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-16"></div>
            }
            
            const dayTransactions = getTransactionsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <Tooltip key={day.toISOString()}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-16 p-2 border rounded-lg relative cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                      dayTransactions.length > 0 
                        ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30' 
                        : isToday 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`text-lg font-bold ${
                      dayTransactions.length > 0 
                        ? 'text-orange-700 dark:text-orange-300' 
                        : isToday 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Transaction markers */}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {dayTransactions.slice(0, 4).map((transaction, idx) => (
                        <div
                          key={`${transaction.id}-${idx}`}
                          className={`w-2 h-2 rounded-full ${getTransactionColor(transaction)} shadow-sm`}
                        />
                      ))}
                      {dayTransactions.length > 4 && (
                        <div className="w-2 h-2 rounded-full bg-gray-400 shadow-sm text-xs flex items-center justify-center text-white font-bold">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-sm">
                        {day.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {dayTransactions.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1">
                          {dayTransactions.length} scheduled bill{dayTransactions.length > 1 ? 's' : ''} due
                        </div>
                        {dayTransactions.map((transaction, idx) => (
                          <div key={`${transaction.id}-${idx}`} className="space-y-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getTransactionColor(transaction)} shadow-sm`} />
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{transaction.title}</span>
                              </div>
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                -{formatCurrency(transaction.amount)}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="capitalize">{transaction.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Repeat className="h-3 w-3" />
                                <span className="capitalize">{transaction.frequency}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          No scheduled bills
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="font-medium">Due Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
            <span className="font-medium">Due Soon (2-3 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
            <span className="font-medium">This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
            <span className="font-medium">Upcoming</span>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Bell className="h-5 w-5" />
            </div>
            Upcoming Bills & Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-red-200/50 dark:border-red-800/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Bell className="h-5 w-5" />
            </div>
            Upcoming Bills & Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/40 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Bell className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Upcoming Bills & Expenses</span>
            {upcomingTransactions.length > 0 && (
              <Badge variant="outline" className="ml-auto border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
                {upcomingTransactions.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CalendarView />
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
