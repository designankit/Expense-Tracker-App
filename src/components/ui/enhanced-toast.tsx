"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface EnhancedToastProps {
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  icon?: React.ReactNode
}

export function EnhancedToast({
  title,
  description,
  type = 'info',
  action,
  duration = 5000
}: EnhancedToastProps) {
  const { toast } = useToast()

  const showToast = () => {
    const config = {
      success: {
        className: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
      },
      error: {
        className: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
      },
      warning: {
        className: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
      },
      info: {
        className: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
      }
    }

    toast({
      title: title,
      description,
      duration,
      className: config[type].className,
      action: action ? (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="ml-2"
        >
          {action.label}
        </Button>
      ) : undefined
    })
  }

  return showToast
}

// Specialized toast functions for common actions
export const useEnhancedToast = () => {
  const { toast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    toast({
      title: title,
      description,
      duration: 4000,
      className: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
    })
  }

  const showError = (title: string, description?: string) => {
    toast({
      title: title,
      description,
      duration: 6000,
      className: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
    })
  }

  const showTransactionAdded = (amount: string, type: 'income' | 'expense') => {
    toast({
      title: "Transaction Added",
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${amount} has been added successfully.`,
      duration: 4000,
      className: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
    })
  }

  const showGoalCompleted = (goalName: string) => {
    toast({
      title: "🎉 Goal Achieved!",
      description: `Congratulations! You've completed your "${goalName}" goal!`,
      duration: 5000,
      className: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
    })
  }

  const showSavingsGoalCreated = (goalName: string, targetAmount: string) => {
    toast({
      title: "Savings Goal Created",
      description: `Your "${goalName}" goal of ${targetAmount} has been created successfully.`,
      duration: 4000,
      className: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
    })
  }

  return {
    showSuccess,
    showError,
    showTransactionAdded,
    showGoalCompleted,
    showSavingsGoalCreated
  }
}
