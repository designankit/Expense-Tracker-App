"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
import { 
  Globe, 
  DollarSign, 
  Clock,
  CheckCircle
} from "lucide-react"

interface PersonalizationStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee (₹)', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar ($)', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro (€)', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound (£)', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen (¥)', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar (A$)', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar (S$)', flag: '🇸🇬' }
]

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' }
]

const TIMEZONES = [
  { code: 'Asia/Kolkata', name: 'India Standard Time (IST)', offset: '+05:30' },
  { code: 'America/New_York', name: 'Eastern Time (ET)', offset: '-05:00' },
  { code: 'America/Los_Angeles', name: 'Pacific Time (PT)', offset: '-08:00' },
  { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
  { code: 'Europe/Paris', name: 'Central European Time (CET)', offset: '+01:00' },
  { code: 'Asia/Tokyo', name: 'Japan Standard Time (JST)', offset: '+09:00' },
  { code: 'Asia/Shanghai', name: 'China Standard Time (CST)', offset: '+08:00' },
  { code: 'Australia/Sydney', name: 'Australian Eastern Time (AET)', offset: '+10:00' }
]

export default function PersonalizationStep({ data, onNext, isLoading }: PersonalizationStepProps) {
  const dataObj = data as Record<string, unknown>
  const [formData, setFormData] = useState({
    currency: (dataObj?.currency as string) || 'INR',
    language: (dataObj?.language as string) || 'en',
    timezone: (dataObj?.timezone as string) || 'Asia/Kolkata'
  })

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    onNext(formData)
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency)
  const selectedLanguage = LANGUAGES.find(l => l.code === formData.language)
  const selectedTimezone = TIMEZONES.find(t => t.code === formData.timezone)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Personalize Your Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your preferred currency, language, and timezone
        </p>
      </div>

      {/* Currency Selection */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <DollarSign className="h-5 w-5" />
            Currency Preference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select your preferred currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleSelectChange('currency', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currency.flag}</span>
                      <span>{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCurrency && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span>Selected: {selectedCurrency.flag} {selectedCurrency.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Globe className="h-5 w-5" />
            Language Preference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select your preferred language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleSelectChange('language', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLanguage && (
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle className="h-4 w-4" />
                <span>Selected: {selectedLanguage.flag} {selectedLanguage.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timezone Selection */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Clock className="h-5 w-5" />
            Timezone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select your timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleSelectChange('timezone', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((timezone) => (
                  <SelectItem key={timezone.code} value={timezone.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{timezone.name}</span>
                      <span className="text-sm text-gray-500 ml-2">{timezone.offset}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTimezone && (
              <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                <CheckCircle className="h-4 w-4" />
                <span>Selected: {selectedTimezone.name} ({selectedTimezone.offset})</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Your Preferences Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Currency:</span>
              <span className="ml-2 font-medium">{selectedCurrency?.flag} {selectedCurrency?.name}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Language:</span>
              <span className="ml-2 font-medium">{selectedLanguage?.flag} {selectedLanguage?.name}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
              <span className="ml-2 font-medium">{selectedTimezone?.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
