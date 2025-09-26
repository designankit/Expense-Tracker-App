"use client"

import { Bell, Home, Receipt, BarChart3, Settings, Moon, Sun, LogOut, User, Menu, Repeat } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useNotifications } from "@/contexts/NotificationContext"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { NotificationDropdown } from "./notification-dropdown"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const { user } = useSupabase()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timeFormat, setTimeFormat] = useState<string>('12h')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize time format from preferences
  useEffect(() => {
    // Default to 12h format since timeFormat is not in UserPreferences
    setTimeFormat('12h')
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch user profile picture from profiles table
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user?.id) return

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (error) {
          console.warn('Could not fetch profile picture:', error)
          return
        }

        if (profile && 'avatar_url' in profile) {
          setProfilePicture((profile as Record<string, unknown>).avatar_url as string)
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error)
      }
    }

    fetchProfilePicture()
  }, [user?.id])

  // Listen for avatar updates from settings page
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarUrl } = event.detail
      setProfilePicture(avatarUrl)
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener)
    }
  }, [])

  // Listen for time format changes from settings page
  useEffect(() => {
    const handleTimeFormatUpdate = (event: CustomEvent) => {
      const { timeFormat: newTimeFormat } = event.detail
      if (newTimeFormat) {
        setTimeFormat(newTimeFormat)
      }
      // Force a re-render by updating the current time
      setCurrentTime(new Date())
    }

    window.addEventListener('timeFormatUpdated', handleTimeFormatUpdate as EventListener)
    
    return () => {
      window.removeEventListener('timeFormatUpdated', handleTimeFormatUpdate as EventListener)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        })
        router.push("/login")
      }
    } catch {
      toast({
        title: "Logout Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }





  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getUserInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return "U"
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return "User"
  }

  const getUserEmail = () => {
    return user?.email || "demo@example.com"
  }

  const formatTime = (date: Date) => {
    if (timeFormat === '24h') {
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } else {
      return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <header className="flex h-14 sm:h-16 lg:h-18 items-center gap-2 sm:gap-3 lg:gap-4 border-b border-gray-200/70 dark:border-gray-800 bg-white/95 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-3 sm:px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      {/* Title - Responsive sizing */}
      <div className="flex-1 flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-900 dark:text-white truncate">
          Dashboard
        </h1>
      </div>
      
      {/* Right side controls */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        
        {/* Separator - Hidden on mobile */}
        <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block bg-gray-200 dark:bg-gray-800" />
        
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg sm:rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs p-0 rounded-full"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
          <NotificationDropdown 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>
        
        {/* Theme Toggle */}
          <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg sm:rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )
          ) : (
            <div className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </Button>
        
        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9">
                <AvatarImage src={profilePicture || undefined} />
                <AvatarFallback className="text-xs sm:text-sm font-medium bg-gradient-to-br from-primary to-purple-600 text-white">
                  {getUserInitials(user?.user_metadata?.full_name || user?.user_metadata?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {/* User Info Section */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm sm:text-base font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs sm:text-sm leading-none text-muted-foreground">
                  {getUserEmail()}
                </p>
                {/* Mobile Time Display */}
                <div className="lg:hidden mt-2 pt-2 border-t border-border/50">
                  <div className="text-xs font-mono text-muted-foreground">
                    {mounted ? formatTime(currentTime) : '--:--:--'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mounted ? formatDate(currentTime) : '--- --- --'}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Navigation Section */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions" className="flex items-center cursor-pointer">
                  <Receipt className="mr-2 h-4 w-4" />
                  <span>Transactions</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/recurring" className="flex items-center cursor-pointer">
                  <Repeat className="mr-2 h-4 w-4" />
                  <span>Scheduled</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analytics" className="flex items-center cursor-pointer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            {/* Actions Section */}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center text-rose-600 focus:text-rose-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      
        {/* Live Time Display - Desktop only */}
        <div className="hidden lg:flex flex-col items-end ml-2">
          <div className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-300">
            {mounted ? formatTime(currentTime) : '--:--:--'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {mounted ? formatDate(currentTime) : '--- --- --'}
          </div>
        </div>
      </div>
    </header>
  )
}