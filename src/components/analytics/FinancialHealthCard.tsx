"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

interface FinancialHealthData {
  score: number
  savingsRate: number
  budgetAdherence: number
  expenseRatio: number
  tips: string[]
}

interface FinancialHealthCardProps {
  data: FinancialHealthData
}

export function FinancialHealthCard({ data }: FinancialHealthCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Good</Badge>
    return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Needs Improvement</Badge>
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Financial Health</CardTitle>
          </div>
          {getScoreBadge(data.score)}
        </div>
        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
          Your financial wellness score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score - Compact Design */}
        <div className="text-center p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
          <div className={`text-4xl font-black mb-2 ${getScoreColor(data.score)}`}>
            {data.score}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">out of 100</div>
          <Progress 
            value={data.score} 
            className="h-2 mb-2 bg-slate-200 dark:bg-slate-600"
            style={{
              '--progress-background': getProgressColor(data.score)
            } as React.CSSProperties}
          />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {data.score >= 80 ? "Excellent! 🎉" : 
             data.score >= 60 ? "Good habits 👍" : 
             "Needs work 📈"}
          </p>
        </div>

        {/* Metrics Grid - Compact Design */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-md">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-semibold text-green-800 dark:text-green-200">Savings Rate</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {data.savingsRate.toFixed(1)}%
              </div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400">
                {data.savingsRate >= 20 ? "Excellent" : data.savingsRate >= 10 ? "Good" : "Needs work"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-md">
                <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">Budget Adherence</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {data.budgetAdherence.toFixed(1)}%
              </div>
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                {data.budgetAdherence >= 80 ? "Excellent" : data.budgetAdherence >= 60 ? "Good" : "Needs work"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-md">
                <TrendingDown className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">Expense Ratio</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                {data.expenseRatio.toFixed(1)}%
              </div>
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400">
                {data.expenseRatio <= 60 ? "Excellent" : data.expenseRatio <= 80 ? "Good" : "Needs work"}
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Tips - Compact Design */}
        {data.tips.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-blue-900 dark:text-blue-100 text-xs">Tips</h4>
            </div>
            <ul className="space-y-1">
              {data.tips.slice(0, 1).map((tip, index) => (
                <li key={index} className="text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <CheckCircle className="h-2 w-2 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions - Compact Design */}
        <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200 dark:border-slate-600">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Set Budget</div>
            </button>
            <button className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">Review</div>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
