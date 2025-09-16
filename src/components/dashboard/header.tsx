"use client"

import { Bell, Search, Home, Receipt, BarChart3, Settings, Moon, Sun, LogOut, User, RefreshCw, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearch } from "@/contexts/SearchContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabaseClient"
import { SearchDropdown } from "./search-dropdown"
import { NotificationDropdown } from "./notification-dropdown"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  const { searchQuery, setSearchQuery, isDropdownOpen, setIsDropdownOpen } = useSearch()
  const { unreadCount } = useNotifications()
  const { user } = useSupabase()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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

  const handleSwitchAccount = () => {
    // Demo mode - no actual account switching
    console.log("Demo mode - account switching not implemented")
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsDropdownOpen(value.length > 0)
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const handleSelectSuggestion = (suggestion: { id: string }) => {
    // You can customize this behavior - maybe show expense details or navigate to expenses page
    router.push(`/expenses?id=${suggestion.id}`)
    setSearchQuery('')
    setIsDropdownOpen(false)
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

  return (
    <header className="flex h-16 sm:h-18 items-center gap-3 sm:gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 sticky top-0 z-40">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="sm:hidden h-9 w-9 rounded-xl hover:bg-muted/50"
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search - Hidden on mobile, shown on larger screens */}
        <div className="relative w-48 sm:w-72 hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary z-10" />
            <Input
              placeholder="Search expenses..."
              className="pl-11 pr-4 py-2.5 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground relative z-0"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setIsDropdownOpen(false)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 z-10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <SearchDropdown
            query={searchQuery}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
        
        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-xl hover:bg-muted/50"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 hidden sm:block bg-border/50" />
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/50"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 rounded-full"
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
        
        {/* Theme Toggle Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/50"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>
        
        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-muted/50">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary to-purple-600 text-white">
                  {getUserInitials(user?.user_metadata?.full_name || user?.user_metadata?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {/* User Info Section */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getUserEmail()}
                </p>
              </div>
            </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Navigation Section */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/expenses" className="flex items-center">
                    <Receipt className="mr-2 h-4 w-4" />
                    <span>Expenses</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analytics" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              
              {/* Actions Section */}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSwitchAccount} className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Switch Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  )
}