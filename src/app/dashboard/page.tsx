"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Cards } from "@/components/dashboard/cards"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { Button } from "@/components/ui/button"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { useSupabase } from "@/components/supabase-provider"
import { Expense } from "@/types/expense"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { toast } = useToast()
  const { addDemoNotifications } = useNotifications()
  const { user, supabase } = useSupabase()

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user || !supabase) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })

        if (error) {
          console.error('Error fetching expenses:', error)
          toast({
            title: "Error",
            description: "Failed to load expenses",
            variant: "destructive",
          })
        } else {
          setExpenses(data || [])
        }
      } catch (error) {
        console.error('Error fetching expenses:', error)
        toast({
          title: "Error",
          description: "Failed to load expenses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [user, supabase, toast])

  // Add demo notifications only once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addDemoNotifications()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [addDemoNotifications])

  return (
    <AuthGuard>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Welcome Header */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 rounded-lg blur-3xl" />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                          Welcome Back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-base">
                          Here's your financial overview for today
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live data</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        size="lg"
                      >
                        <span className="mr-2">+</span>
                        Add Transaction
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Cards Grid */}
                <div className="space-y-6">
                  <Cards expenses={expenses} />
                </div>

                {/* Recent Expenses - Full Width */}
                <div className="space-y-6">
                  <RecentExpenses expenses={expenses} />
                </div>

                {/* Financial Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    // Calculate monthly budget progress
                    const monthlyBudget = 50000 // ₹50,000 monthly budget
                    const currentMonth = new Date().getMonth()
                    const currentYear = new Date().getFullYear()
                    const monthlyExpenses = expenses.filter(expense => {
                      const expenseDate = new Date(expense.transaction_date)
                      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
                    })
                    const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
                    const monthlyProgress = Math.min((monthlySpent / monthlyBudget) * 100, 100)
                    const isOverBudget = monthlySpent > monthlyBudget

                    return (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-white text-lg">💰</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Spent this month</span>
                            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              ₹{monthlySpent.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isOverBudget 
                                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                              style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs ${isOverBudget ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isOverBudget 
                              ? `₹${(monthlySpent - monthlyBudget).toLocaleString()} over budget` 
                              : `${monthlyProgress.toFixed(1)}% of monthly budget used`
                            }
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {(() => {
                    // Calculate savings goal progress
                    const savingsGoal = 100000 // ₹1,00,000 savings goal
                    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
                    const savingsProgress = Math.min((totalExpenses / savingsGoal) * 100, 100)

                    return (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-lg">📈</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Goal</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Target: ₹1,00,000</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">₹{totalExpenses.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${savingsProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {savingsProgress.toFixed(1)}% of savings goal achieved
                          </p>
                        </div>
                      </div>
                    )
                  })()}

                  {(() => {
                    // Calculate top category
                    const categoryTotals = expenses.reduce((acc, e) => {
                      acc[e.category] = (acc[e.category] || 0) + e.amount
                      return acc
                    }, {} as Record<string, number>)
                    
                    const topCategory = Object.entries(categoryTotals).reduce((max, [category, amount]) => 
                      amount > max.amount ? { category, amount } : max, 
                      { category: 'No expenses', amount: 0 }
                    )
                    
                    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
                    const topCategoryPercentage = totalSpent > 0 ? (topCategory.amount / totalSpent) * 100 : 0

                    return (
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <span className="text-white text-lg">🎯</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Category</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{topCategory.category}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              ₹{topCategory.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${topCategoryPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {topCategoryPercentage.toFixed(1)}% of total spending
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                  <ExpenseCharts expenses={expenses} />
                </div>
              </div>
            )}
          </div>
        </div>
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen}
        onExpenseAdded={async () => {
          // Refresh expenses after adding
          if (user && supabase) {
            try {
              const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('transaction_date', { ascending: false })

              if (!error && data) {
                setExpenses(data)
              }
            } catch (error) {
              console.error('Error refreshing expenses:', error)
            }
          }
          setIsAddExpenseOpen(false)
        }}
      />
    </AppLayout>
  </AuthGuard>
  )
}