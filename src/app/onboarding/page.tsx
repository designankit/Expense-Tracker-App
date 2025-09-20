"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent } from "@/components/ui/card"
import { checkUserOnboardingStatus, createUserProfile } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { getLocalizedText } from "@/lib/user-preferences"
import { 
  ChevronLeft, 
  User, 
  Globe, 
  DollarSign, 
  CheckCircle,
  Loader2
} from "lucide-react"

// Import step components
import WelcomeStep from "@/components/onboarding/WelcomeStep"
import BasicInfoStep from "@/components/onboarding/BasicInfoStep"
import PersonalizationStep from "@/components/onboarding/PersonalizationStep"
import FinancePreferencesStep from "@/components/onboarding/FinancePreferencesStep"
import ConfirmationStep from "@/components/onboarding/ConfirmationStep"

// Step configuration - will be localized in component
const getSteps = (language: string) => [
  {
    id: 'welcome',
    title: getLocalizedText('onboarding.welcome', language),
    description: 'Get started with your expense tracker',
    icon: User,
    component: WelcomeStep
  },
  {
    id: 'basic-info',
    title: getLocalizedText('onboarding.basicInfo', language),
    description: 'Tell us about yourself',
    icon: User,
    component: BasicInfoStep
  },
  {
    id: 'personalization',
    title: getLocalizedText('onboarding.personalization', language),
    description: 'Set your preferences',
    icon: Globe,
    component: PersonalizationStep
  },
  {
    id: 'finance-preferences',
    title: getLocalizedText('onboarding.financePreferences', language),
    description: 'Configure your financial settings',
    icon: DollarSign,
    component: FinancePreferencesStep
  },
  {
    id: 'confirmation',
    title: getLocalizedText('onboarding.confirmation', language),
    description: 'Ready to start tracking',
    icon: CheckCircle,
    component: ConfirmationStep
  }
]

interface OnboardingData {
  full_name?: string
  avatar_url?: string
  currency?: string
  language?: string
  timezone?: string
  budget_style?: string
  default_savings_percentage?: number
  selected_categories?: string[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  // const [userProfile, setUserProfile] = useState<unknown>(null)

  const { user, supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const { preferences } = useUserPreferences()
  
  const STEPS = getSteps(preferences.language)

  // const createInitialProfile = useCallback(async () => {
  //   if (!user || !supabase) return

  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const { error } = await (supabase as any)
  //       .from('profiles')
  //       .insert([{
  //         id: user.id,
  //         full_name: user.user_metadata?.full_name || '',
  //         onboarding_completed: false,
  //         onboarding_step: 0
  //       }])

  //     if (error) throw error
  //   } catch (error) {
  //     console.error('Error creating initial profile:', error)
  //   }
  // }, [user, supabase])

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return

    try {
      const onboardingStatus = await checkUserOnboardingStatus(user.id)
      
      console.log('Onboarding: Status check result:', onboardingStatus)

      if (onboardingStatus.onboardingCompleted) {
        // User has already completed onboarding, redirect to dashboard
        console.log('Onboarding: User already completed onboarding, redirecting to dashboard')
        router.replace('/dashboard')
        return
      }

      if (!onboardingStatus.hasProfile) {
        // No profile exists, create one
        console.log('Onboarding: No profile found, creating new profile')
        const profileCreated = await createUserProfile(user.id, user.user_metadata)
        
        if (!profileCreated) {
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      } else {
        // Profile exists, load existing data
        console.log('Onboarding: Loading existing profile data')
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile && !error) {
          const profileData = profile as Record<string, unknown>
          
          // Load existing onboarding data
          setOnboardingData({
            full_name: profileData.full_name as string,
            avatar_url: profileData.avatar_url as string,
            currency: (profileData.currency as string) || 'INR',
            language: (profileData.language as string) || 'en',
            timezone: (profileData.timezone as string) || 'Asia/Kolkata',
            budget_style: (profileData.budget_style as string) || 'balanced',
            default_savings_percentage: (profileData.default_savings_percentage as number) || 20,
            selected_categories: (profileData.selected_categories as string[]) || ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare']
          })

          // Resume from the last step
          setCurrentStep((profileData.onboarding_step as number) || 0)
        }
      }
    } catch (error) {
      console.error('Onboarding: Error checking onboarding status:', error)
      toast({
        title: "Error",
        description: "Failed to load onboarding data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, router, toast, supabase])

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
    
    // Check if onboarding is already completed
    checkOnboardingStatus()
  }, [user, router, checkOnboardingStatus])

  const saveProgress = async (stepData?: Partial<OnboardingData>, nextStep?: number) => {
    if (!user || !supabase) return

    setIsSaving(true)
    try {
      const updateData = {
        ...onboardingData,
        ...stepData,
        onboarding_step: nextStep !== undefined ? nextStep : currentStep
      }

      console.log('Saving progress with data:', updateData)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Progress saved successfully:', data)

      // Update local state
      setOnboardingData(updateData)
      
      if (nextStep !== undefined) {
        setCurrentStep(nextStep)
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      toast({
        title: "Error",
        description: `Failed to save progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async (stepData?: unknown) => {
    if (currentStep < STEPS.length - 1) {
      await saveProgress(stepData as Partial<OnboardingData>, currentStep + 1)
    }
  }

  const handlePrevious = async () => {
    if (currentStep > 0) {
      await saveProgress(undefined, currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user || !supabase) return

    setIsSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: STEPS.length - 1
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account is now set up and ready to use.",
      })

      // Redirect to dashboard
      router.replace('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    await handleComplete()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  const currentStepConfig = STEPS[currentStep]
  const StepComponent = currentStepConfig.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStepConfig.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentStepConfig.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                </div>
              </div>
            </div>
            
            <Progress 
              value={(currentStep / (STEPS.length - 1)) * 100} 
              className="h-2"
            />
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                    index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : index === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-center max-w-16">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm">
            <CardContent className="p-8">
              <StepComponent
                data={onboardingData}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onComplete={handleComplete}
                onSkip={handleSkip}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        {currentStep > 0 && (
          <div className="max-w-2xl mx-auto mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Progress saved automatically
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
