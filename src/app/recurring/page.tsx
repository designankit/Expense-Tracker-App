"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSupabase } from '@/components/supabase-provider'
import { RecurringTransaction } from '@/types/database'
import { formatFrequency } from '@/types/recurring-transaction'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  Trash2, 
  Pause, 
  Play,
  Plus,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import AddExpenseDialog from '@/components/AddExpenseDialog'

export default function RecurringTransactionsPage() {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchRecurringTransactions = useCallback(async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true })

      if (error) {
        console.error('Error fetching recurring transactions:', error)
        toast({
          title: "Error",
          description: "Failed to load recurring transactions.",
          variant: "destructive",
        })
        return
      }

      setRecurringTransactions(data || [])
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
      toast({
        title: "Error",
        description: "Failed to load recurring transactions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!user || !supabase) return

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ is_active: !isActive })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setRecurringTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id
            ? { ...transaction, is_active: !isActive }
            : transaction
        )
      )

      toast({
        title: "Success",
        description: `Recurring transaction ${!isActive ? 'activated' : 'paused'}.`,
      })
    } catch (error) {
      console.error('Error toggling recurring transaction:', error)
      toast({
        title: "Error",
        description: "Failed to update recurring transaction.",
        variant: "destructive",
      })
    }
  }

  const deleteRecurringTransaction = async (id: string) => {
    if (!user || !supabase) return

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setRecurringTransactions(prev =>
        prev.filter(transaction => transaction.id !== id)
      )

      toast({
        title: "Success",
        description: "Recurring transaction deleted.",
      })
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      toast({
        title: "Error",
        description: "Failed to delete recurring transaction.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (nextDueDate: string) => {
    return new Date(nextDueDate) < new Date()
  }

  useEffect(() => {
    fetchRecurringTransactions()
  }, [fetchRecurringTransactions])

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-4">
                          <Skeleton className="h-10 w-10 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-32 mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Scheduled Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Automate your regular income and expenses
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-lg font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Scheduled Transaction
          </Button>
        </div>
      </div>

      {recurringTransactions.length === 0 ? (
        <Card className="hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-16 text-center">
            <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Repeat className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Scheduled Transactions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Create your first scheduled transaction to automate your finances.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-lg font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Scheduled Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {recurringTransactions.map((transaction) => (
            <Card 
              key={transaction.id} 
              className={`group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${
                !transaction.is_active ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header with title and badges */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${
                        transaction.transaction_type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/40' 
                          : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        {transaction.transaction_type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                          {transaction.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}
                            className="text-xs font-medium px-2 py-1"
                          >
                            {transaction.transaction_type === 'income' ? 'Income' : 'Expense'}
                          </Badge>
                          {!transaction.is_active && (
                            <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                              Paused
                            </Badge>
                          )}
                          {isOverdue(transaction.next_due_date) && transaction.is_active && (
                            <Badge variant="destructive" className="text-xs font-medium px-2 py-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount and main details */}
                    <div className="mb-4">
                      <div className={`text-2xl font-bold ${
                        transaction.transaction_type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Details grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Repeat className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Frequency</span>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatFrequency(transaction.frequency)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Next Due</span>
                          <div className={`font-semibold ${
                            isOverdue(transaction.next_due_date) && transaction.is_active
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {formatDate(transaction.next_due_date)}
                          </div>
                        </div>
                      </div>
                      
                      {transaction.category && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Category</span>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {transaction.category}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional info */}
                    {(transaction.end_date || transaction.category) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {transaction.end_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Ends: {formatDate(transaction.end_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(transaction.id, transaction.is_active)}
                      className="h-10 w-10 p-0 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      {transaction.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecurringTransaction(transaction.id)}
                      className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

        <AddExpenseDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onExpenseAdded={fetchRecurringTransactions}
        />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
