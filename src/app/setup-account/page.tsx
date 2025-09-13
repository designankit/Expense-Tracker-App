"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, SkipForward, User, Globe, Settings, Shield, CheckCircle, Plus, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserData {
  name: string
  image: string
  currency: string
  timezone: string
  categories: string[]
  emailNotif: boolean
  twoFA: boolean
  trackIncome: boolean
}

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

const DEFAULT_CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Healthcare", "Education", "Transport"]

export default function SetupAccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, _setImageFile] = useState<File | null>(null)
  
  const [userData, setUserData] = useState<UserData>({
    name: "",
    image: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    categories: ["Food", "Travel", "Shopping", "Bills"],
    emailNotif: false,
    twoFA: false,
    trackIncome: false
  })

  // Load saved progress from localStorage and session
  useEffect(() => {
    const savedProgress = localStorage.getItem("setup-progress")
    if (savedProgress) {
      const { step, data } = JSON.parse(savedProgress)
      setCurrentStep(step)
      setUserData(data)
    }
    
    // Check for temporary name from signup
    const tempSignupName = localStorage.getItem("temp-signup-name")
    if (tempSignupName) {
      console.log("Setup: Found temporary signup name:", tempSignupName)
      setUserData(prev => ({
        ...prev,
        name: tempSignupName
      }))
      // Clear the temporary name after using it
      localStorage.removeItem("temp-signup-name")
    }
    
    // Also load user data from session if available
    if (session?.user) {
      setUserData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        image: session.user?.image || prev.image
      }))
    }
  }, [session])

  // Save progress to localStorage
  const saveProgress = (step: number, data: UserData) => {
    localStorage.setItem("setup-progress", JSON.stringify({ step, data }))
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
    }
  }, [session, status, router])

  // Check if user has already completed setup
  useEffect(() => {
    const checkSetupStatus = async () => {
      if (!session) {
        console.log("No session found, redirecting to login")
        return
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("Checking setup status for user:", (session as any).user?.id)
      
      try {
        const response = await fetch("/api/user/setup-status")
        console.log("Setup status response:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Setup status data:", data)
          console.log("Setup completed:", data.setupProgress.completed)
          console.log("User name:", data.user?.name)
          console.log("User data:", data.user)
          
          if (data.setupProgress.completed) {
            console.log("Setup already completed, redirecting to dashboard")
            router.push("/")
          } else {
            console.log("Setup not completed, staying on setup wizard")
          }
        } else {
          console.error("Setup status check failed:", response.status, response.statusText)
        }
      } catch (error) {
        console.error("Error checking setup status:", error)
      }
    }

    checkSetupStatus()
  }, [session, router])

  const updateUserData = async (updates: Partial<UserData>) => {
    const newData = { ...userData, ...updates }
    setUserData(newData)
    saveProgress(currentStep, newData)
    
    try {
      console.log("Updating user data:", updates)
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error("API Error Response:", errorData)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError)
        }
        throw new Error(`Failed to update user: ${errorMessage}`)
      }
      
      const result = await response.json()
      console.log("Update successful:", result)
    } catch (error) {
      console.error("Error updating user:", error)
      // Only show toast for non-network errors or important errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        toast({
          title: "Error",
          description: `Failed to save progress: ${error.message}`,
          variant: "destructive"
        })
      }
    }
  }

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      saveProgress(currentStep + 1, userData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      saveProgress(currentStep - 1, userData)
    }
  }

  const handleSkipSetup = async () => {
    console.log("Skip setup clicked")
    setIsLoading(true)
    try {
      // Save current progress even when skipping
      await updateUserData(userData)
      localStorage.removeItem("setup-progress")
      
      toast({
        title: "Setup Skipped",
        description: "You can complete setup later from settings.",
      })
      
      console.log("Redirecting to dashboard")
      router.push("/")
    } catch (error) {
      console.error("Skip setup error:", error)
      toast({
        title: "Error",
        description: "Failed to skip setup. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      await updateUserData(userData)
      localStorage.removeItem("setup-progress")
      
      toast({
        title: "Setup Complete!",
        description: "Your account has been configured successfully.",
      })
      
      // Force a page reload to refresh session data
      window.location.href = "/"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = () => {
    if (newCategory.trim() && !userData.categories.includes(newCategory.trim())) {
      const updatedCategories = [...userData.categories, newCategory.trim()]
      updateUserData({ categories: updatedCategories })
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    const updatedCategories = userData.categories.filter(c => c !== category)
    updateUserData({ categories: updatedCategories })
  }

  const toggleCategory = (category: string) => {
    if (userData.categories.includes(category)) {
      removeCategory(category)
    } else {
      const updatedCategories = [...userData.categories, category]
      updateUserData({ categories: updatedCategories })
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const steps = [
    { number: 1, title: "Profile", icon: User },
    { number: 2, title: "Currency & Timezone", icon: Globe },
    { number: 3, title: "Preferences", icon: Settings },
    { number: 4, title: "Security", icon: Shield },
    { number: 5, title: "Review", icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to Expense Tracker!</h1>
          <p className="text-gray-600 dark:text-gray-400">Let&apos;s set up your account to get started</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                      isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-3 font-medium transition-colors text-center
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 
                      isCompleted ? 'text-green-600 dark:text-green-400' : 
                      'text-gray-500 dark:text-gray-400'}
                  `}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mt-6 ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
              Step {currentStep}: {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Set up your profile information"}
              {currentStep === 2 && "Configure your currency and timezone preferences"}
              {currentStep === 3 && "Customize your expense categories and preferences"}
              {currentStep === 4 && "Configure security and notification settings"}
              {currentStep === 5 && "Review your settings and complete setup"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Profile Setup */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userData.image} />
                    <AvatarFallback className="text-2xl">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Profile Photo</p>
                    <div className="flex flex-col items-center space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            _setImageFile(file)
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              updateUserData({ image: e.target?.result as string })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {userData.image ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {userData.image && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            _setImageFile(null)
                            updateUserData({ image: "" })
                          }}
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">You can skip this for now</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={userData.name}
                    onChange={(e) => updateUserData({ name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Currency & Timezone */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={userData.currency} onValueChange={(value) => updateUserData({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={userData.timezone} onValueChange={(value) => updateUserData({ timezone: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Expense Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Expense Categories</Label>
                  <p className="text-sm text-gray-600">Select the categories you want to track:</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={category}
                          checked={userData.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={category} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add custom category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <Button onClick={addCategory} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userData.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => removeCategory(category)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Track Income</Label>
                    <p className="text-sm text-gray-600">Enable income tracking alongside expenses</p>
                  </div>
                  <Switch
                    checked={userData.trackIncome}
                    onCheckedChange={(checked) => updateUserData({ trackIncome: checked })}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Security & Notifications */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive email updates about your expenses</p>
                  </div>
                  <Switch
                    checked={userData.emailNotif}
                    onCheckedChange={(checked) => updateUserData({ emailNotif: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={userData.twoFA}
                    onCheckedChange={(checked) => updateUserData({ twoFA: checked })}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Finish */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Name:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {userData.name || "Not set"}
                      </span>
                    </div>
                    
                    {userData.image && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Profile Photo:</span>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={userData.image} />
                          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {userData.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Currency:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {CURRENCIES.find(c => c.value === userData.currency)?.label || userData.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Timezone:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {TIMEZONES.find(t => t.value === userData.timezone)?.label || userData.timezone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expense Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expense Categories</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {userData.categories.length > 0 ? (
                        userData.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="px-3 py-1">
                            {category}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 italic">No categories selected</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Track Income:</span>
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${
                        userData.trackIncome 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {userData.trackIncome ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security & Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security & Notifications</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Email Notifications:</span>
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${
                        userData.emailNotif 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {userData.emailNotif ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Two-Factor Authentication:</span>
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${
                        userData.twoFA 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {userData.twoFA ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {/* Left side - Back button */}
          <div className="flex-1">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          {/* Right side - Skip and Next/Finish buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSkipSetup} 
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip for Now
            </Button>
            
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isLoading}>
                {isLoading ? "Finishing..." : "Finish Setup"}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
