"use client"

import { useState, useEffect } from "react"
import { apiService, Expense } from "@/lib/api"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLayout } from "@/components/layout/app-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SetupGuard } from "@/components/auth/setup-guard"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// Color palette for pie chart
const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", 
  "#d084d0", "#ffb347", "#87ceeb", "#dda0dd", "#98fb98"
]

export default function AnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await apiService.getExpenses()
        setExpenses(data)
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  // Calculate totals
  const totalExpenses = expenses
    .filter((expense) => expense.type === "expense")
    .reduce((sum, expense) => sum + expense.amount, 0)

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return (
        expense.type === "expense" &&
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const thisMonthIncome = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return (
        expense.type === "income" &&
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const netBalance = thisMonthIncome - thisMonthExpenses

  // Get category data (excluding Income)
  const categoryData = apiService.getByCategory(expenses)
  const pieData = categoryData
    .filter((item) => item.category !== "Income")
    .map((item, index) => ({
      name: item.category,
      value: item.total,
      fill: COLORS[index % COLORS.length],
    }))

  // Get monthly trend data
  const monthlyData = apiService.getMonthlyTotals(expenses, 6)
  const lineData = monthlyData.map((item) => ({
    month: item.month,
    expenses: item.expenses,
    income: item.income,
  }))

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SetupGuard>
          <AppLayout>
            <div className="p-6">
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            </div>
          </AppLayout>
        </SetupGuard>
      </ProtectedRoute>
    )
  }

  if (expenses.length === 0) {
    return (
      <ProtectedRoute>
        <SetupGuard>
          <AppLayout>
            <div className="p-6">
              <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground text-lg">
                  No data available. Please add some expenses.
                </p>
              </div>
            </div>
          </AppLayout>
        </SetupGuard>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SetupGuard>
        <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">All time expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(thisMonthExpenses)}</div>
                <p className="text-xs text-muted-foreground">Current month expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)}
                </div>
                <p className="text-xs text-muted-foreground">Income - Expenses this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Line Chart - Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <RechartsTooltip 
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'expenses' ? 'Expenses' : 'Income'
                        ]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Expenses"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="Income"
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
      </SetupGuard>
    </ProtectedRoute>
  )
}