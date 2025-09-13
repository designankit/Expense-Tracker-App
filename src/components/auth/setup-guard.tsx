"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, ArrowRight } from "lucide-react"

interface SetupProgress {
  completed: boolean
  stepsCompleted: number
  totalSteps: number
}

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (status === "loading") return
      if (!session) {
        setIsLoading(false)
        return
      }

      try {
        console.log("SetupGuard: Checking setup status for user:", session.user?.id)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort("Request timeout"), 10000) // 10 second timeout
        
        const response = await fetch("/api/user/setup-status", {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          console.log("SetupGuard: Setup status response:", data)
          console.log("SetupGuard: User data:", data.user)
          console.log("SetupGuard: Setup completed:", data.setupProgress.completed)
          setSetupProgress(data.setupProgress)
        } else {
          console.error("SetupGuard: API response not ok:", response.status)
          // If API fails, assume setup is not completed
          setSetupProgress({
            completed: false,
            stepsCompleted: 0,
            totalSteps: 5
          })
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn("SetupGuard: Request was aborted due to timeout")
        } else {
          console.error("SetupGuard: Error checking setup status:", error)
        }
        // If API fails, assume setup is not completed
        setSetupProgress({
          completed: false,
          stepsCompleted: 0,
          totalSteps: 5
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkSetupStatus()
  }, [session, status])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <>{children}</>
  }

  // If setup is not completed, show setup prompt
  if (setupProgress && !setupProgress.completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Complete Your Setup</CardTitle>
            <CardDescription>
              You&apos;re almost ready! Complete your account setup to get the most out of your expense tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Setup Progress</span>
                <span className="text-sm text-gray-600">
                  {setupProgress.stepsCompleted}/{setupProgress.totalSteps} steps
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(setupProgress.stepsCompleted / setupProgress.totalSteps) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push("/setup-account")}
                className="flex-1"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/")}
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
