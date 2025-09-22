"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Car, Plane, Home, Shield, PiggyBank, Target, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useNotifications } from "@/contexts/NotificationContext"
import { Savings, CreateSavings, UpdateSavings } from "@/types/savings"

// Goal icons mapping
const GOAL_ICONS = {
  Car: { icon: Car, label: "Car" },
  Travel: { icon: Plane, label: "Travel" },
  House: { icon: Home, label: "House" },
  Emergency: { icon: Shield, label: "Emergency" },
  PiggyBank: { icon: PiggyBank, label: "General" },
  Default: { icon: Target, label: "Other" }
}

interface EnhancedSavingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSavingsUpdated: () => void
  initialData?: Savings | null
}

export default function EnhancedSavingsDialog({ 
  open, 
  onOpenChange, 
  onSavingsUpdated,
  initialData 
}: EnhancedSavingsDialogProps) {
  const [formData, setFormData] = useState({
    goal_name: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
    priority: "Medium" as "High" | "Medium" | "Low",
    goal_icon: "PiggyBank",
    description: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const { toast } = useToast()
  const { user, supabase } = useSupabase()
  const { addNotification } = useNotifications()

  const checkSavingsMilestones = async (savedAmount: number, targetAmount: number, goalName: string) => {
    if (!targetAmount || targetAmount <= 0) return

    const percentage = (savedAmount / targetAmount) * 100

    // Milestone thresholds
    if (percentage >= 100) {
      await addNotification({
        title: "🎉 Goal Achieved!",
        message: `Congratulations! You've reached 100% of your "${goalName}" goal!`,
        type: 'success',
        actionUrl: '/savings'
      })
    } else if (percentage >= 75) {
      await addNotification({
        title: "Almost There!",
        message: `You've saved 75% of your "${goalName}" goal. Keep it up!`,
        type: 'success',
        actionUrl: '/savings'
      })
    } else if (percentage >= 50) {
      await addNotification({
        title: "Halfway There!",
        message: `Great progress! You've saved 50% of your "${goalName}" goal.`,
        type: 'info',
        actionUrl: '/savings'
      })
    } else if (percentage >= 25 && savedAmount > 0) {
      await addNotification({
        title: "Good Start!",
        message: `You've saved 25% of your "${goalName}" goal. Keep going!`,
        type: 'info',
        actionUrl: '/savings'
      })
    }
  }

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          goal_name: initialData.goal_name,
          target_amount: initialData.target_amount.toString(),
          saved_amount: initialData.saved_amount.toString(),
          target_date: initialData.target_date ? initialData.target_date.split('T')[0] : "",
          priority: initialData.priority,
          goal_icon: initialData.goal_icon,
          description: initialData.description || ""
        })
      } else {
        setFormData({
          goal_name: "",
          target_amount: "",
          saved_amount: "0",
          target_date: "",
          priority: "Medium",
          goal_icon: "PiggyBank",
          description: ""
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

    if (formData.target_date) {
      const targetDate = new Date(formData.target_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (targetDate <= today) {
        newErrors.target_date = "Target date must be in the future"
      }
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
        saved_amount: parseFloat(formData.saved_amount || "0"),
        target_date: formData.target_date || undefined,
        priority: formData.priority,
        goal_icon: formData.goal_icon,
        description: formData.description.trim() || undefined
      }

      if (initialData) {
        // Update existing savings goal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('savings')
          .update(savingsData)
          .eq('id', initialData.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Savings goal updated successfully!",
        })

        // Trigger dashboard refresh
        console.log('Triggering dashboard refresh after savings update')
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
      } else {
        // Create new savings goal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('savings')
          .insert([{
            ...savingsData,
            user_id: user.id
          }])

        if (error) throw error

        // Add notification for goal creation
        await addNotification({
          title: "Savings Goal Created",
          message: `Created new goal: "${formData.goal_name}" with target of ₹${formData.target_amount}`,
          type: 'success',
          actionUrl: '/savings'
        })

        // Check for milestone notifications
        await checkSavingsMilestones(parseFloat(formData.saved_amount), parseFloat(formData.target_amount), formData.goal_name)

        toast({
          title: "Success",
          description: "Savings goal created successfully!",
        })

        // Trigger dashboard refresh
        console.log('Triggering dashboard refresh after savings creation')
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date (Optional)</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange("target_date", e.target.value)}
                className={errors.target_date ? "border-red-500" : ""}
              />
              {errors.target_date && (
                <p className="text-sm text-red-500">{errors.target_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "High" | "Medium" | "Low") => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">🔴 High</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_icon">Goal Icon</Label>
            <Select
              value={formData.goal_icon}
              onValueChange={(value) => handleInputChange("goal_icon", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_ICONS).map(([key, { icon: Icon, label }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for your savings goal..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
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
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initialData ? "Update Goal" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
