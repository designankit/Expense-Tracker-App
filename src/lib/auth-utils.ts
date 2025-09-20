import { supabase } from './supabaseClient'

export interface UserOnboardingStatus {
  needsOnboarding: boolean
  hasProfile: boolean
  onboardingCompleted: boolean
}

/**
 * Check if a user needs to complete onboarding
 * This function determines whether a user should be redirected to onboarding
 * or allowed to access the dashboard
 */
export async function checkUserOnboardingStatus(userId: string): Promise<UserOnboardingStatus> {
  try {
    // Check if user has a profile in the database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, created_at')
      .eq('id', userId)
      .single()

    console.log('AuthUtils: Profile check result:', { profile, error })

    if (error && error.code !== 'PGRST116') {
      // If there's an error (not "no rows found"), log it but assume onboarding is needed
      console.error('AuthUtils: Error checking profile:', error)
      return {
        needsOnboarding: true,
        hasProfile: false,
        onboardingCompleted: false
      }
    }

    if (!profile) {
      // No profile exists - this is a new user who needs onboarding
      console.log('AuthUtils: No profile found - user needs onboarding')
      return {
        needsOnboarding: true,
        hasProfile: false,
        onboardingCompleted: false
      }
    }

    // Profile exists, check if onboarding is completed
    const onboardingCompleted = (profile as Record<string, unknown>).onboarding_completed === true
    
    console.log('AuthUtils: Profile exists, onboarding completed:', onboardingCompleted)
    
    return {
      needsOnboarding: !onboardingCompleted,
      hasProfile: true,
      onboardingCompleted
    }

  } catch (error) {
    console.error('AuthUtils: Unexpected error checking onboarding status:', error)
    // On any error, assume onboarding is needed to be safe
    return {
      needsOnboarding: true,
      hasProfile: false,
      onboardingCompleted: false
    }
  }
}

/**
 * Create a basic profile for a new user
 */
export async function createUserProfile(userId: string, userMetadata?: Record<string, unknown>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .insert([{
        id: userId,
        full_name: userMetadata?.full_name || '',
        onboarding_completed: false,
        onboarding_step: 0,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('AuthUtils: Error creating profile:', error)
      return false
    }

    console.log('AuthUtils: Profile created successfully')
    return true
  } catch (error) {
    console.error('AuthUtils: Unexpected error creating profile:', error)
    return false
  }
}
