"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"

interface BudgetData {
  category: string
  budget: number
  actual: number
  difference: number
  status: 'under' | 'over' | 'on-track'
}

interface BudgetTrackerProps {
  data: BudgetData[]
}

export function BudgetTracker({ data }: BudgetTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'over':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under':
        return <CheckCircle className="h-4 w-4" />
      case 'over':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getProgressColor = (percentage: number, status: string) => {
    if (status === 'over') return 'bg-red-500'
    if (status === 'under') return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const totalBudget = data.reduce((sum, item) => sum + item.budget, 0)
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0)
  const totalDifference = totalBudget - totalActual

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Budget Tracker
        </CardTitle>
        <CardDescription>
          Monitor your spending against budgeted amounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(totalBudget)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(totalActual)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            totalDifference >= 0 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              totalDifference >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(totalDifference))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalDifference >= 0 ? 'Under Budget' : 'Over Budget'}
            </p>
          </div>
        </div>

        {/* Budget Progress Bars */}
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = item.budget > 0 ? (item.actual / item.budget) * 100 : 0
            const remaining = item.budget - item.actual
            
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.category}
                    </h4>
                    <Badge className={getStatusColor(item.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                    </div>
                    <div className={`text-xs ${
                      remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {remaining >= 0 
                        ? `${formatCurrency(remaining)} remaining`
                        : `${formatCurrency(Math.abs(remaining))} over`
                      }
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2 mb-2"
                  style={{
                    '--progress-background': getProgressColor(percentage, item.status)
                  } as React.CSSProperties}
                />
                
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span>
                    {item.status === 'over' && (
                      <span className="text-red-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Over budget
                      </span>
                    )}
                    {item.status === 'under' && (
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Under budget
                      </span>
                    )}
                    {item.status === 'on-track' && (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        On track
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Budget Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Budget Tips</h4>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {data.filter(item => item.status === 'over').length > 0 && (
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>You&apos;re over budget in {data.filter(item => item.status === 'over').length} category(ies). Consider reducing spending.</span>
              </li>
            )}
            {data.filter(item => item.status === 'under').length > 0 && (
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Great job! You&apos;re under budget in {data.filter(item => item.status === 'under').length} category(ies).</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>Review your budget monthly and adjust based on your spending patterns.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
