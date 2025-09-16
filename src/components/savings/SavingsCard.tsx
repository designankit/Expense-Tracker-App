"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, TrendingUp } from "lucide-react"
import { Savings } from "@/types/savings"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/components/supabase-provider"

interface SavingsCardProps {
  savings: Savings
  onEdit: (savings: Savings) => void
  onDelete: (id: string) => void
}

export function SavingsCard({ savings, onEdit, onDelete }: SavingsCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const progress = (savings.saved_amount / savings.target_amount) * 100
  const remaining = savings.target_amount - savings.saved_amount
  const isCompleted = savings.saved_amount >= savings.target_amount

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

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {savings.goal_name}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created {new Date(savings.created_at).toLocaleDateString()}
              </p>
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
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {progress.toFixed(1)}%
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(progress, 100)} 
            className="h-2"
          />
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              ₹{savings.saved_amount.toLocaleString()}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ₹{savings.target_amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Section */}
        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          {isCompleted ? (
            <div className="text-center">
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                🎉 Goal Achieved!
              </Badge>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ₹{remaining.toLocaleString()} remaining
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
