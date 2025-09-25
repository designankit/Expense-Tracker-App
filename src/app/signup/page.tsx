"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check if we have real Supabase credentials
  const hasRealCredentials = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xeatiyqxxoqgzvlbcscp') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'

  const handleEmailSignup = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      })

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link to complete your signup.",
        })
        // Redirect to login page - user needs to confirm email first
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      }
    } catch {
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Background visuals */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* radial highlight */}
        <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent blur-3xl dark:from-emerald-400/25 dark:via-teal-400/15 animate-blob-slow" />
        {/* decorative blobs */}
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/20 animate-blob" />
        <div className="absolute -left-40 bottom-10 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/20 animate-blob-fast" />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.10)_1px,transparent_1px)] [background-size:14px_14px] opacity-40 dark:opacity-20 animate-grid-pan" />
      </div>
      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md space-y-8 px-2 sm:px-0">
          {/* gradient border wrapper for eye-catchy look */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent dark:from-emerald-400/40 dark:via-teal-400/20 shadow-2xl">
            {/* professional background layers behind the card */}
            <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[2rem] ring-conic opacity-20 dark:opacity-60" />
            <div aria-hidden className="pointer-events-none absolute -inset-2 rounded-[2rem] vignette-soft opacity-10 dark:opacity-100" />
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] bg-noise opacity-15 dark:opacity-35" />
            <div aria-hidden className="pointer-events-none absolute -inset-10 rounded-[2.5rem] beam-diagonal opacity-30 dark:opacity-100" />
            {/* decorative accent */}
            <div aria-hidden className="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl sm:block hidden" />
            <div className="backdrop-blur-md bg-white/60 dark:bg-black/10 rounded-[calc(theme(borderRadius.3xl))] p-6 sm:p-8 border border-emerald-900/10 dark:border-white/10 shadow-modern transition-transform duration-500 ease-out group focus-within:scale-[1.01] hover:scale-[1.01]">
            <div className="text-center mb-4 sm:mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="/Applogo.png"
                  alt="Expensio Tracker Logo"
                  width={160}
                  height={45}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create your account to start tracking expenses
              </p>
            </div>
            {/* mobile-only feature badges for richer look */}
            <div className="sm:hidden flex items-center justify-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Secure</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">Fast</span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Free</span>
            </div>

            <Card className="relative overflow-hidden bg-white/70 dark:bg-black/20 border-emerald-900/10 dark:border-white/20 backdrop-blur-sm shadow-xl">
          {/* inner gradient glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/10 via-teal-400/5 to-transparent dark:from-emerald-400/5" />
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Sign up with your email and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
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
              <Button type="submit" className="w-full btn-modern" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>


            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>

            {!hasRealCredentials && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Demo Mode:</strong> Authentication is disabled. Configure Supabase to enable signup.
                </p>
              </div>
            )}
            </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
