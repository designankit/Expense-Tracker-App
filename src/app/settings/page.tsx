"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Trash2, 
  AlertTriangle,
  Tag,
  DollarSign,
  Settings2
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
// Demo expense type
interface Expense {
  id: string
  amount: number
  category: string
  type: string
  date: string
  note?: string
  userId: string
}

// Demo user data
const demoUser = {
  name: "Demo User",
  email: "demo@example.com",
  image: undefined,
  currency: "INR",
  timezone: "Asia/Kolkata",
  categories: ["Food", "Travel", "Shopping", "Bills"],
  emailNotif: false,
  twoFA: false
}
import { AccountSettings } from "@/components/account-settings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail } from "lucide-react"

export default function SettingsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  // Currency formatting function
  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }
  // Demo session data
  const session = { user: demoUser }

  const getUserInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return "U"
  }

  useEffect(() => {
    // Demo data
    const demoExpenses: Expense[] = [
      {
        id: "1",
        amount: 1500,
        category: "Food",
        type: "expense",
        date: new Date().toISOString(),
        note: "Lunch",
        userId: "demo"
      },
      {
        id: "2",
        amount: 5000,
        category: "Income",
        type: "income",
        date: new Date().toISOString(),
        note: "Salary",
        userId: "demo"
      }
    ]
    setExpenses(demoExpenses)
    setIsLoading(false)
  }, [])

  const clearExpenses = () => {
    // Demo mode - just clear local state
    setExpenses([])
    toast({
      title: "Demo Mode",
      description: "In demo mode, expenses are cleared locally only.",
    })
  }

  const getByCategory = () => {
    const categoryTotals = expenses
      .filter(expense => expense.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total
    }))
  }
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClearAllExpenses = () => {
    if (window.confirm(
      'Are you sure you want to clear ALL expenses? This action cannot be undone and will permanently delete all your expense data.'
    )) {
      clearExpenses()
      toast({
        title: "All Data Cleared",
        description: "All expenses and income data have been deleted successfully.",
        variant: "destructive",
      })
    }
  }

  const categories = getByCategory()
  const categoryList = Object.keys(categories).sort()

  if (!mounted || isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your application preferences and data
              </p>
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your application preferences and data
              </p>
            </div>

            {/* Profile Information (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your profile details (editable through setup wizard)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {/* Profile Picture */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={session?.user?.image || undefined} 
                      alt={session?.user?.name || session?.user?.email || ""} 
                    />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {getUserInitials(session?.user?.name || null, session?.user?.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Profile Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {session?.user?.name || "No name set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Edit Hint */}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      To edit profile details, use the setup wizard
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <AccountSettings />

            {/* Quick Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Quick Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Setup Wizard</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete or redo your account setup to configure all preferences at once.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push("/setup-account")}
                      className="flex items-center gap-2"
                    >
                      <Settings2 className="h-4 w-4" />
                      Go to Setup Wizard
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={async () => {
                        if (window.confirm("This will reset your setup status and allow you to go through the setup wizard again. Continue?")) {
                          try {
                            const response = await fetch("/api/user/reset-setup", { method: "POST" })
                            if (response.ok) {
                              toast({
                                title: "Setup Reset",
                                description: "Setup status has been reset. You can now go through the setup wizard.",
                              })
                              router.push("/setup-account")
                            }
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          } catch (_error) {
                            toast({
                              title: "Error",
                              description: "Failed to reset setup status.",
                              variant: "destructive"
                            })
                          }
                        }
                      }}
                    >
                      Reset Setup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Theme</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("light")
                        toast({
                          title: "Theme Changed",
                          description: "Switched to light theme",
                        })
                      }}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("dark")
                        toast({
                          title: "Theme Changed",
                          description: "Switched to dark theme",
                        })
                      }}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTheme("system")
                        toast({
                          title: "Theme Changed",
                          description: "Switched to system theme",
                        })
                      }}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Choose how the application looks to you
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Categories Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Active Categories ({categoryList.length})
                    </h3>
                    {categoryList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {categoryList.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No categories found. Add some expenses to see categories here.
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Total Expenses</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {formatAmount(expenses
                          .filter(expense => expense.type === 'expense')
                          .reduce((sum, expense) => sum + expense.amount, 0))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Total Income</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatAmount(expenses
                          .filter(expense => expense.type === 'income')
                          .reduce((sum, expense) => sum + expense.amount, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all expenses and income data. This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="destructive"
                      onClick={handleClearAllExpenses}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All Expenses
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {expenses.length} entries will be deleted
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>ExpenseTracker</strong> - A simple and effective expense management application</p>
                  <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
                  <p>Data is stored locally in your browser</p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  )
}
