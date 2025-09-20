"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, PiggyBank } from "lucide-react"

interface CashFlowData {
  income: number
  expenses: number
  savings: number
  netFlow: number
  categories: Array<{
    name: string
    amount: number
    percentage: number
  }>
}

interface CashFlowCardProps {
  data: CashFlowData
}

export function CashFlowCard({ data }: CashFlowCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getFlowWidth = (amount: number, maxAmount: number) => {
    return Math.max(20, (amount / maxAmount) * 100)
  }

  const maxAmount = Math.max(data.income, data.expenses, data.savings)

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <CardTitle>Cash Flow Analysis</CardTitle>
        </div>
        <CardDescription>
          Visualize how money flows through your accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Main Flow Visualization */}
        <div className="space-y-6">
          {/* Income */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Income</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatCurrency(data.income)}
            </div>
            <div 
              className="h-4 bg-green-500 rounded-full mx-auto"
              style={{ width: `${getFlowWidth(data.income, maxAmount)}%` }}
            />
          </div>

          {/* Flow Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>

          {/* Expenses and Savings Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expenses */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Expenses</span>
              </div>
              <div className="text-xl font-bold text-red-600 mb-2">
                {formatCurrency(data.expenses)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {data.income > 0 ? ((data.expenses / data.income) * 100).toFixed(1) : 0}% of income
              </div>
              <div 
                className="h-3 bg-red-500 rounded-full mx-auto"
                style={{ width: `${getFlowWidth(data.expenses, maxAmount)}%` }}
              />
            </div>

            {/* Savings */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PiggyBank className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-gray-900 dark:text-white">Savings</span>
              </div>
              <div className="text-xl font-bold text-blue-600 mb-2">
                {formatCurrency(data.savings)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {data.income > 0 ? ((data.savings / data.income) * 100).toFixed(1) : 0}% of income
              </div>
              <div 
                className="h-3 bg-blue-500 rounded-full mx-auto"
                style={{ width: `${getFlowWidth(data.savings, maxAmount)}%` }}
              />
            </div>
          </div>

          {/* Net Flow */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              {data.netFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className="font-semibold text-gray-900 dark:text-white">Net Flow</span>
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              data.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.netFlow)}
            </div>
            <Badge 
              variant="secondary" 
              className={
                data.netFlow >= 0 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }
            >
              {data.netFlow >= 0 ? "Positive" : "Negative"}
            </Badge>
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        {data.categories.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h4>
            <div className="space-y-3">
              {data.categories.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Insights */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Financial Insights</h4>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            {data.netFlow >= 0 ? (
              <p>✅ Great job! You&apos;re spending less than you earn.</p>
            ) : (
              <p>⚠️ You&apos;re spending more than you earn. Consider reducing expenses.</p>
            )}
            
            {data.income > 0 && (data.savings / data.income) < 0.2 && (
              <p>💡 Try to save at least 20% of your income for better financial health.</p>
            )}
            
            {data.income > 0 && (data.expenses / data.income) > 0.8 && (
              <p>📊 Your expenses are high relative to income. Review your spending habits.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
