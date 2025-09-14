"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
// Demo expense data type
interface CreateExpenseData {
  amount: number
  category: string
  type: "expense" | "income"
  date: string
  note?: string
}
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MoneyCharacter } from "@/components/expense/money-character"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: CreateExpenseData & { id?: string }
  onSubmit?: (data: CreateExpenseData) => void
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
  "Other",
]

export default function AddExpenseDialog({ open, onOpenChange, initialData, onSubmit, onExpenseAdded }: AddExpenseDialogProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || "",
    type: initialData?.type || "expense" as "expense" | "income",
    category: initialData?.category || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    note: initialData?.note || "",
  })
  
  const [errors, setErrors] = useState<{
    amount?: string
    date?: string
    category?: string
  }>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    // Validate amount
    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }
    
    // Validate date
    if (!formData.date) {
      newErrors.date = "Date is required"
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
    
    try {
      const expenseData: CreateExpenseData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: formData.date,
        note: formData.note || undefined,
      }

      if (initialData?.id) {
        // Demo mode - simulate update
        toast({
          title: "Demo Mode",
          description: `${expenseData.type === 'expense' ? 'Expense' : 'Income'} would be updated in demo mode.`,
        })
      } else {
        // Demo mode - simulate creation
        toast({
          title: "Demo Mode",
          description: `${expenseData.type === 'expense' ? 'Expense' : 'Income'} would be added in demo mode.`,
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
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      })
      setErrors({})
      
      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setFormData({
      amount: "",
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || "",
        type: initialData.type || "expense",
        category: initialData.category || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        note: initialData.note || "",
      })
    }
  }, [initialData])

  const currentCategories = formData.type === "expense" ? expenseCategories : incomeCategories

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Form */}
          <div className="flex-1 p-4 sm:p-6">
            <DialogHeader className="mb-4 sm:mb-6">
              <DialogTitle className="text-xl sm:text-2xl font-bold">
                {initialData ? "Edit" : "Add"} {formData.type === "expense" ? "Expense" : "Income"}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {initialData ? "Update" : "Enter"} the details for your {formData.type === "expense" ? "expense" : "income"} entry.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm sm:text-base">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "expense" | "income") => {
                handleInputChange("type", value)
                // Reset category when type changes
                handleInputChange("category", "")
              }}
            >
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm sm:text-base">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className={`h-10 sm:h-11 ${errors.amount ? "border-red-500" : ""}`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm sm:text-base">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className={`h-10 sm:h-11 ${errors.category ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map((category) => (
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm sm:text-base">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className={`h-10 sm:h-11 ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm sm:text-base">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this entry..."
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

              <DialogFooter className="mt-6 sm:mt-8 flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                  {initialData ? "Update" : "Add"} {formData.type === "expense" ? "Expense" : "Income"}
                </Button>
              </DialogFooter>
            </form>
          </div>
          
          {/* Right side - Animated Character - Hidden on mobile */}
          <div className="hidden lg:block w-80 border-l border-border min-h-[500px]">
            <MoneyCharacter />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
