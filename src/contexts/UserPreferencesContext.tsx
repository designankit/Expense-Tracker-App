"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { UserPreferences, getUserPreferences, DEFAULT_PREFERENCES } from '@/lib/user-preferences'

interface UserPreferencesContextType {
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
  refreshPreferences: () => Promise<void>
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, supabase } = useSupabase()

  const fetchPreferences = useCallback(async () => {
    console.log('fetchPreferences called, user:', user?.id)
    if (!user) {
      console.log('No user, setting default preferences')
      setPreferences(DEFAULT_PREFERENCES)
      setIsLoading(false)
      return
    }

    try {
      console.log('Fetching preferences for user:', user.id)
      setIsLoading(true)
      setError(null)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
      
      const userPrefs = await Promise.race([
        getUserPreferences(user.id),
        timeoutPromise
      ]) as UserPreferences
      
      console.log('Fetched preferences:', userPrefs)
      setPreferences(userPrefs)
    } catch (err) {
      console.error('Error fetching user preferences:', err)
      setError('Failed to load user preferences')
      setPreferences(DEFAULT_PREFERENCES)
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
    }
  }, [user])

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user || !supabase) return

    try {
      setError(null)
      
      // Update in database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('profiles')
        .update(newPreferences)
        .eq('id', user.id)

      if (dbError) throw dbError

      // Update local state
      setPreferences(prev => ({ ...prev, ...newPreferences }))
    } catch (err) {
      console.error('Error updating user preferences:', err)
      setError('Failed to update preferences')
      throw err
    }
  }

  const refreshPreferences = async () => {
    await fetchPreferences()
  }

  useEffect(() => {
    fetchPreferences()
  }, [user?.id, fetchPreferences])

  const value: UserPreferencesContextType = {
    preferences,
    isLoading,
    error,
    refreshPreferences,
    updatePreferences
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
