"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Receipt, 
  Plus, 
  Target, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet
} from "lucide-react"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            {icon || (
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm"
          >
            {description}
          </motion.p>
          
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button onClick={action.onClick} className="gap-2">
                <Plus className="h-4 w-4" />
                {action.label}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function NoTransactionsEmptyState({ onAddTransaction }: { onAddTransaction: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <Receipt className="h-8 w-8 text-blue-600" />
        </div>
      }
      title="No transactions yet"
      description="Start tracking your expenses and income by adding your first transaction."
      action={{
        label: "Add Transaction",
        onClick: onAddTransaction
      }}
    />
  )
}

export function NoSavingsGoalsEmptyState({ onCreateGoal }: { onCreateGoal: () => void }) {
  return (
    <EmptyState
      icon={
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <Target className="h-8 w-8 text-green-600" />
        </div>
      }
      title="No savings goals set"
      description="Create your first savings goal to start building better financial habits."
      action={{
        label: "Create Goal",
        onClick: onCreateGoal
      }}
    />
  )
}

export function NoDataEmptyState({ type }: { type: 'expenses' | 'income' | 'analytics' }) {
  const config = {
    expenses: {
      icon: (
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <TrendingDown className="h-8 w-8 text-red-600" />
        </div>
      ),
      title: "No expense data",
      description: "Add some expenses to see your spending patterns and analytics."
    },
    income: {
      icon: (
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      ),
      title: "No income data",
      description: "Add some income entries to track your earnings and financial growth."
    },
    analytics: {
      icon: (
        <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-purple-600" />
        </div>
      ),
      title: "No analytics data",
      description: "Add some transactions to see detailed analytics and insights."
    }
  }

  const { icon, title, description } = config[type]

  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
    />
  )
}

export function WelcomeEmptyState({ userName }: { userName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <Wallet className="h-12 w-12 text-white" />
        </div>
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
      >
        Welcome{userName ? `, ${userName}` : ''}! 👋
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8"
      >
        You&apos;re all set to start managing your finances. Add your first transaction or create a savings goal to get started.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button className="gap-2">
          <CreditCard className="h-4 w-4" />
          Add Transaction
        </Button>
        <Button variant="outline" className="gap-2">
          <PiggyBank className="h-4 w-4" />
          Create Goal
        </Button>
      </motion.div>
    </motion.div>
  )
}
