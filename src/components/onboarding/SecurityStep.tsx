"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
// import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

interface SecurityStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function SecurityStep({ data, onNext, onSkip, isLoading }: SecurityStepProps) {
  const dataObj = data as Record<string, unknown>
  const [formData, setFormData] = useState({
    two_fa_enabled: (dataObj?.two_fa_enabled as boolean) || false,
    social_login_connected: (dataObj?.social_login_connected as boolean) || false
  })

  const { toast } = useToast()

  const handle2FAToggle = (enabled: boolean) => {
    setFormData(prev => ({ ...prev, two_fa_enabled: enabled }))
    
    if (enabled) {
      toast({
        title: "2FA Setup",
        description: "Two-factor authentication will be configured after onboarding.",
      })
    }
  }

  const handleSocialLoginToggle = (connected: boolean) => {
    setFormData(prev => ({ ...prev, social_login_connected: connected }))
    
    if (connected) {
      toast({
        title: "Social Login",
        description: "Social login options will be available after onboarding.",
      })
    }
  }

  const handleNext = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Your Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add extra layers of security to protect your financial data
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200/50 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="2fa-toggle" className="text-base font-medium">
                  Enable 2FA
                </Label>
                {formData.two_fa_enabled ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security with SMS or authenticator app
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={formData.two_fa_enabled}
              onCheckedChange={handle2FAToggle}
            />
          </div>

          {formData.two_fa_enabled && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    2FA Setup Required
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    After completing onboarding, you&apos;ll be guided through setting up two-factor authentication 
                    using your preferred method (SMS or authenticator app).
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Login */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Mail className="h-5 w-5" />
            Social Login Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="social-login-toggle" className="text-base font-medium">
                  Connect Social Accounts
                </Label>
                {formData.social_login_connected ? (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Link Google, Apple, or GitHub for easier sign-in
              </p>
            </div>
            <Switch
              id="social-login-toggle"
              checked={formData.social_login_connected}
              onCheckedChange={handleSocialLoginToggle}
            />
          </div>

          {formData.social_login_connected && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Social Login Setup
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    After onboarding, you can connect your preferred social accounts for faster and more convenient sign-ins.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Features Overview */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Key className="h-5 w-5" />
            Built-in Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Encrypted Storage</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">All data encrypted at rest</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Secure Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Industry-standard auth protocols</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Privacy First</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your data stays private</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Regular Backups</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Automatic data protection</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/50 dark:border-yellow-800/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Security Reminder
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Never share your login credentials. We&apos;ll never ask for your password via email or phone. 
                Always access your account through our official website or app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Skip security setup
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
