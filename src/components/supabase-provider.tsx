"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

type SupabaseContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  supabase: typeof supabase
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: supabase,
})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  // Use the shared Supabase client to avoid multiple instances

  useEffect(() => {
    // If no real credentials, skip auth and set loading to false
    if (!hasRealCredentials) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('SupabaseProvider: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('SupabaseProvider: Session result:', { session, error })
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.warn('Supabase auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SupabaseProvider: Auth state change:', { event, session })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [hasRealCredentials])

  return (
    <SupabaseContext.Provider value={{ user, session, loading, supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}
