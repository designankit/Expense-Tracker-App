"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard"
import { useNotifications } from "@/contexts/NotificationContext"
import { useSupabase } from "@/components/supabase-provider"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [financialAnalysis, setFinancialAnalysis] = useState<{
    currentMonthExpenses: number
    lastMonthExpenses: number
    currentMonthIncome: number
    lastMonthIncome: number
    expenseTrend: 'high' | 'low' | 'stable'
    incomeTrend: 'high' | 'low' | 'stable'
    netSavings: number
    savingsRate: number
    scenario: 'excellent' | 'good' | 'warning' | 'critical' | 'starting'
    message: string
    icon: React.ReactNode
    color: string
  } | null>(null)
  const { addDemoNotifications, notifications } = useNotifications()
  const { user, supabase } = useSupabase()
  // Note: Language preferences removed

  // Removed initial mount loader to avoid flash during tab navigation

  // Analyze comprehensive financial trends
  useEffect(() => {
    const analyzeFinancials = async () => {
      if (!user || !supabase) return

      try {
        setIsLoading(true)
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        
        // Get current month data (both income and expenses)
        const { data: currentMonthData } = await supabase
          .from('expenses')
          .select('amount, transaction_type')
          .eq('user_id', user.id)
          .gte('transaction_date', new Date(currentYear, currentMonth, 1).toISOString())
          .lt('transaction_date', new Date(currentYear, currentMonth + 1, 1).toISOString())

        // Get last month data (both income and expenses)
        const { data: lastMonthData } = await supabase
          .from('expenses')
          .select('amount, transaction_type')
          .eq('user_id', user.id)
          .gte('transaction_date', new Date(currentYear, currentMonth - 1, 1).toISOString())
          .lt('transaction_date', new Date(currentYear, currentMonth, 1).toISOString())

        // Calculate totals
        const currentMonthExpenses = currentMonthData?.filter((t: { transaction_type?: string }) => t.transaction_type === 'expense').reduce((sum, t: { amount?: number }) => sum + (t.amount || 0), 0) || 0
        const currentMonthIncome = currentMonthData?.filter((t: { transaction_type?: string }) => t.transaction_type === 'income').reduce((sum, t: { amount?: number }) => sum + (t.amount || 0), 0) || 0
        const lastMonthExpenses = lastMonthData?.filter((t: { transaction_type?: string }) => t.transaction_type === 'expense').reduce((sum, t: { amount?: number }) => sum + (t.amount || 0), 0) || 0
        const lastMonthIncome = lastMonthData?.filter((t: { transaction_type?: string }) => t.transaction_type === 'income').reduce((sum, t: { amount?: number }) => sum + (t.amount || 0), 0) || 0

        const netSavings = currentMonthIncome - currentMonthExpenses
        const savingsRate = currentMonthIncome > 0 ? (netSavings / currentMonthIncome) * 100 : 0

        const userName = user.user_metadata?.full_name?.split(' ')[0] || 'User'
        
        // Calculate trends
        const expenseChangePercent = lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0
        const incomeChangePercent = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0

        const expenseTrend = expenseChangePercent > 15 ? 'high' : expenseChangePercent < -15 ? 'low' : 'stable'
        const incomeTrend = incomeChangePercent > 15 ? 'high' : incomeChangePercent < -15 ? 'low' : 'stable'

        // Determine scenario and create message
        let scenario: 'excellent' | 'good' | 'warning' | 'critical' | 'starting'
        let message: string
        let icon: React.ReactNode
        let color: string

        if (currentMonthExpenses === 0 && currentMonthIncome === 0) {
          scenario = 'starting'
          message = `${userName}, welcome to your financial journey! Start by adding your first transaction to unlock personalized insights.`
          icon = <Target className="h-5 w-5" />
          color = 'blue'
        } else if (netSavings > 0 && savingsRate > 20) {
          scenario = 'excellent'
          message = `${userName}, outstanding! You're saving ${savingsRate.toFixed(0)}% of your income (₹${netSavings.toLocaleString()}). This is excellent financial discipline!`
          icon = <CheckCircle className="h-5 w-5" />
          color = 'green'
        } else if (netSavings > 0 && incomeTrend === 'high') {
          scenario = 'excellent'
          message = `${userName}, fantastic! Your income increased by ${incomeChangePercent.toFixed(0)}% and you're still saving ₹${netSavings.toLocaleString()}. You're on fire! 🔥`
          icon = <TrendingUp className="h-5 w-5" />
          color = 'green'
        } else if (netSavings > 0 && expenseTrend === 'low') {
          scenario = 'excellent'
          message = `${userName}, brilliant! You reduced expenses by ${Math.abs(expenseChangePercent).toFixed(0)}% and saved ₹${netSavings.toLocaleString()}. Keep this momentum!`
          icon = <PiggyBank className="h-5 w-5" />
          color = 'green'
        } else if (netSavings > 0) {
          scenario = 'good'
          message = `${userName}, good work! You're saving ₹${netSavings.toLocaleString()} this month. Consider optimizing expenses to save even more.`
          icon = <DollarSign className="h-5 w-5" />
          color = 'blue'
        } else if (netSavings < 0 && expenseTrend === 'high') {
          scenario = 'critical'
          message = `${userName}, your expenses increased by ${expenseChangePercent.toFixed(0)}% and you're overspending by ₹${Math.abs(netSavings).toLocaleString()}. Time to review your budget!`
          icon = <AlertTriangle className="h-5 w-5" />
          color = 'red'
        } else if (netSavings < 0) {
          scenario = 'warning'
          message = `${userName}, you're overspending by ₹${Math.abs(netSavings).toLocaleString()} this month. Let's get back on track with your financial goals.`
          icon = <TrendingDown className="h-5 w-5" />
          color = 'orange'
        } else {
          scenario = 'good'
          message = `${userName}, you're breaking even this month. Great! Now let's work on creating some savings for your future.`
          icon = <Target className="h-5 w-5" />
          color = 'blue'
        }

        setFinancialAnalysis({
          currentMonthExpenses,
          lastMonthExpenses,
          currentMonthIncome,
          lastMonthIncome,
          expenseTrend,
          incomeTrend,
          netSavings,
          savingsRate,
          scenario,
          message,
          icon,
          color
        })
      } catch (error) {
        console.error('Error analyzing financials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && supabase) {
      analyzeFinancials()
    }
  }, [user, supabase])

  // Note: Onboarding check is handled by AuthGuard, no need to duplicate here

  // Optionally seed demo notifications only if enabled via env and none exist yet
  useEffect(() => {
    const showDemoNotifications = process.env.NEXT_PUBLIC_SHOW_DEMO_NOTIFICATIONS === 'true'
    if (!showDemoNotifications) return
    if (notifications.length > 0) return

    const timer = setTimeout(() => {
      addDemoNotifications()
    }, 1000)

    return () => clearTimeout(timer)
  }, [addDemoNotifications, notifications.length])

  return (
    <AuthGuard requireOnboarding={true}>
      <AppLayout>
        <div className="min-h-screen w-full bg-white dark:bg-gray-900">
          <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Welcome Header */}
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-lg blur-3xl" />
                  <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-6 lg:p-8 shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                      <div className="space-y-2 min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate">
                          Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                          Here&apos;s your financial overview for today
                        </p>
                        
                        {/* Financial Analysis Card */}
                        {financialAnalysis && (
                          <div className={`relative overflow-hidden rounded-xl border p-4 sm:p-6 shadow-sm transition-all duration-300 ${
                            financialAnalysis.color === 'green' 
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                              : financialAnalysis.color === 'blue'
                              ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                              : financialAnalysis.color === 'orange'
                              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                          }`}>
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                              <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full translate-y-12 -translate-x-12 animate-pulse animation-delay-1000"></div>
                              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-current rounded-full -translate-x-8 -translate-y-8 animate-pulse animation-delay-2000"></div>
                            </div>
                            
                            {/* Floating Particles */}
                            <div className="absolute inset-0 overflow-hidden">
                              <div className="absolute top-4 left-8 w-2 h-2 bg-current rounded-full opacity-30 animate-bounce animation-delay-500"></div>
                              <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-current rounded-full opacity-40 animate-bounce animation-delay-1500"></div>
                              <div className="absolute bottom-8 left-16 w-1 h-1 bg-current rounded-full opacity-50 animate-bounce animation-delay-3000"></div>
                              <div className="absolute bottom-12 right-8 w-2.5 h-2.5 bg-current rounded-full opacity-20 animate-bounce animation-delay-2500"></div>
                            </div>
                            
                            <div className="relative">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                  financialAnalysis.color === 'green' 
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                    : financialAnalysis.color === 'blue'
                                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                    : financialAnalysis.color === 'orange'
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                                }`}>
                                  {financialAnalysis.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm sm:text-base font-medium animate-in slide-in-from-left-4 fade-in duration-700 delay-300 ${
                                    financialAnalysis.color === 'green' 
                                      ? 'text-emerald-800 dark:text-emerald-200'
                                      : financialAnalysis.color === 'blue'
                                      ? 'text-slate-800 dark:text-slate-200'
                                      : financialAnalysis.color === 'orange'
                                      ? 'text-amber-800 dark:text-amber-200'
                                      : 'text-rose-800 dark:text-rose-200'
                                  }`}>
                                    {financialAnalysis.message}
                                  </p>
                                  
                                  {/* Quick Stats */}
                                  <div className="flex flex-wrap gap-4 mt-3 text-xs sm:text-sm">
                                    {financialAnalysis.netSavings !== 0 && (
                                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full animate-in slide-in-from-bottom-2 fade-in duration-500 delay-500 hover:scale-105 transition-transform ${
                                        financialAnalysis.netSavings > 0
                                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300'
                                      }`}>
                                        <div className="animate-bounce">
                                          {financialAnalysis.netSavings > 0 ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                          ) : (
                                            <ArrowDownRight className="h-3 w-3" />
                                          )}
                                        </div>
                                        <span>₹{Math.abs(financialAnalysis.netSavings).toLocaleString()} {financialAnalysis.netSavings > 0 ? 'saved' : 'overspent'}</span>
                                      </div>
                                    )}
                                    
                                    {financialAnalysis.savingsRate > 0 && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-700 hover:scale-105 transition-transform">
                                        <div className="animate-pulse">
                                          <PiggyBank className="h-3 w-3" />
                                        </div>
                                        <span>{financialAnalysis.savingsRate.toFixed(0)}% savings rate</span>
                                      </div>
                                    )}
                                    
                                    {financialAnalysis.expenseTrend !== 'stable' && (
                                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full animate-in slide-in-from-bottom-2 fade-in duration-500 delay-900 hover:scale-105 transition-transform ${
                                        financialAnalysis.expenseTrend === 'low'
                                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                                      }`}>
                                        <div className="animate-bounce">
                                          <TrendingDown className="h-3 w-3" />
                                        </div>
                                        <span>Expenses {financialAnalysis.expenseTrend}</span>
                                      </div>
                                    )}
                                    
                                    {financialAnalysis.incomeTrend !== 'stable' && (
                                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full animate-in slide-in-from-bottom-2 fade-in duration-500 delay-1100 hover:scale-105 transition-transform ${
                                        financialAnalysis.incomeTrend === 'high'
                                          ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                                          : 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300'
                                      }`}>
                                        <div className="animate-bounce">
                                          <TrendingUp className="h-3 w-3" />
                                        </div>
                                        <span>Income {financialAnalysis.incomeTrend}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live data</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Dashboard */}
                <EnhancedDashboard />
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}