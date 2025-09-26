"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, 
  Target, 
  PieChart,
  TrendingUp,
  CheckCircle,
  Minus,
  Plus
} from "lucide-react"

interface FinancePreferencesStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

const BUDGET_STYLES = [
  {
    id: 'conservative',
    title: 'Conservative',
    description: 'Focus on saving and minimal spending',
    icon: '🛡️',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800'
  },
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Balance between saving and spending',
    icon: '⚖️',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  {
    id: 'aggressive',
    title: 'Growth-Oriented',
    description: 'Invest more, spend strategically',
    icon: '🚀',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  }
]

const EXPENSE_CATEGORIES = [
  { id: 'Food', icon: '🍕', description: 'Restaurants, groceries, dining' },
  { id: 'Transport', icon: '🚗', description: 'Gas, public transport, rideshare' },
  { id: 'Shopping', icon: '🛍️', description: 'Clothing, electronics, general shopping' },
  { id: 'Entertainment', icon: '🎬', description: 'Movies, games, subscriptions' },
  { id: 'Utilities', icon: '⚡', description: 'Electricity, water, internet, phone' },
  { id: 'Healthcare', icon: '🏥', description: 'Medical, pharmacy, insurance' },
  { id: 'Education', icon: '📚', description: 'Courses, books, learning materials' },
  { id: 'Travel', icon: '✈️', description: 'Vacations, business trips, hotels' },
  { id: 'Home', icon: '🏠', description: 'Rent, mortgage, maintenance' },
  { id: 'Investment', icon: '📈', description: 'Stocks, bonds, retirement funds' },
  { id: 'Insurance', icon: '🛡️', description: 'Life, health, auto insurance' },
  { id: 'Other', icon: '📦', description: 'Miscellaneous expenses' }
]

export default function FinancePreferencesStep({ data, onNext, isLoading }: FinancePreferencesStepProps) {
  const dataObj = data as Record<string, unknown>
  const [formData, setFormData] = useState({
    budget_style: (dataObj?.budget_style as string) || 'balanced',
    default_savings_percentage: (dataObj?.default_savings_percentage as number) || 20,
    selected_categories: (dataObj?.selected_categories as string[]) || ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare']
  })

  const { toast } = useToast()

  const handleBudgetStyleChange = (style: string) => {
    setFormData(prev => ({ ...prev, budget_style: style }))
  }

  const handleSavingsPercentageChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, default_savings_percentage: value[0] }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(categoryId)
        ? prev.selected_categories.filter(id => id !== categoryId)
        : [...prev.selected_categories, categoryId]
    }))
  }

  const handleNext = () => {
    if (formData.selected_categories.length === 0) {
      toast({
        title: "Categories required",
        description: "Please select at least one expense category.",
        variant: "destructive",
      })
      return
    }

    onNext(formData)
  }

  // const selectedBudgetStyle = BUDGET_STYLES.find(style => style.id === formData.budget_style)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
          Finance Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your budgeting style and expense categories
        </p>
      </div>

      {/* Budget Style Selection */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Target className="h-5 w-5" />
            Budget Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BUDGET_STYLES.map((style) => (
              <Card
                key={style.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.budget_style === style.id
                    ? 'ring-2 ring-emerald-500 shadow-md'
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleBudgetStyleChange(style.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {style.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {style.description}
                  </p>
                  {formData.budget_style === style.id && (
                    <div className="mt-2">
                      <Badge className={`${style.color} border`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Default Savings Percentage */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <TrendingUp className="h-5 w-5" />
            Default Savings Percentage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              {formData.default_savings_percentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended savings from your income
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavingsPercentageChange([Math.max(5, formData.default_savings_percentage - 5)])}
                disabled={formData.default_savings_percentage <= 5}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={[formData.default_savings_percentage]}
                  onValueChange={handleSavingsPercentageChange}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSavingsPercentageChange([Math.min(50, formData.default_savings_percentage + 5)])}
                disabled={formData.default_savings_percentage >= 50}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="font-semibold">5-15%</div>
              <div className="text-gray-600 dark:text-gray-400">Minimal</div>
            </div>
            <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
              <div className="font-semibold text-green-800 dark:text-green-300">20-30%</div>
              <div className="text-green-600 dark:text-green-400">Recommended</div>
            </div>
            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="font-semibold">35-50%</div>
              <div className="text-gray-600 dark:text-gray-400">Aggressive</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <PieChart className="h-5 w-5" />
            Expense Categories
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select the categories you want to track (minimum 3 recommended)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {EXPENSE_CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.selected_categories.includes(category.id)
                    ? 'ring-2 ring-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.id}
                  </div>
                  {formData.selected_categories.includes(category.id) && (
                    <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {formData.selected_categories.length} categories selected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={handleNext}
          disabled={isLoading || formData.selected_categories.length === 0}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
