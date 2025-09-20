"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  PiggyBank
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSupabase } from "@/components/supabase-provider"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { getLocalizedText } from "@/lib/user-preferences"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  onToggle?: () => void
}

const getNavigationItems = (language: string) => [
  {
    title: getLocalizedText('nav.dashboard', language),
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: getLocalizedText('nav.expenses', language),
    icon: Receipt,
    url: "/expenses",
  },
  {
    title: getLocalizedText('nav.savings', language),
    icon: PiggyBank,
    url: "/savings",
  },
  {
    title: getLocalizedText('nav.analytics', language),
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: getLocalizedText('nav.settings', language),
    icon: Settings,
    url: "/settings",
  },
]

export function Sidebar({ 
  className, 
  isCollapsed = false, 
  onToggle,
  ...props 
}: SidebarProps) {
  const { user } = useSupabase()
  const { preferences } = useUserPreferences()
  const pathname = usePathname()
  
  const navigationItems = getNavigationItems(preferences.language)

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex h-full w-full flex-col bg-background border-r border-border/50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="font-semibold text-foreground">Expensio</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <Tooltip key={item.title} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3 h-10 transition-all duration-200",
                      isCollapsed ? "px-2" : "px-3",
                      isActive 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = item.url
                      }
                    }}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : ""
                    )} />
                    {!isCollapsed && (
                      <span className={cn(
                        "truncate font-medium",
                        isActive ? "text-blue-700 dark:text-blue-300" : ""
                      )}>{item.title}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-3 sm:p-4 border-t border-border/50">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto">
                    <span className="text-white text-sm font-medium">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{user.user_metadata?.full_name || user.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}