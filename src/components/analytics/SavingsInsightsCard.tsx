"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, TrendingUp, Calendar, Target, Clock } from "lucide-react"

interface SavingsData {
  currentSavings: number
  monthlySavings: number
  goals: Array<{
    name: string
    target: number
    current: number
    deadline?: string
  }>
  projectedGrowth: Array<{
    date: string
    amount: number
  }>
}

interface SavingsInsightsCardProps {
  data: SavingsData
}

export function SavingsInsightsCard({ data }: SavingsInsightsCardProps) {
  const calculateTimeToGoal = (target: number, current: number, monthlyRate: number) => {
    if (monthlyRate <= 0) return null
    const remaining = target - current
    const months = Math.ceil(remaining / monthlyRate)
    return months
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getSavingsRate = () => {
    if (data.monthlySavings <= 0) return 0
    // Assuming average monthly income of ₹50,000 for calculation
    const avgMonthlyIncome = 50000
    return (data.monthlySavings / avgMonthlyIncome) * 100
  }

  const getProjectionText = () => {
    const savingsRate = getSavingsRate()
    if (savingsRate <= 0) return "Start saving to see projections"
    
    const nextMilestone = Math.ceil(data.currentSavings / 100000) * 100000
    const monthsToMilestone = calculateTimeToGoal(nextMilestone, data.currentSavings, data.monthlySavings)
    
    if (monthsToMilestone && monthsToMilestone <= 12) {
      return `At your current rate, you'll reach ${formatCurrency(nextMilestone)} in ${monthsToMilestone} month${monthsToMilestone > 1 ? 's' : ''}`
    }
    
    return `Keep up the great work! You're saving ${savingsRate.toFixed(1)}% of your income`
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
            <PiggyBank className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Savings Insights</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Track your savings progress and goals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Savings Overview - Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
            <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
              {formatCurrency(data.currentSavings)}
            </div>
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Current Savings</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
              {formatCurrency(data.monthlySavings)}
            </div>
            <p className="text-xs font-medium text-green-600 dark:text-green-400">Monthly Savings</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
              {getSavingsRate().toFixed(1)}%
            </div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Savings Rate</p>
          </div>
        </div>

        {/* Projection Text - Enhanced Design */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-blue-900 dark:text-blue-100 text-sm">Projection</span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {getProjectionText()}
          </p>
        </div>

        {/* Savings Goals - Enhanced Design */}
        {data.goals.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Savings Goals
            </h4>
            {data.goals.slice(0, 3).map((goal, index) => {
              const progress = (goal.current / goal.target) * 100
              const monthsToGoal = calculateTimeToGoal(goal.target, goal.current, data.monthlySavings)
              
              return (
                <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{goal.name}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs ml-2">
                      {progress.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium">
                      {monthsToGoal ? `${monthsToGoal} months to goal` : 'Goal reached!'}
                    </span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Savings Tips - Enhanced Design */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
          <h4 className="font-bold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            Savings Tips
          </h4>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Set up automatic transfers to savings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Review and reduce subscriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Use the 50/30/20 rule for budgeting</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
