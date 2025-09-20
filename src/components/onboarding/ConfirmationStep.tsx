"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  User,
  Globe,
  DollarSign,
  Shield
} from "lucide-react"

interface ConfirmationStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function ConfirmationStep({ data, onComplete, isLoading }: ConfirmationStepProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataObj = data as any
  
  const summaryItems = [
    {
      icon: User,
      title: 'Profile Setup',
      description: 'Basic information configured',
      completed: !!dataObj?.full_name
    },
    {
      icon: Globe,
      title: 'Preferences',
      description: `${dataObj?.currency || 'INR'} • ${dataObj?.language || 'en'} • ${dataObj?.timezone || 'Asia/Kolkata'}`,
      completed: true
    },
    {
      icon: DollarSign,
      title: 'Finance Settings',
      description: `${dataObj?.budget_style || 'balanced'} budget • ${dataObj?.default_savings_percentage || 20}% savings • ${dataObj?.selected_categories?.length || 6} categories`,
      completed: true
    },
    {
      icon: Shield,
      title: 'Security',
      description: `${dataObj?.two_fa_enabled ? '2FA enabled' : 'Standard security'} • ${dataObj?.social_login_connected ? 'Social login connected' : 'Email login'}`,
      completed: true
    }
  ]

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Set! 🎉
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your expense tracker is ready to use
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryItems.map((item, index) => (
          <Card 
            key={index}
            className={`transition-all duration-300 ${
              item.completed 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.completed 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What's Next */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Sparkles className="h-5 w-5" />
            What&apos;s Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Add Your First Expense
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start tracking your spending right away
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Set Savings Goals
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your first financial goal
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Explore Analytics
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View your spending insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Summary */}
      {dataObj?.full_name && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome, {dataObj.full_name}! 👋
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your personalized expense tracking experience is ready. We&apos;ve configured everything 
              based on your preferences to help you achieve your financial goals.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <Button
          onClick={onComplete}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always update these settings later in your profile
        </p>
      </div>
    </div>
  )
}
