"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
  Car,
  Plane,
  Home,
  Shield,
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  Loader2
} from "lucide-react"
import { Savings, GoalContribution, CreateContribution, GoalStatus } from "@/types/savings"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"

// Goal icons mapping
const GOAL_ICONS = {
  Car: Car,
  Travel: Plane,
  House: Home,
  Emergency: Shield,
  PiggyBank: PiggyBank,
  Default: Target
}

// Priority colors
const PRIORITY_COLORS = {
  High: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  Low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-200 dark:border-gray-800'
}

// Status colors
const STATUS_COLORS = {
  'On Track': 'text-green-600 dark:text-green-400',
  'Slightly Behind': 'text-yellow-600 dark:text-yellow-400',
  'At Risk': 'text-red-600 dark:text-red-400',
  'Completed': 'text-green-600 dark:text-green-400'
}

interface EnhancedSavingsCardProps {
  savings: Savings
  onEdit: (savings: Savings) => void
  onDelete: (id: string) => void
  onContributionAdded: () => void
}

export function EnhancedSavingsCard({ 
  savings, 
  onEdit, 
  onDelete, 
  onContributionAdded
}: EnhancedSavingsCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isContributeOpen, setIsContributeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [contributionData, setContributionData] = useState({
    amount: '',
    contribution_date: new Date().toISOString().split('T')[0],
    note: ''
  })
  
  const { toast } = useToast()
  const { user, supabase } = useSupabase()

  // Calculate goal metrics
  const progress = (savings.saved_amount / savings.target_amount) * 100
  const remaining = savings.target_amount - savings.saved_amount
  const isCompleted = savings.saved_amount >= savings.target_amount

  // Calculate goal status
  const getGoalStatus = (): GoalStatus => {
    if (isCompleted) return 'Completed'
    if (!savings.target_date) return 'On Track'

    const now = new Date()
    const targetDate = new Date(savings.target_date)
    const totalDays = Math.ceil((targetDate.getTime() - new Date(savings.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const elapsedDays = Math.ceil((now.getTime() - new Date(savings.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const expectedProgress = Math.min((elapsedDays / totalDays) * 100, 100)
    
    if (progress >= expectedProgress * 0.9) return 'On Track'
    if (progress >= expectedProgress * 0.7) return 'Slightly Behind'
    return 'At Risk'
  }

  const goalStatus = getGoalStatus()

  // Calculate required monthly saving
  const getRequiredMonthlySaving = (): number => {
    if (!savings.target_date || isCompleted) return 0
    
    const now = new Date()
    const targetDate = new Date(savings.target_date)
    const monthsRemaining = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    
    return remaining / monthsRemaining
  }

  // Get goal icon component
  const GoalIcon = GOAL_ICONS[savings.goal_icon as keyof typeof GOAL_ICONS] || GOAL_ICONS.Default

  // Fetch contributions
  useEffect(() => {
    const fetchContributions = async () => {
      if (!supabase || !user) return

      try {
        const { data, error } = await supabase
          .from('goal_contributions')
          .select('*')
          .eq('goal_id', savings.id)
          .eq('user_id', user.id)
          .order('contribution_date', { ascending: false })
          .limit(3)

        if (error) throw error
        setContributions(data || [])
      } catch (error) {
        console.error('Error fetching contributions:', error)
      }
    }

    fetchContributions()
  }, [savings.id, supabase, user])

  // Handle contribution submission
  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !supabase || !contributionData.amount) return

    setIsSubmitting(true)
    try {
      const contribution: CreateContribution = {
        goal_id: savings.id,
        amount: parseFloat(contributionData.amount),
        contribution_date: contributionData.contribution_date,
        note: contributionData.note || undefined
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('goal_contributions')
        .insert([{
          ...contribution,
          user_id: user.id
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Contribution added successfully!",
      })

      setIsContributeOpen(false)
      setContributionData({
        amount: '',
        contribution_date: new Date().toISOString().split('T')[0],
        note: ''
      })
      
      onContributionAdded()
    } catch (error) {
      console.error('Error adding contribution:', error)
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${savings.goal_name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', savings.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Savings goal deleted successfully!",
      })

      onDelete(savings.id)
    } catch (error) {
      console.error('Error deleting savings goal:', error)
      toast({
        title: "Error",
        description: "Failed to delete savings goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Get motivational tip
  const getMotivationalTip = (): string => {
    if (isCompleted) {
      return "🎉 Congratulations! You've achieved your goal!"
    }

    const milestones = [25, 50, 75, 90]
    for (const milestone of milestones) {
      const amountToMilestone = (savings.target_amount * milestone / 100) - savings.saved_amount
      if (amountToMilestone > 0 && amountToMilestone <= remaining * 0.3) {
        return `Just ₹${amountToMilestone.toLocaleString()} more to hit ${milestone}% 🚀`
      }
    }

    if (remaining <= savings.target_amount * 0.1) {
      return `You're almost there! Only ₹${remaining.toLocaleString()} remaining! 💪`
    }

    return `Keep going! Every contribution brings you closer to your goal. 🌟`
  }

  // Radial Progress Component
  const RadialProgress = ({ size = 120, strokeWidth = 8 }: { size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const getStatusColor = () => {
      switch (goalStatus) {
        case 'Completed':
          return '#10B981'
        case 'On Track':
          return '#10B981'
        case 'Slightly Behind':
          return '#F59E0B'
        case 'At Risk':
          return '#EF4444'
        default:
          return '#6B7280'
      }
    }

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getStatusColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: getStatusColor() }}>
              {progress.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <GoalIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {savings.goal_name}
                  </CardTitle>
                  <Badge className={`text-xs ${PRIORITY_COLORS[savings.priority]}`}>
                    {savings.priority === 'High' ? '🔴' : savings.priority === 'Medium' ? '🟡' : '⚪'} {savings.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(savings.created_at).toLocaleDateString()}
                </p>
                {savings.target_date && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Target: {new Date(savings.target_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(savings)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <Badge 
                  variant={isCompleted ? "default" : "secondary"}
                  className={isCompleted ? "bg-green-500" : STATUS_COLORS[goalStatus]}
                >
                  {goalStatus === 'Completed' ? '✅' : goalStatus === 'Slightly Behind' ? '⚠️' : goalStatus === 'At Risk' ? '❌' : '✅'} {goalStatus}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <RadialProgress size={100} strokeWidth={6} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div>Saved {progress.toFixed(1)}% (₹{savings.saved_amount.toLocaleString()} of ₹{savings.target_amount.toLocaleString()})</div>
                        {savings.target_date && (
                          <div>Target: {new Date(savings.target_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Saved</span>
                    <span className="font-medium">₹{savings.saved_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Target</span>
                    <span className="font-medium">₹{savings.target_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      ₹{remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Monthly Saving */}
          {savings.target_date && !isCompleted && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Required Monthly Saving
                </span>
              </div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{getRequiredMonthlySaving().toLocaleString()}
              </p>
            </div>
          )}

          {/* Recent Contributions */}
          {contributions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Recent Contributions
              </h4>
              <div className="space-y-1">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(contribution.contribution_date).toLocaleDateString()}
                      </span>
                      {contribution.note && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          - {contribution.note}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      +₹{contribution.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              onClick={() => setIsContributeOpen(true)}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          </div>

          {/* Motivational Tip */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3">
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
              {getMotivationalTip()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contribution Dialog */}
      <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add a contribution to &quot;{savings.goal_name}&quot;
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContributionSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={contributionData.amount}
                onChange={(e) => setContributionData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="contribution_date">Date</Label>
              <Input
                id="contribution_date"
                type="date"
                value={contributionData.contribution_date}
                onChange={(e) => setContributionData(prev => ({ ...prev, contribution_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this contribution..."
                value={contributionData.note}
                onChange={(e) => setContributionData(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContributeOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Contribution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
