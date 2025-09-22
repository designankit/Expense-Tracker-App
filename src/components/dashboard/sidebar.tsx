"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  PiggyBank,
  CreditCard
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSupabase } from "@/components/supabase-provider"
import { usePathname } from "next/navigation"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  onToggle?: () => void
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Transactions",
    icon: CreditCard,
    url: "/transactions",
  },
  {
    title: "Saving Goals",
    icon: PiggyBank,
    url: "/savings",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
  },
  {
    title: "Settings",
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
  const pathname = usePathname()

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
            <div className="flex items-center justify-center w-full">
              <span className="tracking-wide font-sans flex items-baseline gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase">
                  EXPENSIO
                </span>
                <span className="text-lg font-light text-black dark:text-white uppercase">
                  TRACKER
                </span>
              </span>
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
                        ? "bg-blue-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-r-2 border-slate-500" 
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
                      isActive ? "text-blue-600 dark:text-slate-400" : ""
                    )} />
                    {!isCollapsed && (
                      <span className={cn(
                        "truncate font-medium",
                        isActive ? "text-blue-700 dark:text-slate-300" : ""
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