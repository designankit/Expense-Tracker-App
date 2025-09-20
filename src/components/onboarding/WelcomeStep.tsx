"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Shield, 
  CheckCircle,
  ArrowRight
} from "lucide-react"

interface WelcomeStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function WelcomeStep({ onNext, isLoading }: WelcomeStepProps) {
  const features = [
    {
      icon: PiggyBank,
      title: "Smart Savings Goals",
      description: "Set and track your financial goals with visual progress indicators"
    },
    {
      icon: TrendingUp,
      title: "Expense Analytics",
      description: "Get insights into your spending patterns with beautiful charts"
    },
    {
      icon: Target,
      title: "Budget Management",
      description: "Create budgets and monitor your spending against them"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and stored securely"
    }
  ]

  return (
    <div className="text-center space-y-8">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <PiggyBank className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Expensio Tracker! 🎉
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let&apos;s set up your personalized expense tracking experience
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Setup Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800 dark:text-green-200">
            Quick 5-Step Setup
          </span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">
          We&apos;ll help you personalize your experience in just a few minutes. 
          Your progress is saved automatically, so you can always come back later.
        </p>
      </div>

      {/* Call to Action */}
      <div className="space-y-4">
        <Button
          onClick={() => onNext()}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Takes about 2-3 minutes to complete
        </p>
      </div>
    </div>
  )
}
