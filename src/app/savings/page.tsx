"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { getLocalizedText } from "@/lib/user-preferences"
import { Savings, GoalStatus } from "@/types/savings"
import { EnhancedSavingsCard } from "@/components/savings/EnhancedSavingsCard"
import EnhancedSavingsDialog from "@/components/savings/EnhancedSavingsDialog"

// Export functionality
const exportToCSV = (goals: Savings[]) => {
  const headers = [
    'Goal Name',
    'Target Amount',
    'Current Amount',
    'Progress %',
    'Target Date',
    'Priority',
    'Status',
    'Created Date'
  ]
  
  const csvContent = [
    headers.join(','),
    ...goals.map(goal => [
      `"${goal.goal_name}"`,
      goal.target_amount,
      goal.saved_amount,
      ((goal.saved_amount / goal.target_amount) * 100).toFixed(1),
      goal.target_date || '',
      goal.priority,
      goal.saved_amount >= goal.target_amount ? 'Completed' : 'In Progress',
      goal.created_at
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `savings-goals-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export default function EnhancedSavingsPage() {
  const [savings, setSavings] = useState<Savings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<Savings | null>(null)
  const { toast } = useToast()
  const { user, supabase } = useSupabase()
  const { preferences } = useUserPreferences()

  const fetchSavings = useCallback(async () => {
    if (!user || !supabase) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavings(data || [])
    } catch (error) {
      console.error('Error fetching savings:', error)
      toast({
        title: "Error",
        description: "Failed to load savings goals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  useEffect(() => {
    fetchSavings()
  }, [fetchSavings])

  const handleEdit = (savings: Savings) => {
    setEditingSavings(savings)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setSavings(prev => prev.filter(s => s.id !== id))
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingSavings(null)
  }

  const handleSavingsUpdated = () => {
    fetchSavings()
  }

  // Calculate goal status
  const getGoalStatus = (goal: Savings): GoalStatus => {
    if (goal.saved_amount >= goal.target_amount) return 'Completed'
    if (!goal.target_date) return 'On Track'

    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const totalDays = Math.ceil((targetDate.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((now.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const expectedProgress = Math.min((elapsedDays / totalDays) * 100, 100)
    const actualProgress = (goal.saved_amount / goal.target_amount) * 100
    
    if (actualProgress >= expectedProgress * 0.9) return 'On Track'
    if (actualProgress >= expectedProgress * 0.7) return 'Slightly Behind'
    return 'At Risk'
  }

  // Calculate motivational insights
  const insights = useMemo(() => {
    if (savings.length === 0) return null

    const activeGoals = savings.filter(goal => goal.saved_amount < goal.target_amount)
    
    // Closest goal to completion
    const closestGoal = activeGoals.reduce((closest, goal) => {
      const closestProgress = (closest.saved_amount / closest.target_amount) * 100
      const currentProgress = (goal.saved_amount / goal.target_amount) * 100
      return currentProgress > closestProgress ? goal : closest
    }, activeGoals[0])

    // Goal that needs attention (farthest behind)
    const goalNeedingAttention = activeGoals.reduce((farthest, goal) => {
      const status = getGoalStatus(goal)
      const farthestStatus = getGoalStatus(farthest)
      
      if (status === 'At Risk' && farthestStatus !== 'At Risk') return goal
      if (status === 'Slightly Behind' && farthestStatus === 'On Track') return goal
      
      if (goal.target_date && farthest.target_date) {
        const goalProgress = (goal.saved_amount / goal.target_amount) * 100
        const farthestProgress = (farthest.saved_amount / farthest.target_amount) * 100
        
        const goalExpectedProgress = Math.min(
          ((new Date().getTime() - new Date(goal.created_at).getTime()) / 
           (new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime())) * 100,
          100
        )
        const farthestExpectedProgress = Math.min(
          ((new Date().getTime() - new Date(farthest.created_at).getTime()) / 
           (new Date(farthest.target_date).getTime() - new Date(farthest.created_at).getTime())) * 100,
          100
        )
        
        const goalGap = goalExpectedProgress - goalProgress
        const farthestGap = farthestExpectedProgress - farthestProgress
        
        return goalGap > farthestGap ? goal : farthest
      }
      
      return farthest
    }, activeGoals[0])

    return {
      closestGoal,
      goalNeedingAttention
    }
  }, [savings])

  // Calculate summary statistics
  const totalTarget = savings.reduce((sum, s) => sum + s.target_amount, 0)
  const totalSaved = savings.reduce((sum, s) => sum + s.saved_amount, 0)
  const completedGoals = savings.filter(s => s.saved_amount >= s.target_amount).length
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  // Priority distribution
  const priorityStats = useMemo(() => {
    const stats = { High: 0, Medium: 0, Low: 0 }
    savings.forEach(goal => {
      stats[goal.priority]++
    })
    return stats
  }, [savings])

  // Handle export
  const handleExport = async () => {
    try {
      exportToCSV(savings)
      
      toast({
        title: "Success",
        description: "Savings goals exported successfully!",
      })
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: "Error",
        description: "Failed to export savings goals. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading savings goals...</p>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              {/* Header */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-600/10 rounded-lg blur-3xl" />
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="space-y-2">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <PiggyBank className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                        {getLocalizedText('page.savings', preferences.language)} Goals
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-base">
                        {getLocalizedText('savings.trackProgress', preferences.language)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {savings.length > 0 && (
                        <Button 
                          onClick={handleExport}
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Progress
                        </Button>
                      )}
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        size="lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Goal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivational Insights */}
              {insights && savings.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                        🎯 Closest to Completion
                      </CardTitle>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {insights.closestGoal?.goal_name}
                      </div>
                      <div className="text-sm text-green-600/70 dark:text-green-400/70">
                        {((insights.closestGoal.saved_amount / insights.closestGoal.target_amount) * 100).toFixed(1)}% complete
                      </div>
                      <div className="mt-2 text-xs text-green-600/60 dark:text-green-400/60">
                        Just ₹{(insights.closestGoal.target_amount - insights.closestGoal.saved_amount).toLocaleString()} remaining!
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-800/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        ⚠️ Needs Attention
                      </CardTitle>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {insights.goalNeedingAttention?.goal_name}
                      </div>
                      <div className="text-sm text-orange-600/70 dark:text-orange-400/70">
                        Status: {getGoalStatus(insights.goalNeedingAttention)}
                      </div>
                      {insights.goalNeedingAttention.target_date && (
                        <div className="mt-2 text-xs text-orange-600/60 dark:text-orange-400/60">
                          Target: {new Date(insights.goalNeedingAttention.target_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {getLocalizedText('savings.totalGoals', preferences.language)}
                    </CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {savings.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {priorityStats.High} High • {priorityStats.Medium} Medium • {priorityStats.Low} Low
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {getLocalizedText('savings.totalTarget', preferences.language)}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{totalTarget.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {getLocalizedText('savings.totalSaved', preferences.language)}
                    </CardTitle>
                    <PiggyBank className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{totalSaved.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {overallProgress.toFixed(1)}% of all goals
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {getLocalizedText('savings.completed', preferences.language)}
                    </CardTitle>
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedGoals}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {savings.length > 0 ? ((completedGoals / savings.length) * 100).toFixed(1) : 0}% success rate
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Progress */}
              {savings.length > 0 && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Overall Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {overallProgress.toFixed(1)}% of all goals
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{totalSaved.toLocaleString()} / ₹{totalTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(overallProgress, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Savings Goals Grid */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getLocalizedText('savings.yourSavingsGoals', preferences.language)}
                </h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : savings.length === 0 ? (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                        <PiggyBank className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {getLocalizedText('savings.noSavingsGoalsYet', preferences.language)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        {getLocalizedText('savings.createFirstGoalDescription', preferences.language)}
                      </p>
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {getLocalizedText('savings.createFirstGoal', preferences.language)}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savings.map((saving) => (
                      <EnhancedSavingsCard
                        key={saving.id}
                        savings={saving}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onContributionAdded={handleSavingsUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Savings Dialog */}
        <EnhancedSavingsDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSavingsUpdated={handleSavingsUpdated}
          initialData={editingSavings}
        />
      </AppLayout>
    </AuthGuard>
  )
}