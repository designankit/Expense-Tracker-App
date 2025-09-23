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
import Link from "next/link"

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
          "flex h-full w-full flex-col bg-emerald-50 dark:bg-gray-900 border-r border-emerald-200/40 dark:border-gray-800/60 transition-all duration-300 backdrop-blur-sm",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-emerald-200/40 dark:border-gray-800/60">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <span className="tracking-wide font-sans flex items-baseline gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent uppercase">
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
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3 h-10 rounded-xl group transition-all duration-200",
                      isCollapsed ? "px-2" : "px-3",
                      isActive 
                        ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400" 
                        : "text-emerald-800 hover:bg-emerald-100/60 hover:text-emerald-900 dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-white"
                    )}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                    <item.icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-white" : "text-emerald-700 group-hover:text-emerald-800 dark:text-gray-400 dark:group-hover:text-white"
                    )} />
                    {!isCollapsed && (
                      <span className={cn(
                        "truncate font-medium",
                        isActive ? "text-white" : "group-hover:text-emerald-900 dark:text-gray-300 dark:group-hover:text-white"
                      )}>{item.title}</span>
                    )}
                    </Link>
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