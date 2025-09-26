"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { RecurringTransaction } from '@/types/database'
import { formatFrequency } from '@/types/recurring-transaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  AlertCircle,
  Clock,
  ChevronRight,
  Bell
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

      // Get recurring transactions that are due in the next 30 days
      const today = new Date()
      const nextMonth = new Date()
      nextMonth.setDate(today.getDate() + 30)

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('next_due_date', today.toISOString().split('T')[0])
        .lte('next_due_date', nextMonth.toISOString().split('T')[0])
        .order('next_due_date', { ascending: true })

      if (error) {
        throw error
      }

      setUpcomingTransactions(data || [])
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getUrgencyColor = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) return 'text-red-600 dark:text-red-400'
    if (diffDays <= 3) return 'text-orange-600 dark:text-orange-400'
    if (diffDays <= 7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const getUrgencyBadge = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) return { 
      variant: 'destructive' as const, 
      text: 'Due Today',
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800'
    }
    if (diffDays <= 3) return { 
      variant: 'destructive' as const, 
      text: 'Due Soon',
      className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800'
    }
    if (diffDays <= 7) return { 
      variant: 'secondary' as const, 
      text: 'This Week',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800'
    }
    return { 
      variant: 'outline' as const, 
      text: 'Upcoming',
      className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
    }
  }

  if (isLoading) {
    return (
      <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Bell className="h-5 w-5" />
            </div>
            Upcoming Scheduled Transactions
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
            Upcoming Scheduled Transactions
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
    <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            <Bell className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Upcoming Scheduled Transactions</span>
          {upcomingTransactions.length > 0 && (
            <Badge variant="outline" className="ml-auto border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20">
              {upcomingTransactions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-emerald-500" />
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">No upcoming transactions</p>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Your scheduled transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingTransactions.slice(0, 5).map((transaction) => {
              const urgencyBadge = getUrgencyBadge(transaction.next_due_date)
              return (
                <div
                  key={transaction.id}
                  className="group flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:shadow-sm hover:border-emerald-200 dark:hover:border-emerald-700"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-xl ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/40' 
                        : 'bg-red-100 dark:bg-red-900/40'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-base truncate text-gray-900 dark:text-gray-100">
                          {transaction.title}
                        </p>
                        <Badge 
                          variant={urgencyBadge.variant}
                          className={`text-xs font-medium px-2 py-1 ${urgencyBadge.className}`}
                        >
                          {urgencyBadge.text}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className={`font-medium ${getUrgencyColor(transaction.next_due_date)}`}>
                            {formatDate(transaction.next_due_date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Repeat className="h-4 w-4" />
                          <span className="font-medium">{formatFrequency(transaction.frequency)}</span>
                        </div>
                        
                        {transaction.category && (
                          <span className="truncate font-medium">{transaction.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-6">
                    <div className={`text-lg font-bold ${
                      transaction.transaction_type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              )
            })}
            
            {upcomingTransactions.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 py-2">
                  View all {upcomingTransactions.length} upcoming transactions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
