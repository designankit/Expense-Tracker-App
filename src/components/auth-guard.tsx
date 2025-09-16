"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  // Debug logging
  console.log('AuthGuard Debug:', { user, loading, hasRealCredentials })

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

  console.log('AuthGuard: User authenticated, rendering children')
  return <>{children}</>
}
