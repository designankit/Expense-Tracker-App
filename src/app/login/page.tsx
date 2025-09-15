"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!hasRealCredentials) {
      toast({
        title: "Demo Mode",
        description: "Please configure Supabase credentials to enable authentication. See SUPABASE_SETUP.md for instructions.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        })
        // Wait a moment for the session to be established, then redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


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
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-3xl p-8 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expensio Tracker</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Sign in to your account to continue tracking expenses
              </p>
            </div>

            <Card className="bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your email and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>


            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>

            {!hasRealCredentials && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Demo Mode:</strong> Authentication is disabled. Configure Supabase to enable login.
                </p>
              </div>
            )}
          </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
