"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useNotifications } from "@/contexts/NotificationContext"
import { CreateExpense } from "@/types/expense"
import { FREQUENCY_OPTIONS, calculateNextDueDate } from "@/types/recurring-transaction"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"


interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CreateExpense & { id?: string }
  onSubmit?: (data: CreateExpense) => void
  onExpenseAdded?: () => Promise<void>
}

interface CustomCategory {
  id: string
  name: string
  color: string
  transaction_type: 'expense' | 'income'
}

export default function AddExpenseDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit, 
  onExpenseAdded 
}: AddExpenseDialogProps) {
  const { toast } = useToast()
  const { user, supabase } = useSupabase()
  const { addNotification } = useNotifications()
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    transaction_date: initialData?.transaction_date || new Date().toISOString().split("T")[0],
    transaction_type: initialData?.transaction_type || "expense",
    is_recurring: false,
    frequency: "monthly" as const,
    end_date: "",
  })
  
  const [errors, setErrors] = useState<{
    title?: string
    amount?: string
    transaction_date?: string
    category?: string
    frequency?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CustomCategory[]>([])

  const checkBudgetWarnings = async () => {
    if (!user || !supabase) return

    try {
      // Get current month's total expenses
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: expenses, error } = await (supabase as any)
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
        .lte('transaction_date', endOfMonth.toISOString().split('T')[0])

      if (error) {
        console.error('Error fetching expenses for budget check:', error)
        return
      }

      const totalExpenses = expenses?.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0) || 0
      
      // Simple budget thresholds (you can customize these)
      const budgetLimits = {
        warning: 30000,  // ₹30,000 warning threshold
        critical: 40000  // ₹40,000 critical threshold
      }

      if (totalExpenses >= budgetLimits.critical) {
        await addNotification({
          title: "Budget Exceeded!",
          message: `You've spent ₹${totalExpenses.toLocaleString()} this month, exceeding your budget limit.`,
          type: 'error',
          actionUrl: '/analytics'
        })
      } else if (totalExpenses >= budgetLimits.warning) {
        await addNotification({
          title: "Budget Warning",
          message: `You've spent ₹${totalExpenses.toLocaleString()} this month. Consider reviewing your expenses.`,
          type: 'warning',
          actionUrl: '/analytics'
        })
      }
    } catch (error) {
      console.error('Error checking budget warnings:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (dataToValidate = formData) => {
    const newErrors: typeof errors = {}
    
    // Validate title
    if (!dataToValidate.title.trim()) {
      newErrors.title = "Title is required"
    }
    
    // Validate amount
    const amount = parseFloat(dataToValidate.amount)
    if (!dataToValidate.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    
    // Validate date
    if (!dataToValidate.transaction_date) {
      newErrors.transaction_date = "Date is required"
    }
    
    // Validate category
    if (!dataToValidate.category.trim()) {
      newErrors.category = "Category is required"
    }
    
    // Validate recurring transaction fields
    if (dataToValidate.is_recurring && !dataToValidate.frequency) {
      newErrors.frequency = "Frequency is required for scheduled transactions"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare form data for validation
    const dataToValidate = { ...formData }
    
    // Ensure a category is selected
    if (!formData.category.trim()) {
      setErrors({ category: "Category is required" })
      return
    }

    const validationPassed = validateForm(dataToValidate)
    
    if (!validationPassed) {
      return
    }

    if (!user || !supabase) {
      toast({
        title: "Error",
        description: "Please log in to add expenses.",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const finalCategory = formData.category

      const expenseData: CreateExpense = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: finalCategory,
        transaction_date: formData.transaction_date,
        transaction_type: formData.transaction_type as 'income' | 'expense',
      }

      if (initialData?.id) {
        // Update existing expense
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('expenses')
          .update({
            title: expenseData.title,
            amount: expenseData.amount,
            category: expenseData.category,
            transaction_date: expenseData.transaction_date,
            transaction_type: expenseData.transaction_type,
          })
          .eq('id', initialData.id)
          .eq('user_id', user.id)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Expense updated successfully.",
        })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactionAdded'))
        }
      } else {
        // Create new expense
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('expenses')
          .insert([{ ...expenseData, user_id: user.id }])

        if (error) {
          throw error
        }

        // If this is a recurring transaction, create the recurring rule
        if (formData.is_recurring) {
          const startDate = new Date(formData.transaction_date)
          const nextDueDate = calculateNextDueDate(
            formData.frequency,
            startDate
          )

          const recurringData = {
            user_id: user.id,
            title: formData.title,
            amount: parseFloat(formData.amount),
            category: finalCategory,
            transaction_type: formData.transaction_type as 'income' | 'expense',
            frequency: formData.frequency,
            start_date: formData.transaction_date,
            end_date: formData.end_date || null,
            next_due_date: nextDueDate.toISOString().split('T')[0],
            is_active: true,
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: recurringError } = await (supabase as any)
            .from('recurring_transactions')
            .insert([recurringData])

          if (recurringError) {
            console.error('Error creating recurring transaction:', recurringError)
            // Don't throw here, just log the error as the main transaction was created
          }
        }

        toast({
          title: "Success",
          description: formData.is_recurring 
            ? "Scheduled transaction created successfully." 
            : "Transaction added successfully.",
        })

        // Check for budget warnings (only for new expenses)
        await checkBudgetWarnings()

        // Trigger notification checks
        try {
          await fetch('/api/notifications/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id
            })
          })
        } catch (error) {
          console.error('Error triggering notification checks:', error)
        }

        // Refresh categories list to include the new category
        fetchCategories()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('transactionAdded'))
        }
      }

      if (onSubmit) {
        onSubmit(expenseData)
      }

      if (onExpenseAdded) {
        await onExpenseAdded()
      }
      
      // Reset form
      setFormData({
        title: "",
        amount: "",
        category: "",
        transaction_date: new Date().toISOString().split("T")[0],
        transaction_type: "expense",
        is_recurring: false,
        frequency: "monthly",
        end_date: "",
      })
      setErrors({})
      
      
      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting expense:", error)
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      transaction_date: new Date().toISOString().split("T")[0],
      transaction_type: "expense",
      is_recurring: false,
      frequency: "monthly",
      end_date: "",
    })
    setErrors({})
    
    onOpenChange(false)
  }

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount?.toString() || "",
        category: initialData.category || "",
        transaction_date: initialData.transaction_date || new Date().toISOString().split("T")[0],
        transaction_type: initialData.transaction_type || "expense",
        is_recurring: false,
        frequency: "monthly",
        end_date: "",
      })
    }
  }, [initialData])

  // Fetch categories function
  const fetchCategories = useCallback(async () => {
    if (!user || !supabase || !open) return

    try {
      // Get unique categories from existing expenses for this transaction type
      const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('expenses')
        .select('category')
        .eq('user_id', user.id)
        .eq('transaction_type', formData.transaction_type)
        .not('category', 'is', null)

      if (error) throw error
      
      // Get unique categories and create simple category objects
      const uniqueCategories = [...new Set(data?.map((item: any) => item.category).filter(Boolean) || [])] as string[] // eslint-disable-line @typescript-eslint/no-explicit-any
      const categoryObjects = uniqueCategories.map((category: string, index: number) => ({
        id: `existing-${index}`,
        name: category,
        color: '#10b981', // Default green color for existing categories
        transaction_type: formData.transaction_type
      }))
      
      setCategories(categoryObjects)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [user, supabase, open, formData.transaction_type])

  // Fetch categories when dialog opens
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense to track your finances.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter transaction title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction_type">Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => {
                  handleInputChange("transaction_type", value)
                  // Reset category when type changes
                  handleInputChange("category", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
              
              
              
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleInputChange("transaction_date", e.target.value)}
                className={errors.transaction_date ? "border-red-500" : ""}
              />
              {errors.transaction_date && (
                <p className="text-sm text-red-500">{errors.transaction_date}</p>
              )}
            </div>

            {/* Recurring Transaction Fields */}
            <div className="grid gap-4 py-4 border-t">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => handleInputChange("is_recurring", checked)}
                />
                <Label htmlFor="is_recurring">Schedule this transaction to repeat automatically</Label>
              </div>

              {formData.is_recurring && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) => handleInputChange("frequency", value)}
                    >
                      <SelectTrigger className={errors.frequency ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.frequency && (
                      <p className="text-sm text-red-500">{errors.frequency}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                      placeholder="Leave empty for indefinite"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Loading..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}