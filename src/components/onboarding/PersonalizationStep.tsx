"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle,
  ArrowRight
} from "lucide-react"

interface PersonalizationStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function PersonalizationStep({ onNext, isLoading }: PersonalizationStepProps) {
  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
          Almost Ready!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your account is being set up with the information you provided
        </p>
      </div>

      {/* Setup Summary */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
              Setup Complete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your expense tracking account has been configured with your preferences. 
              You can always update these settings later in your account preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Continue to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
