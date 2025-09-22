"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Plus,
  Minus,
  PiggyBank,
  Loader2,
} from "lucide-react"
import { Savings } from "@/types/savings"
import { formatCurrency } from "@/lib/user-preferences"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"

interface SimpleSavingsCardProps {
  savings: Savings
  onEdit: (savings: Savings) => void
  onDelete: (id: string) => void
  onContributionAdded: () => void
  onGoalCompleted?: (savings: Savings) => void
}

export function SimpleSavingsCard({
  savings,
  onEdit,
  onDelete,
  onContributionAdded,
  onGoalCompleted
}: SimpleSavingsCardProps) {
  const [contributionAmount, setContributionAmount] = useState("")
  const [isContributing, setIsContributing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const progress = (savings.saved_amount / savings.target_amount) * 100
  const isCompleted = savings.saved_amount >= savings.target_amount

  const handleContribution = async () => {
    const amount = parseFloat(contributionAmount)
    if (!contributionAmount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }
    
    if (!supabase || !user) {
      toast({
        title: "Error",
        description: "Unable to connect to database",
        variant: "destructive",
      })
      return
    }
    
    setIsContributing(true)
    try {
      const newSavedAmount = savings.saved_amount + amount
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('savings')
        .update({ saved_amount: newSavedAmount })
        .eq('id', savings.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Contribution Added!",
        description: `Added ${formatCurrency(amount)} to your "${savings.goal_name}" goal`,
      })

      onContributionAdded()
      setContributionAmount("")
      
      // Check if goal is completed
      if (newSavedAmount >= savings.target_amount && onGoalCompleted) {
        onGoalCompleted(savings)
      }
    } catch (error) {
      console.error('Error adding contribution:', error)
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsContributing(false)
    }
  }

  const handleWithdrawal = async () => {
    const amount = parseFloat(contributionAmount)
    if (!contributionAmount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }
    
    if (amount > savings.saved_amount) {
      toast({
        title: "Insufficient Funds",
        description: "Cannot withdraw more than the current saved amount",
        variant: "destructive",
      })
      return
    }
    
    if (!supabase || !user) {
      toast({
        title: "Error",
        description: "Unable to connect to database",
        variant: "destructive",
      })
      return
    }
    
    setIsWithdrawing(true)
    try {
      const newSavedAmount = Math.max(0, savings.saved_amount - amount)
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('savings')
        .update({ saved_amount: newSavedAmount })
        .eq('id', savings.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Withdrawal Successful",
        description: `Withdrew ${formatCurrency(amount)} from your "${savings.goal_name}" goal`,
      })

      onContributionAdded()
      setContributionAmount("")
    } catch (error) {
      console.error('Error withdrawing amount:', error)
      toast({
        title: "Error",
        description: "Failed to withdraw amount. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
              <PiggyBank className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {savings.goal_name}
              </CardTitle>
              {savings.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {savings.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={`text-xs font-medium px-2 py-1 ${getPriorityColor(savings.priority)}`}>
            {savings.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(savings.saved_amount)}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatCurrency(savings.target_amount)}
            </span>
          </div>
        </div>

        {/* Contribution Controls - Only show if not completed */}
        {!isCompleted && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleContribution}
                disabled={isContributing || !contributionAmount}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isContributing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWithdrawal}
                disabled={isWithdrawing || !contributionAmount}
                className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
              >
                {isWithdrawing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Add Buttons */}
            <div className="flex gap-2">
              {[100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  size="sm"
                  variant="outline"
                  onClick={() => setContributionAmount(amount.toString())}
                  className="text-xs px-3 py-1 h-8"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(savings)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Goal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${savings.goal_name}"? This action cannot be undone.`)) {
                onDelete(savings.id)
              }
            }}
            className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
