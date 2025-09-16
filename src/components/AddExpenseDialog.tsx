"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { CreateExpense } from "@/types/expense"
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

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CreateExpense & { id?: string }
  onSubmit?: (data: CreateExpense) => void
  onExpenseAdded?: () => Promise<void>
}

const expenseCategories = [
  "Food",
  "Transportation",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Shopping",
  "Education",
  "Travel",
  "Other",
]

const incomeCategories = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Gift",
  "Bonus",
  "Rental",
  "Other",
]

export default function AddExpenseDialog({ 
  open, 
  onOpenChange, 
  initialData, 
  onSubmit, 
  onExpenseAdded 
}: AddExpenseDialogProps) {
  const { toast } = useToast()
  const { user, supabase } = useSupabase()
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    transaction_date: initialData?.transaction_date || new Date().toISOString().split("T")[0],
    transaction_type: initialData?.transaction_type || "expense",
  })
  
  const [errors, setErrors] = useState<{
    title?: string
    amount?: string
    transaction_date?: string
    category?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }
    
    // Validate amount
    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    
    // Validate date
    if (!formData.transaction_date) {
      newErrors.transaction_date = "Date is required"
    }
    
    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
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
      const expenseData: CreateExpense = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        transaction_date: formData.transaction_date,
        transaction_type: formData.transaction_type as 'income' | 'expense',
      }

      if (initialData?.id) {
        // Update existing expense
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', initialData.id)
          .eq('user_id', user.id)

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Expense updated successfully.",
        })
      } else {
        // Create new expense
        const { error } = await supabase
          .from('expenses')
          .insert([{ ...expenseData, user_id: user.id }])

        if (error) {
          throw error
        }

        toast({
          title: "Success",
          description: "Expense added successfully.",
        })
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
      })
    }
  }, [initialData])

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
                  {(formData.transaction_type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}