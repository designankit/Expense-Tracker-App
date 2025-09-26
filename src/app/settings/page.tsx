"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSupabase } from "@/components/supabase-provider"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  User,
  Shield,
  Save,
  Globe,
  Settings as SettingsIcon,
  CheckCircle,
  Loader2,
  Camera,
} from "lucide-react"
// CategoryManager removed along with custom categories feature

interface SettingsData {
  // Profile & Personalization
  fullName: string
  email: string
  timeFormat: '12h' | '24h'
}


export default function SettingsPage() {
  const { user, supabase } = useSupabase()
  const { isLoading: preferencesLoading, refreshPreferences } = useUserPreferences()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<SettingsData>({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    timeFormat: '12h'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState<{ avatar_url?: string; full_name?: string } | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null)

  // Fetch profile data including avatar
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !supabase) return

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfileData(profile)
        
        // Update settings with profile data
        if (profile && 'full_name' in profile) {
          setSettings(prev => ({ ...prev, fullName: (profile as Record<string, unknown>).full_name as string }))
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [user, supabase])

  // Update settings when preferences change (if needed)
  // Note: Currency and language preferences have been removed

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !supabase || !user) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Store the new avatar URL temporarily (don't update database yet)
      setNewAvatarUrl(publicUrl)
      
      toast({
        title: "Image uploaded",
        description: "Click 'Save Settings' to apply the new profile picture.",
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Prepare update data (currency and language removed)
      const updateData: Record<string, unknown> = {}

      // Include avatar URL if a new one was uploaded
      if (newAvatarUrl) {
        updateData.avatar_url = newAvatarUrl
      }

      // Update user preferences in Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user?.id)

      if (error) throw error

      // Update local profile data if avatar was changed
      if (newAvatarUrl) {
        setProfileData(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : { avatar_url: newAvatarUrl })
        
        // Dispatch custom event to notify other components of avatar update
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatarUrl: newAvatarUrl } }))
        
        // Clear the temporary avatar URL
        setNewAvatarUrl(null)
      }

      // Refresh preferences context
      await refreshPreferences()

      // Dispatch custom event to notify other components of time format update
      window.dispatchEvent(new CustomEvent('timeFormatUpdated', { detail: { timeFormat: settings.timeFormat } }))

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  const handleLogoutEverywhere = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Logged Out",
        description: "You have been logged out from all devices.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  // Show loading state while preferences are loading
  if (preferencesLoading) {
    return (
      <AuthGuard requireOnboarding={true}>
        <AppLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <LoadingSpinner message="Loading settings..." size="lg" className="min-h-screen" />
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireOnboarding={true}>
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                  <SettingsIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Settings
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Customize your experience and manage your account
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Account Status</p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {user?.email_confirmed_at ? 'Verified & Active' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <SettingsIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Time Format</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {settings.timeFormat === '12h' ? '12 Hour (AM/PM)' : '24 Hour'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-6xl space-y-6">
              <Accordion type="multiple" defaultValue={["profile"]} className="space-y-4">
                {/* Profile & Personalization */}
                <AccordionItem value="profile" className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-6 sm:px-8 py-5 sm:py-6 hover:no-underline group">
                    <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Profile & Personalization</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Manage your personal information and preferences</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                    <div className="space-y-8">
                      {/* User Information - Read Only */}
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          User Information
                        </h3>
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <Avatar className={`h-20 w-20 border-4 shadow-lg transition-all duration-300 ${newAvatarUrl ? 'border-orange-400 dark:border-orange-500 ring-4 ring-orange-200 dark:ring-orange-800' : 'border-white dark:border-gray-500'}`}>
                              <AvatarImage src={newAvatarUrl || profileData?.avatar_url} />
                              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {settings.fullName.charAt(0) || user?.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {newAvatarUrl && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-xs text-white font-bold">!</span>
                              </div>
                            )}
                            <label
                              htmlFor="avatar-upload-settings"
                              className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200 shadow-lg"
                            >
                              {isUploadingAvatar ? (
                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4 text-white" />
                              )}
                            </label>
                            <input
                              id="avatar-upload-settings"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                              disabled={isUploadingAvatar}
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</Label>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                {settings.fullName || 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</Label>
                              <p className="text-base text-gray-700 dark:text-gray-300 mt-1 font-medium">{settings.email}</p>
                            </div>
                            <Badge variant="secondary" className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                              <CheckCircle className="h-4 w-4" />
                              Verified Account
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Preferences - Editable */}
                      <div>
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <SettingsIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          Preferences
                        </h3>
                        <div className="max-w-md">
                          <div className="space-y-3">
                            <Label htmlFor="timeFormat" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time Format</Label>
                            <Select value={settings.timeFormat} onValueChange={(value: '12h' | '24h') => setSettings(prev => ({ ...prev, timeFormat: value }))}>
                              <SelectTrigger className="h-12 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                                <SelectItem value="24h">24 Hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Account Settings */}
                <AccordionItem value="account" className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-6 sm:px-8 py-5 sm:py-6 hover:no-underline group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Security and account management</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {/* Account Information - Read Only */}
                      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                        <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Account Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Account Status</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member Since</Label>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Sign In</Label>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Verified</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Session Management */}
                      <div className="space-y-4">
                        <h3 className="text-base font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Session Management
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Logout Everywhere</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              Sign out from all devices and sessions
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={handleLogoutEverywhere} 
                            disabled={isLoading}
                            size="sm"
                            className="text-xs"
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Logout Everywhere'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                

                {/* App Version */}
                <AccordionItem value="version" className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                  <AccordionTrigger className="px-6 sm:px-8 py-5 sm:py-6 hover:no-underline group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
                        <SettingsIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">App Information</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Version details and features</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {/* App Version Information */}
                      <div>
                        <h3 className="text-base font-medium mb-4 flex items-center gap-2">
                          <SettingsIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          Version Information
                        </h3>
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">App Version</Label>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">v0.1.0</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Build Date</Label>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                                {new Date().toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Environment</Label>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Framework</Label>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Next.js 15.5.2</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* App Features */}
                      <div className="space-y-4">
                        <h3 className="text-base font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          Features
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            'Expense & Income Tracking',
                            'Scheduled Transactions',
                            'Smart Notifications',
                            'Budget Management',
                            'Savings Goals & Insights',
                            'Analytics & Reports',
                            'Category Management',
                            'Dark/Light Theme',
                            'Real-time Dashboard',
                            'Data Export',
                            'Secure Authentication',
                            'Responsive Design'
                          ].map((feature) => (
                            <div key={feature} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>

              {/* Save Button */}
              <div className="flex justify-center pt-8">
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isLoading}
                  className={`px-8 py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    newAvatarUrl 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-3" />
                      {newAvatarUrl ? 'Save Settings & Apply Avatar' : 'Save Settings'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

      </AppLayout>
    </AuthGuard>
  )
}