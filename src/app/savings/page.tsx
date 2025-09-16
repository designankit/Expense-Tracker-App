"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, PiggyBank, TrendingUp, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Savings } from "@/types/savings"
import { SavingsCard } from "@/components/savings/SavingsCard"
import SavingsDialog from "@/components/savings/SavingsDialog"

export default function SavingsPage() {
  const [savings, setSavings] = useState<Savings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<Savings | null>(null)
  
  const { toast } = useToast()
  const { user, supabase } = useSupabase()

  const fetchSavings = async () => {
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
  }

  useEffect(() => {
    fetchSavings()
  }, [user, supabase, fetchSavings])

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

  // Calculate summary statistics
  const totalTarget = savings.reduce((sum, s) => sum + s.target_amount, 0)
  const totalSaved = savings.reduce((sum, s) => sum + s.saved_amount, 0)
  const completedGoals = savings.filter(s => s.saved_amount >= s.target_amount).length
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

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
                        Savings Goals
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-base">
                        Track your progress towards financial goals
                      </p>
                    </div>
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

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Goals
                    </CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {savings.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Target
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
                      Total Saved
                    </CardTitle>
                    <PiggyBank className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{totalSaved.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completed
                    </CardTitle>
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {completedGoals}
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
                  Your Savings Goals
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
                        No savings goals yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        Create your first savings goal to start tracking your progress towards financial milestones.
                      </p>
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Goal
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savings.map((saving) => (
                      <SavingsCard
                        key={saving.id}
                        savings={saving}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Savings Dialog */}
        <SavingsDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSavingsUpdated={handleSavingsUpdated}
          initialData={editingSavings}
        />
      </AppLayout>
    </AuthGuard>
  )
}
