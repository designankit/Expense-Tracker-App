"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Doughnut } from "react-chartjs-2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PieChart } from "lucide-react"
import { Expense } from "@/lib/api"
import { useTheme } from "next-themes"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExpenseChartsProps {
  expenses: Expense[]
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTooltip,
  Legend,
  Filler
)

// Dynamic chart options based on theme
const getLineOptions = (isDark: boolean) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true, 
      position: "top" as const,
      labels: { 
        boxWidth: 12,
        padding: 20,
        usePointStyle: true,
        font: {
          size: 12,
          weight: "normal" as const
        },
        color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
      } 
    },
    tooltip: { 
      mode: "index" as const, 
      intersect: false,
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      titleColor: isDark ? "hsl(210 40% 98%)" : "rgba(0, 0, 0, 0.87)",
      bodyColor: isDark ? "hsl(210 40% 98%)" : "rgba(0, 0, 0, 0.87)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
      boxShadow: isDark 
        ? "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)"
        : "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    },
  },
  interaction: { mode: "nearest" as const, intersect: false },
  scales: {
    x: { 
      grid: { 
        display: false 
      },
      ticks: {
        font: {
          size: 11,
          weight: "normal" as const
        },
        color: isDark ? "hsl(210 40% 98%)" : "hsl(var(--muted-foreground))"
      }
    },
    y: { 
      grid: { 
        color: isDark ? "rgba(255, 255, 255, 0.1)" : "hsl(var(--border) / 0.5)",
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          weight: "normal" as const
        },
        color: isDark ? "hsl(210 40% 98%)" : "hsl(var(--muted-foreground))"
      }
    },
  },
  animation: {
    duration: 2000,
    easing: "easeInOutQuart" as const
  }
})

// Dynamic doughnut chart options based on theme
const getDoughnutOptions = (isDark: boolean) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { 
      display: true,
      position: "bottom" as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 11,
          weight: "normal" as const
        },
        color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
      }
    },
    tooltip: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      titleColor: isDark ? "hsl(210 40% 98%)" : "rgba(0, 0, 0, 0.87)",
      bodyColor: isDark ? "hsl(210 40% 98%)" : "rgba(0, 0, 0, 0.87)",
      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      boxShadow: isDark 
        ? "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)"
        : "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      callbacks: {
        label: function(context: { label: string; parsed: number }) {
          return `${context.label}: ${context.parsed}%`
        }
      }
    },
  },
  cutout: "60%",
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 2000,
    easing: "easeInOutQuart" as const
  }
})

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  // Helper functions for calculations
  const getByCategory = () => {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)
  }

  const getMonthlyTotals = (months = 6) => {
    const now = new Date()
    const result: { month: string; expense: number; income: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })

      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        )
      })

      const expenseTotal = monthExpenses
        .filter((expense) => expense.type === 'expense')
        .reduce((sum, expense) => sum + expense.amount, 0)

      const incomeTotal = monthExpenses
        .filter((expense) => expense.type === 'income')
        .reduce((sum, expense) => sum + expense.amount, 0)

      result.push({
        month: monthKey,
        expense: expenseTotal,
        income: incomeTotal,
      })
    }

    return result
  }
  
  // Get monthly data for the last 6 months
  const monthlyData = getMonthlyTotals(6)
  const categoryData = getByCategory()
  
  // Generate chart data
  const lineData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: "Expenses",
        data: monthlyData.map(item => item.expense),
        borderColor: "hsl(221.2 83.2% 53.3%)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "hsl(221.2 83.2% 53.3%)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "Income",
        data: monthlyData.map(item => item.income),
        borderColor: "hsl(142.1 70.6% 45.3%)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "hsl(142.1 70.6% 45.3%)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }
  
  // Generate doughnut chart data
  const categories = Object.keys(categoryData)
  const categoryValues = Object.values(categoryData)
  
  const doughnutData = {
    labels: categories,
    datasets: [
      {
        label: "Categories",
        data: categoryValues,
        backgroundColor: [
          "hsl(142.1 70.6% 45.3%)",
          "hsl(221.2 83.2% 53.3%)",
          "hsl(280.4 100% 70%)",
          "hsl(45.4 93.4% 47.5%)",
          "hsl(0 84.2% 60.2%)",
          "hsl(30 100% 50%)",
          "hsl(200 100% 50%)",
          "hsl(300 100% 50%)",
        ],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }

  return (
    <TooltipProvider>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold">Spending Trend</CardTitle>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-700 dark:text-blue-300" />
                </div>
              </CardHeader>
              <CardContent className="h-64 sm:h-80">
                {monthlyData.length > 0 ? (
                  <Line data={lineData} options={getLineOptions(isDark)} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm sm:text-base">No data available</p>
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
            <Card className="border hover:shadow-sm transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold">Spending by Category</CardTitle>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-purple-700 dark:text-purple-300" />
                </div>
              </CardHeader>
              <CardContent className="h-64 sm:h-80 flex items-center justify-center">
                {categories.length > 0 ? (
                  <div className="w-64 h-64 sm:w-80 sm:h-80">
                    <Doughnut data={doughnutData} options={getDoughnutOptions(isDark)} />
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p className="text-sm sm:text-base">No expenses to display</p>
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
