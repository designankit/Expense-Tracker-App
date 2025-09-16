"use client"

import { useState, useEffect } from "react"
import { Line, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Expense } from "@/lib/api"
import { TrendingUp, PieChart, BarChart3 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
)

interface ExpenseChartsProps {
  expenses: Expense[]
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  // Generate sample data for the last 6 months
  const generateSampleData = () => {
    const months = []
    const expenseData = []
    const incomeData = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      months.push(date.toLocaleDateString('en-US', { month: 'short' }))
      
      // Generate realistic sample data
      expenseData.push(Math.floor(Math.random() * 5000) + 2000)
      incomeData.push(Math.floor(Math.random() * 8000) + 5000)
    }
    
    return { months, expenseData, incomeData }
  }

  const { months, expenseData, incomeData } = generateSampleData()

  const lineData = {
    labels: months,
    datasets: [
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Income',
        data: incomeData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const getLineOptions = (isDark: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#f3f4f6',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#f3f4f6',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
    },
  })

  // Category data
  const categoryData = expenses
    .filter(expense => expense.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

  const categories = Object.keys(categoryData)
  const categoryAmounts = Object.values(categoryData)

  const doughnutData = {
    labels: categories.length > 0 ? categories : ['Food', 'Transport', 'Entertainment', 'Shopping'],
    datasets: [
      {
        data: categoryAmounts.length > 0 ? categoryAmounts : [1500, 800, 600, 400],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const getDoughnutOptions = (isDark: boolean) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          padding: 20,
        },
      },
    },
  })

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg font-bold">Spending Trend</CardTitle>
                  <p className="text-xs text-muted-foreground">Track your expenses over time</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="h-72 sm:h-80 flex items-center justify-center">
                {expenses.length > 0 ? (
                  <div className="w-full h-full">
                    <Line data={lineData} options={getLineOptions(isDark)} />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-medium">No data to display</p>
                    <p className="text-xs">Add some expenses to see trends</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Track your spending and income trends over time</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg font-bold">Spending by Category</CardTitle>
                  <p className="text-xs text-muted-foreground">See where your money goes</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="h-72 sm:h-80 flex items-center justify-center">
                {categories.length > 0 ? (
                  <div className="w-64 h-64 sm:w-80 sm:h-80">
                    <Doughnut data={doughnutData} options={getDoughnutOptions(isDark)} />
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                      <PieChart className="h-8 w-8" />
                    </div>
                    <p className="text-sm sm:text-base">No expenses to display</p>
                    <p className="text-xs">Add some transactions to see categories</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>View how your expenses are distributed across categories</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}