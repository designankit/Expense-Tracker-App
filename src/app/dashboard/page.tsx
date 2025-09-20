"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import { useNotifications } from "@/contexts/NotificationContext"
import { useSupabase } from "@/components/supabase-provider"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { getLocalizedText } from "@/lib/user-preferences"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const { addDemoNotifications } = useNotifications()
  const { user } = useSupabase()
  const { preferences } = useUserPreferences()

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Note: Onboarding check is handled by AuthGuard, no need to duplicate here

  // Add demo notifications only once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addDemoNotifications()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [addDemoNotifications])

  return (
    <AuthGuard requireOnboarding={true}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Welcome Header */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 rounded-lg blur-3xl" />
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                      <div className="space-y-2 min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate">
                          {getLocalizedText('dashboard.welcome', preferences.language)}{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}!
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                          {getLocalizedText('dashboard.overview', preferences.language)}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>{getLocalizedText('dashboard.liveData', preferences.language)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                      >
                        <span className="mr-2">+</span>
                        <span className="hidden sm:inline">{getLocalizedText('dashboard.addTransaction', preferences.language)}</span>
                        <span className="sm:hidden">Add Transaction</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Dashboard */}
                <EnhancedDashboard />
              </div>
            )}
          </div>
        </div>
      
      {/* Add Expense Dialog */}
      <AddExpenseDialog 
        open={isAddExpenseOpen} 
        onOpenChange={setIsAddExpenseOpen}
        onExpenseAdded={async () => {
          setIsAddExpenseOpen(false)
          // Refresh dashboard data
          console.log('Dispatching refresh event for dashboard')
          window.dispatchEvent(new CustomEvent('refreshDashboard'))
        }}
      />
    </AppLayout>
  </AuthGuard>
  )
}