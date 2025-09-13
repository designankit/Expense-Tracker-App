"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Cards } from "@/components/dashboard/cards"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { Button } from "@/components/ui/button"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import AddExpenseDialog from "@/components/AddExpenseDialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SetupGuard } from "@/components/auth/setup-guard"
import { useSession } from "next-auth/react"
import { apiService, Expense } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { exportJSON, exportCSV, exportPDF, triggerJSONImport } from "@/lib/io"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Download, Upload, FileText, FileSpreadsheet, FileType } from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const { addDemoNotifications } = useNotifications()

  useEffect(() => {
    const fetchExpenses = async () => {
      // Wait for session to be loaded
      if (status === "loading") {
        console.log("Dashboard: Waiting for session to load...")
        return
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(session as any)?.user?.id) {
        console.log("Dashboard: No session available, skipping expense fetch")
        setIsLoading(false)
        return
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log("Dashboard: Session available, fetching expenses for user:", (session as any).user.id)
        const data = await apiService.getExpenses()
        setExpenses(data)
        
        // Add demo notifications once when expenses are loaded
        addDemoNotifications()
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
        toast({
          title: "Error",
          description: "Failed to load expenses",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [toast, session, status, addDemoNotifications])

  const handleExport = (format: "json" | "csv" | "pdf") => {
    try {
      if (expenses.length === 0) {
        toast({
          title: "No Data",
          description: "No expenses to export. Add some expenses first.",
          variant: "destructive",
        })
        return
      }

      if (format === "json") {
        exportJSON(expenses)
        toast({
          title: "Export Successful",
          description: "Expenses exported to JSON file.",
        })
      } else if (format === "csv") {
        exportCSV(expenses)
        toast({
          title: "Export Successful",
          description: "Expenses exported to CSV file.",
        })
      } else if (format === "pdf") {
        exportPDF(expenses)
        toast({
          title: "Export Successful",
          description: "Expense report opened for printing/saving as PDF.",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: "Export Failed",
        description: "Failed to export expenses. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    try {
      const success = await triggerJSONImport(async (importedExpenses) => {
        // Add each expense individually to avoid overwriting existing data
        for (const expense of importedExpenses) {
          await apiService.createExpense({
            amount: expense.amount,
            category: expense.category,
            type: expense.type,
            date: expense.date,
            note: expense.note
          })
        }
        // Refresh expenses
        const data = await apiService.getExpenses()
        setExpenses(data)
      })

      if (success) {
        toast({
          title: "Import Successful",
          description: "Expenses imported successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import expenses. Please check the file format.",
        variant: "destructive",
      })
    }
  }

  const generateDemoData = async () => {
    try {
      // Clear existing data by fetching current expenses and deleting them
      const currentExpenses = await apiService.getExpenses()
      for (const expense of currentExpenses) {
        await apiService.deleteExpense(expense.id)
      }

      // Categories for expenses and income
      const expenseCategories = ["Food", "Travel", "Shopping", "Bills", "Entertainment"]
      const incomeCategory = "Income"
      
      // Sample notes for each category
      const notesByCategory = {
        "Food": ["Lunch", "Groceries", "Dinner", "Coffee", "Snacks", "Restaurant"],
        "Travel": ["Taxi", "Bus fare", "Train ticket", "Flight", "Hotel", "Gas"],
        "Shopping": ["Clothes", "Electronics", "Books", "Gifts", "Home items"],
        "Bills": ["Electricity", "Water", "Internet", "Phone", "Rent", "Insurance"],
        "Entertainment": ["Movie", "Concert", "Game", "Streaming", "Sports", "Theater"],
        "Income": ["Salary", "Freelance", "Bonus", "Investment", "Refund", "Gift"]
      }

      // Generate 20 expenses
      for (let i = 0; i < 20; i++) {
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
        const notes = notesByCategory[category as keyof typeof notesByCategory]
        const note = notes[Math.floor(Math.random() * notes.length)]
        
        // Random date within last 90 days
        const daysAgo = Math.floor(Math.random() * 90)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        await apiService.createExpense({
          amount: Math.floor(Math.random() * 4900) + 100, // 100 to 5000
          category,
          type: "expense",
          date: date.toISOString().split('T')[0],
          note: `${note} - ${new Date().toLocaleDateString()}`
        })
      }

      // Generate 5 income entries
      for (let i = 0; i < 5; i++) {
        const notes = notesByCategory["Income"]
        const note = notes[Math.floor(Math.random() * notes.length)]
        
        // Random date within last 90 days
        const daysAgo = Math.floor(Math.random() * 90)
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        
        await apiService.createExpense({
          amount: Math.floor(Math.random() * 4900) + 100, // 100 to 5000
          category: incomeCategory,
          type: "income",
          date: date.toISOString().split('T')[0],
          note: `${note} - ${new Date().toLocaleDateString()}`
        })
      }

      // Refresh expenses
      const data = await apiService.getExpenses()
      setExpenses(data)

      toast({
        title: "Demo Data Added",
        description: "25 sample records have been generated for testing.",
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: "Demo Data Failed",
        description: "Failed to generate demo data. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <SetupGuard>
        <AppLayout>
        <div className="p-6">
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-6">
              <Cards expenses={expenses} />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                  <RecentExpenses expenses={expenses} />
                </div>
                <TooltipProvider>
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            className="w-full justify-start" 
                            variant="default"
                            onClick={() => setIsAddExpenseOpen(true)}
                          >
                            Add New Expense
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add a new expense to your tracker</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="w-full justify-start" variant="secondary">
                            View Reports
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View detailed expense reports and analytics</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Export Data Dropdown */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Export Data</label>
                        <Select onValueChange={(value) => handleExport(value as "json" | "csv" | "pdf")}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose export format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Export as JSON
                              </div>
                            </SelectItem>
                            <SelectItem value="csv">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Export as CSV
                              </div>
                            </SelectItem>
                            <SelectItem value="pdf">
                              <div className="flex items-center gap-2">
                                <FileType className="h-4 w-4" />
                                Export as PDF
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Import Data Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            className="w-full justify-start" 
                            variant="outline"
                            onClick={handleImport}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Import expenses from JSON file</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Seed Demo Data Button - Development Only */}
                      {process.env.NODE_ENV !== "production" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              className="w-full justify-start" 
                              variant="secondary"
                              onClick={generateDemoData}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Seed Demo Data
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Generate 25 sample records for testing (dev only)</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              </div>

              {/* Charts Section */}
              <ExpenseCharts expenses={expenses} />
            </div>
          )}
        </div>
        
        {/* Add Expense Dialog */}
        <AddExpenseDialog 
          open={isAddExpenseOpen} 
          onOpenChange={setIsAddExpenseOpen}
          onExpenseAdded={async () => {
            const data = await apiService.getExpenses()
            setExpenses(data)
          }}
        />
        </AppLayout>
      </SetupGuard>
    </ProtectedRoute>
  )
}
