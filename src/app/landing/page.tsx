"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react"

export default function LandingPage() {
  const { user, loading } = useSupabase()
  const router = useRouter()

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  useEffect(() => {
    // Only redirect if we have real credentials and a user
    if (hasRealCredentials && !loading && user) {
      router.push("/")
    }
  }, [user, loading, router, hasRealCredentials])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we have real credentials and a user, don't render (will redirect)
  if (hasRealCredentials && user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Expensio Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Take control of your finances with our intuitive expense tracking app. 
            Monitor your spending, analyze trends, and achieve your financial goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Get insights into your spending patterns with beautiful charts and detailed reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your financial data is encrypted and secure. We never share your personal information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Add expenses in seconds with our streamlined interface designed for speed and efficiency.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Ready to take control of your finances?
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/signup">
              Start Tracking Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          {!hasRealCredentials && (
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Demo Mode:</strong> To enable full authentication, please configure your Supabase project. 
                See <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">SUPABASE_SETUP.md</code> for instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
