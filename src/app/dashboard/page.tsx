"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard/header"
import { Cards } from "@/components/dashboard/cards"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { Button } from "@/components/ui/button"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import { Plus } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { toast } = useToast()
  const { addDemoNotifications } = useNotifications()

  useEffect(() => {
    // Demo expenses data
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
    
    // Set expenses and stop loading immediately
    setExpenses(demoExpenses)
    setIsLoading(false)
  }, [])

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
                {/* Header */}
                <DashboardHeader />
                
                {/* Welcome Header */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 rounded-lg blur-3xl" />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                          Welcome Back!
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

                {/* Recent Transactions - Full Width */}
                <div className="space-y-6">
                  <RecentExpenses expenses={expenses} />
                </div>

                {/* Financial Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span className="text-sm font-medium text-gray-900 dark:text-white">₹{expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">75% of monthly budget used</p>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-lg">📈</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Goal</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Target: ₹50,000</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">₹{expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-2/5"></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">40% of savings goal achieved</p>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-lg">🎯</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Category</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Food & Dining</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">₹{Math.max(...Object.values(expenses.filter(e => e.type === 'expense').reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)) || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Highest spending category</p>
                    </div>
                  </div>
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
        onSubmit={() => {
          // Demo mode - just show success message
          toast({
            title: "Demo Mode",
            description: "Expense would be saved in demo mode.",
          })
        }}
        onExpenseAdded={async () => {
          // For demo purposes, just close the dialog
          setIsAddExpenseOpen(false)
          toast({
            title: "Demo Mode",
            description: "In demo mode, expenses are not actually saved.",
          })
        }}
      />
    </AppLayout>
  </AuthGuard>
  )
}