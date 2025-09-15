"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Cards } from "@/components/dashboard/cards"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { Button } from "@/components/ui/button"
import { ExpenseCharts } from "@/components/dashboard/expense-charts"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import AddExpenseDialog from "@/components/AddExpenseDialog"
// Demo expense type
interface Expense {
  id: string
  amount: number
  category: string
  type: "expense" | "income"
  date: string
  note?: string
  userId: string
  createdAt: string
  updatedAt: string
}
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Upload, FileText, FileSpreadsheet, FileType } from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { toast } = useToast()
  const { addDemoNotifications } = useNotifications()

  useEffect(() => {
    // Demo expenses data
    const demoExpenses: Expense[] = [
      {
        id: "1",
        amount: 1500,
        category: "Food",
        type: "expense",
        date: new Date().toISOString(),
        note: "Lunch at restaurant",
        userId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2", 
        amount: 5000,
        category: "Income",
        type: "income",
        date: new Date().toISOString(),
        note: "Freelance work",
        userId: "demo-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    // Set expenses and stop loading immediately
    setExpenses(demoExpenses)
    setIsLoading(false)
  }, [])

  // Add demo notifications only once on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addDemoNotifications()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [addDemoNotifications])




  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-3 sm:p-4 lg:p-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track your expenses and manage your finances
                </p>
              </div>
              <Button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="w-full sm:w-auto"
              >
                Add Expense
              </Button>
            </div>

            {/* Cards */}
            <Cards expenses={expenses} />

            {/* Recent Expenses and Export/Import */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <RecentExpenses expenses={expenses} />
              </div>
              
              {/* Export/Import Section */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Data Management
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Export Options */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Export Data
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportJSON(expenses)}
                                className="flex items-center gap-2"
                              >
                                <FileType className="h-4 w-4" />
                                JSON
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Export as JSON file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportCSV(expenses)}
                                className="flex items-center gap-2"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                                CSV
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Export as CSV file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportPDF(expenses)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                PDF
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Export as PDF report</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Import Options */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Import Data
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => triggerJSONImport(() => {})}
                                className="flex items-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                JSON
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Import from JSON file</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
        onSubmit={() => {
          // Demo mode - just show success message
          toast({
            title: "Demo Mode",
            description: "Expense would be saved in demo mode.",
          })
        }}
        onExpenseAdded={async () => {
          // For demo purposes, just close the dialog
          setIsAddExpenseOpen(false)
          toast({
            title: "Demo Mode",
            description: "In demo mode, expenses are not actually saved.",
          })
        }}
      />
    </AppLayout>
  </AuthGuard>
  )
}
