"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Savings, CreateSavings, UpdateSavings } from "@/types/savings"

interface SavingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSavingsUpdated: () => void
  initialData?: Savings | null
}

export default function SavingsDialog({ 
  open, 
  onOpenChange, 
  onSavingsUpdated,
  initialData 
}: SavingsDialogProps) {
  const [formData, setFormData] = useState({
    goal_name: "",
    target_amount: "",
    saved_amount: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { toast } = useToast()
  const { user, supabase } = useSupabase()

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          goal_name: initialData.goal_name,
          target_amount: initialData.target_amount.toString(),
          saved_amount: initialData.saved_amount.toString()
        })
      } else {
        setFormData({
          goal_name: "",
          target_amount: "",
          saved_amount: "0"
        })
      }
      setErrors({})
    }
  }, [open, initialData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.goal_name.trim()) {
      newErrors.goal_name = "Goal name is required"
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = "Target amount must be greater than 0"
    }

    const savedAmount = parseFloat(formData.saved_amount || "0")
    if (savedAmount < 0) {
      newErrors.saved_amount = "Saved amount cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user || !supabase) {
      return
    }

    setIsLoading(true)

    try {
      const savingsData: CreateSavings | UpdateSavings = {
        goal_name: formData.goal_name.trim(),
        target_amount: parseFloat(formData.target_amount),
        saved_amount: parseFloat(formData.saved_amount || "0")
      }

      if (initialData) {
        // Update existing savings goal
        const { error } = await supabase
          .from('savings')
          .update(savingsData)
          .eq('id', initialData.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Savings goal updated successfully!",
        })
      } else {
        // Create new savings goal
        const { error } = await supabase
          .from('savings')
          .insert([{
            ...savingsData,
            user_id: user.id
          }])

        if (error) throw error

        toast({
          title: "Success",
          description: "Savings goal created successfully!",
        })
      }

      onSavingsUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving savings goal:', error)
      toast({
        title: "Error",
        description: "Failed to save savings goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Savings Goal" : "Add Savings Goal"}
          </DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update your savings goal details below."
              : "Create a new savings goal to track your progress."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal_name">Goal Name</Label>
            <Input
              id="goal_name"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              value={formData.goal_name}
              onChange={(e) => handleInputChange("goal_name", e.target.value)}
              className={errors.goal_name ? "border-red-500" : ""}
            />
            {errors.goal_name && (
              <p className="text-sm text-red-500">{errors.goal_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Target Amount (₹)</Label>
            <Input
              id="target_amount"
              type="number"
              placeholder="100000"
              value={formData.target_amount}
              onChange={(e) => handleInputChange("target_amount", e.target.value)}
              className={errors.target_amount ? "border-red-500" : ""}
            />
            {errors.target_amount && (
              <p className="text-sm text-red-500">{errors.target_amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="saved_amount">Current Amount Saved (₹)</Label>
            <Input
              id="saved_amount"
              type="number"
              placeholder="0"
              value={formData.saved_amount}
              onChange={(e) => handleInputChange("saved_amount", e.target.value)}
              className={errors.saved_amount ? "border-red-500" : ""}
            />
            {errors.saved_amount && (
              <p className="text-sm text-red-500">{errors.saved_amount}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
