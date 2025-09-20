"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { checkUserOnboardingStatus } from '@/lib/auth-utils'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireOnboarding?: boolean
}

export function AuthGuard({ children, fallback, requireOnboarding = false }: AuthGuardProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  // Debug logging
  console.log('AuthGuard Debug:', { user, loading, hasRealCredentials, requireOnboarding })

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !requireOnboarding) {
        setOnboardingChecked(true)
        return
      }

      console.log('AuthGuard: Checking onboarding status for user:', user.id)

      try {
        const onboardingStatus = await checkUserOnboardingStatus(user.id)
        
        console.log('AuthGuard: Onboarding status:', onboardingStatus)

        if (onboardingStatus.needsOnboarding) {
          console.log('AuthGuard: User needs onboarding, redirecting to /onboarding')
          router.replace('/onboarding') // Use replace instead of push to avoid back button issues
          return
        }

        console.log('AuthGuard: Onboarding completed, allowing access to dashboard')
        setOnboardingChecked(true)
      } catch (error) {
        console.error('AuthGuard: Error checking onboarding status:', error)
        // On error, redirect to onboarding to be safe
        console.log('AuthGuard: Error occurred, redirecting to onboarding')
        router.replace('/onboarding')
      }
    }

    // Only check if we have a user and not already checked
    if (user && !onboardingChecked) {
      checkOnboardingStatus()
    }
  }, [user, requireOnboarding, router, onboardingChecked])

  useEffect(() => {
    // Only redirect if we have real credentials and no user
    if (hasRealCredentials && !loading && !user) {
      console.log('AuthGuard: Redirecting to landing page')
      router.push('/')
    }
  }, [user, loading, router, hasRealCredentials])

  if (loading) {
    console.log('AuthGuard: Loading...')
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no real credentials, allow access (demo mode)
  if (!hasRealCredentials) {
    console.log('AuthGuard: No real credentials, allowing access')
    return <>{children}</>
  }

  // If we have real credentials but no user, don't render anything (will redirect)
  if (!user) {
    console.log('AuthGuard: No user, not rendering')
    return null
  }

  // If onboarding is required but not checked yet, show loading
  if (requireOnboarding && !onboardingChecked) {
    console.log('AuthGuard: Checking onboarding status...')
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  console.log('AuthGuard: User authenticated, rendering children')
  return <>{children}</>
}
