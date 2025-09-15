"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap } from "lucide-react"

export default function Home() {
  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Banking/Financial Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Financial Chart Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
            <path
              d="M0,50 Q25,25 50,35 T100,30"
              stroke="url(#gradient1)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M0,60 Q25,45 50,50 T100,45"
              stroke="url(#gradient2)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
              style={{animationDelay: '1s'}}
            />
            <path
              d="M0,40 Q25,20 50,25 T100,20"
              stroke="url(#gradient3)"
              strokeWidth="0.5"
              fill="none"
              className="animate-pulse"
              style={{animationDelay: '2s'}}
            />
            <path
              d="M0,70 Q25,55 50,60 T100,55"
              stroke="url(#gradient1)"
              strokeWidth="0.3"
              fill="none"
              className="animate-pulse"
              style={{animationDelay: '0.5s'}}
            />
            <path
              d="M0,30 Q25,15 50,20 T100,15"
              stroke="url(#gradient2)"
              strokeWidth="0.3"
              fill="none"
              className="animate-pulse"
              style={{animationDelay: '1.5s'}}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating Financial Icons */}
        <div className="absolute inset-0">
          {/* Dollar Signs */}
          {Array.from({length: 8}).map((_, i) => (
            <div
              key={`dollar-${i}`}
              className="absolute text-green-500/20 text-2xl font-bold animate-float"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i % 2)}s`
              }}
            >
              $
                </div>
          ))}
          
          {/* Percentage Signs */}
          {Array.from({length: 6}).map((_, i) => (
            <div
              key={`percent-${i}`}
              className="absolute text-blue-500/20 text-xl font-bold animate-float"
              style={{
                left: `${15 + (i * 15)}%`,
                top: `${30 + (i % 2) * 30}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + (i % 2)}s`
              }}
            >
              %
            </div>
          ))}

          {/* Plus Signs */}
          {Array.from({length: 5}).map((_, i) => (
            <div
              key={`plus-${i}`}
              className="absolute text-indigo-500/20 text-lg font-bold animate-float"
              style={{
                left: `${20 + (i * 18)}%`,
                top: `${25 + (i % 2) * 35}%`,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${2.5 + (i % 2)}s`
              }}
            >
              +
            </div>
          ))}
                              </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-24 gap-2 h-full">
            {Array.from({length: 480}).map((_, i) => (
              <div 
                key={i} 
                className="bg-blue-500 animate-pulse" 
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: '4s'
                }}
              ></div>
            ))}
                              </div>
                              </div>
                      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 animate-fade-in-up leading-tight">
            Expensio Tracker
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto animate-fade-in-up leading-relaxed" style={{animationDelay: '0.2s'}}>
            Take control of your finances with our intuitive expense tracking app.
            Monitor your spending, analyze trends, and achieve your financial goals.
          </p>
                  </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          <Card className="hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in-up p-4 sm:p-6" style={{animationDelay: '0.6s'}}>
            <CardHeader className="text-center sm:text-left">
              <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mb-3 sm:mb-4 animate-bounce mx-auto sm:mx-0" style={{animationDuration: '2s'}} />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">Smart Analytics</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Get insights into your spending patterns with beautiful charts and detailed reports.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in-up p-4 sm:p-6" style={{animationDelay: '0.8s'}}>
            <CardHeader className="text-center sm:text-left">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600 mb-3 sm:mb-4 animate-pulse mx-auto sm:mx-0" style={{animationDuration: '3s'}} />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">Secure & Private</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Your financial data is encrypted and secure. We never share your personal information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in-up p-4 sm:p-6 sm:col-span-2 lg:col-span-1" style={{animationDelay: '1s'}}>
            <CardHeader className="text-center sm:text-left">
              <Zap className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600 mb-3 sm:mb-4 animate-pulse mx-auto sm:mx-0" style={{animationDuration: '1.5s'}} />
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">Lightning Fast</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Add expenses in seconds with our streamlined interface designed for speed and efficiency.
              </CardDescription>
            </CardHeader>
          </Card>
              </div>

        <div className="text-center animate-fade-in-up" style={{animationDelay: '1.2s'}}>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            Ready to take control of your finances?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 animate-glow w-full sm:w-auto">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:scale-105 transition-transform duration-200 w-full sm:w-auto">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          {!hasRealCredentials && (
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-pulse max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Demo Mode:</strong> To enable full authentication, please configure your Supabase project.
                See <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">SUPABASE_SETUP.md</code> for instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
