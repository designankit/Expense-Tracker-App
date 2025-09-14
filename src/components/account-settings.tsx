"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  Globe, 
  DollarSign, 
  Bell, 
  Tag, 
  Shield,
  Eye,
  EyeOff
} from "lucide-react"

const CURRENCIES = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" }
]

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" }
]

interface UserSettings {
  currency: string
  timezone: string
  categories: string[]
  emailNotif: boolean
  twoFA: boolean
}

export function AccountSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    currency: "INR",
    timezone: "Asia/Kolkata",
    categories: ["Food", "Travel", "Shopping", "Bills"],
    emailNotif: false,
    twoFA: false
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load user settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!session) return

      try {
        const response = await fetch("/api/user/setup-status")
        if (response.ok) {
          const data = await response.json()
          setSettings({
            currency: data.user.currency || "INR",
            timezone: data.user.timezone || "Asia/Kolkata",
            categories: data.user.categories || ["Food", "Travel", "Shopping", "Bills"],
            emailNotif: data.user.emailNotif || false,
            twoFA: data.user.twoFA || false
          })
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load account settings",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [session, toast])

  // Helper function to get display labels
  const getCurrencyLabel = (value: string) => {
    return CURRENCIES.find(c => c.value === value)?.label || value
  }

  const getTimezoneLabel = (value: string) => {
    return TIMEZONES.find(t => t.value === value)?.label || value
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Loading your account preferences...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          View your current account preferences and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency & Timezone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Currency
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="font-medium">{getCurrencyLabel(settings.currency)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" />
              Timezone
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="font-medium">{getTimezoneLabel(settings.timezone)}</span>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />
            Expense Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.categories.map((category) => (
              <Badge key={category} variant="secondary" className="px-3 py-1">
                {category}
              </Badge>
            ))}
          </div>
        </div> 

        {/* Notifications & Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Bell className="h-4 w-4" />
            Notifications & Security
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive email updates about your expenses
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.emailNotif ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {settings.emailNotif ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {settings.twoFA ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {settings.twoFA ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> To modify these settings, please use the setup wizard available in the settings page.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}